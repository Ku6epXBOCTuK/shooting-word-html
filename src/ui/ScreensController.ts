import { gameConfig } from '../config/gameConfig'
import type { EventBus } from '../core/eventBus'
import type { GameEvents } from '../game/events'
import { requiredElement } from './dom'
import { renderPlayerStats } from './PlayerStatsView'

/** Экраны и оверлеи: старт, поражение, glitch-эффект. */
export class ScreensController {
  private readonly container = requiredElement('game-container')
  private readonly startScreen = requiredElement('start-screen')
  private readonly gameoverScreen = requiredElement('gameover-screen')
  private readonly gameoverSubtitle = requiredElement('gameover-subtitle')
  private readonly finalScore = requiredElement('final-score')
  private readonly uiOverlay = requiredElement('ui-overlay')
  private readonly inputChat = requiredElement('input-chat')
  private readonly playerStats = requiredElement('player-stats')
  private glitchTimer: number | null = null

  constructor(bus: EventBus<GameEvents>) {
    requiredElement('start-subtitle').textContent = gameConfig.texts.startSubtitle
    requiredElement('gameover-title').textContent = gameConfig.texts.gameOverTitle
    this.gameoverSubtitle.textContent = gameConfig.texts.gameOverSubtitle

    bus.on('game:started', () => this.showGame())
    bus.on('game:over', ({ finalScore, stats }) => this.showGameOver(finalScore, stats))
    bus.on('effect:glitch', ({ durationMs }) => this.glitch(durationMs))
  }

  showGame(): void {
    this.startScreen.classList.add('hidden')
    this.gameoverScreen.classList.add('hidden')
    this.uiOverlay.classList.remove('hidden')
    this.inputChat.classList.remove('hidden')
  }

  showGameOver(finalScore: number, stats: import('../game/events').PlayerStatsSnapshot): void {
    this.finalScore.textContent = String(finalScore)
    renderPlayerStats(this.playerStats, stats)
    this.gameoverScreen.classList.remove('hidden')
    this.gameoverSubtitle.classList.add('hidden')
  }

  /** Скрывается после паузы с таблицей результатов (таймер ведёт GameApp). */
  hideAll(): void {
    this.gameoverScreen.classList.add('hidden')
    this.uiOverlay.classList.add('hidden')
    this.inputChat.classList.add('hidden')
  }

  private glitch(durationMs: number): void {
    this.container.classList.add('glitch')
    if (this.glitchTimer !== null) clearTimeout(this.glitchTimer)
    this.glitchTimer = window.setTimeout(() => {
      this.container.classList.remove('glitch')
      this.glitchTimer = null
    }, durationMs)
  }
}
