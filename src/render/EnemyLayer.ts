import { Container, Texture } from 'pixi.js'
import type { TextMeasurer } from '../core/CanvasTextMeasurer'
import type { Metrics } from '../core/metrics'
import type { GameEntity, GameWorld } from '../ecs/world'
import type { GameEvents } from '../game/events'
import type { EventBus } from '../core/eventBus'
import { EnemyView } from './EnemyView'

/**
 * Слой врагов. Медленные враги рисуются поверх быстрых (zIndex по скорости),
 * как сортировка по speed в оригинале.
 */
export class EnemyLayer {
  private readonly container = new Container()
  private readonly views = new Map<GameEntity, EnemyView>()

  constructor(
    parent: Container,
    world: GameWorld,
    bus: EventBus<GameEvents>,
    private metrics: Metrics,
    measurer: TextMeasurer,
    glowTexture: Texture,
  ) {
    this.container.sortableChildren = true
    parent.addChild(this.container)

    world.onEntityAdded.subscribe((entity) => {
      if (!entity.armor) return
      const view = new EnemyView(entity, this.metrics, measurer, glowTexture)
      view.zIndex = -(entity.velocity?.y ?? 0)
      this.views.set(entity, view)
      this.container.addChild(view)
    })
    world.onEntityRemoved.subscribe((entity) => {
      const view = this.views.get(entity)
      if (!view) return
      this.views.delete(entity)
      view.destroyView()
    })
    bus.on('enemy:hit', ({ entity }) => {
      this.views.get(entity)?.onHit(this.metrics)
    })
  }

  update(delta: number, metrics: Metrics, wave: number): void {
    this.metrics = metrics
    for (const [entity, view] of this.views) view.sync(entity, delta, metrics, wave)
  }

  applyMetrics(metrics: Metrics): void {
    this.metrics = metrics
    for (const view of this.views.values()) view.applyMetrics(metrics)
  }
}
