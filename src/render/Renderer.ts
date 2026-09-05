import { Application, Container } from 'pixi.js'
import type { TextMeasurer } from '../core/CanvasTextMeasurer'
import type { MetricsStore } from '../core/metrics'
import type { GameWorld } from '../ecs/world'
import type { GameStore } from '../game/GameStore'
import type { EventBus } from '../core/eventBus'
import type { GameEvents } from '../game/events'
import { BannerLayer } from './BannerLayer'
import { EnemyLayer } from './EnemyLayer'
import { GridLayer } from './GridLayer'
import { IntroSequence } from './IntroSequence'
import { ParticleLayer } from './ParticleLayer'
import { PlayerView } from './PlayerView'
import { ProjectileLayer } from './ProjectileLayer'
import { createGlowTexture } from './textures'

/**
 * Pixi-рендер: инициализация приложения, слои в порядке отрисовки,
 * тряска экрана и рендер по внешнему такту (GameClock), а не через свой ticker.
 */
export class Renderer {
  readonly app = new Application()
  readonly intro: IntroSequence

  private readonly root = new Container()
  private readonly grid: GridLayer
  private readonly particles: ParticleLayer
  private readonly projectiles: ProjectileLayer
  private readonly enemies: EnemyLayer
  private readonly player: PlayerView
  private readonly banner: BannerLayer

  private constructor(
    private readonly metricsStore: MetricsStore,
    world: GameWorld,
    bus: EventBus<GameEvents>,
    measurer: TextMeasurer,
  ) {
    const metrics = metricsStore.current
    const glowTexture = createGlowTexture()

    this.app.stage.addChild(this.root)
    this.grid = new GridLayer(this.root)
    this.particles = new ParticleLayer(this.root, world)
    this.projectiles = new ProjectileLayer(this.root, world, metrics, glowTexture)
    this.enemies = new EnemyLayer(this.root, world, bus, metrics, measurer, glowTexture)
    this.player = new PlayerView(this.root, glowTexture)
    this.banner = new BannerLayer(this.root, glowTexture)
    this.intro = new IntroSequence(this.root, metrics, glowTexture)

    this.grid.applyMetrics(metrics)
    this.player.applyMetrics(metrics)
    this.banner.applyMetrics(metrics)
    this.intro.applyMetrics(metrics)
  }

  static async create(
    canvas: HTMLCanvasElement,
    metricsStore: MetricsStore,
    world: GameWorld,
    bus: EventBus<GameEvents>,
    measurer: TextMeasurer,
  ): Promise<Renderer> {
    const metrics = metricsStore.current
    const renderer = new Renderer(metricsStore, world, bus, measurer)
    await renderer.app.init({
      canvas,
      width: metrics.width,
      height: metrics.height,
      backgroundColor: 0x000000,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
      powerPreference: 'high-performance',
    })
    // Рендерим вручную из GameClock — pixi-ticker не нужен.
    renderer.app.ticker.stop()
    return renderer
  }

  update(delta: number, world: GameWorld, store: GameStore): void {
    const metrics = this.metricsStore.current
    this.grid.update(delta, metrics)
    this.particles.update(world)
    this.projectiles.update(delta, metrics)
    const wave = world.with('waveState').first?.waveState?.wave ?? 1
    this.enemies.update(delta, metrics, wave)
    this.banner.update(world, metrics)

    if (store.shake.timer > 0) {
      this.root.position.set(
        (Math.random() - 0.5) * store.shake.amount,
        (Math.random() - 0.5) * store.shake.amount,
      )
    } else {
      this.root.position.set(0, 0)
    }
  }

  render(): void {
    this.app.render()
  }

  resize(width: number, height: number): void {
    this.app.renderer.resize(width, height)
    const metrics = this.metricsStore.current
    this.grid.applyMetrics(metrics)
    this.player.applyMetrics(metrics)
    this.banner.applyMetrics(metrics)
    this.projectiles.applyMetrics(metrics)
    this.enemies.applyMetrics(metrics)
    this.intro.applyMetrics(metrics)
  }
}
