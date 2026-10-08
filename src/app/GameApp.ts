import { gameConfig } from '../config/gameConfig'
import { defaultWordDictionary } from '../config/words'
import { EventBus } from '../core/eventBus'
import { GameClock } from '../core/GameClock'
import { CanvasTextMeasurer } from '../core/CanvasTextMeasurer'
import { MetricsStore } from '../core/metrics'
import { createGameWorld } from '../ecs/world'
import { Simulation } from '../game/Simulation'
import { GameStore } from '../game/GameStore'
import type { GameEvents } from '../game/events'
import { InputRouter } from '../input/InputRouter'
import { LocalKeyboardInputSource } from '../input/sources/LocalKeyboardInputSource'
import { TwitchChatInputSource } from '../input/sources/TwitchChatInputSource'
import { Renderer } from '../render/Renderer'
import { HudController } from '../ui/HudController'
import { InputFeedbackController } from '../ui/InputFeedbackController'
import { OverlayScaler } from '../ui/OverlayScaler'
import { ScreensController } from '../ui/ScreensController'

export type GameSettings = {
  channel: string
  singlePlay: boolean
}

/**
 * Точка сборки приложения: связывает симуляцию, рендер, ввод и DOM-UI.
 * Логика тут только оркестрационная — фазы игры, таймеры экранов, такт.
 */
export async function bootstrapGame(canvas: HTMLCanvasElement): Promise<void> {
  const params = new URLSearchParams(window.location.search)
  const settings: GameSettings = {
    channel: params.get('channel') || 'ku6epxboctuk',
    singlePlay: params.get('singlePlay') === '1',
  }

  const bus = new EventBus<GameEvents>()
  const metricsStore = new MetricsStore(gameConfig)
  const world = createGameWorld()
  const store = new GameStore()
  const clock = new GameClock()
  const measurer = new CanvasTextMeasurer()

  const simulation = new Simulation({ world, store, bus, metrics: metricsStore, spawn: { words: defaultWordDictionary, measurer } })
  const renderer = await Renderer.create(canvas, metricsStore, world, bus, measurer)

  new HudController(bus)
  const screens = new ScreensController(bus)
  const inputFeedback = new InputFeedbackController(bus)
  const scaler = new OverlayScaler()

  const localSource = new LocalKeyboardInputSource(settings.channel)
  const router = new InputRouter([new TwitchChatInputSource(settings.channel), localSource], bus)
  router.start()
  inputFeedback.bindBuffer(localSource)

  const intro = renderer.intro
  let gameOverTimer: number | null = null

  const clearGameOverTimer = (): void => {
    if (gameOverTimer !== null) {
      clearTimeout(gameOverTimer)
      gameOverTimer = null
    }
  }

  const startIntro = (): void => {
    intro.start()
    clock.start()
  }

  intro.onFinish = () => {
    // В простое такт не нужен — canvas сохраняет последний кадр.
    if (store.phase !== 'playing') clock.stop()
  }

  bus.on('input:start', () => {
    if (intro.active || store.phase === 'playing') return
    clearGameOverTimer()
    intro.hide()
    simulation.start()
    clock.start()
  })

  bus.on('input:word', ({ word, player }) => {
    if (intro.active || store.phase !== 'playing') return
    simulation.submitWord(word, player)
  })

  bus.on('game:over', () => {
    clearGameOverTimer()
    gameOverTimer = window.setTimeout(() => {
      gameOverTimer = null
      screens.hideAll()
      if (settings.singlePlay) {
        document.body.classList.add('hidden')
        clock.stop()
      } else {
        startIntro()
      }
    }, gameConfig.game.gameOverDelay)
  })

  clock.add((delta) => {
    if (intro.active) intro.update(delta)
    if (store.phase === 'playing') simulation.update(delta)
    renderer.update(delta, world, store)
    renderer.render()
  })

  window.addEventListener('resize', () => {
    const width = window.innerWidth
    const height = window.innerHeight
    metricsStore.rebuild(width, height)
    renderer.resize(width, height)
    scaler.apply(metricsStore.current)
    if (!clock.isRunning()) renderer.render()
  })

  scaler.apply(metricsStore.current)
  startIntro()

  // Отладочный хук: в OBS можно открыть консоль и посмотреть состояние мира.
  ;(window as unknown as Record<string, unknown>).__sw = { world, store, bus, metrics: metricsStore, renderer }
}
