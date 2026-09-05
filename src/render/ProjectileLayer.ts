import { Container, Texture } from 'pixi.js'
import type { Metrics } from '../core/metrics'
import type { GameEntity, GameWorld } from '../ecs/world'
import { ProjectileView } from './ProjectileView'

/** Слой снарядов: жизненный цикл вью подписан на добавление/удаление сущностей мира. */
export class ProjectileLayer {
  private readonly container = new Container()
  private readonly views = new Map<GameEntity, ProjectileView>()

  constructor(
    parent: Container,
    world: GameWorld,
    private metrics: Metrics,
    glowTexture: Texture,
  ) {
    parent.addChild(this.container)
    world.onEntityAdded.subscribe((entity) => {
      if (!entity.projectile) return
      const view = new ProjectileView(entity, this.metrics, glowTexture)
      this.views.set(entity, view)
      this.container.addChild(view)
    })
    world.onEntityRemoved.subscribe((entity) => {
      const view = this.views.get(entity)
      if (!view) return
      this.views.delete(entity)
      view.destroyView()
    })
  }

  update(delta: number, metrics: Metrics): void {
    this.metrics = metrics
    for (const [entity, view] of this.views) view.sync(entity, delta, metrics)
  }

  applyMetrics(metrics: Metrics): void {
    this.metrics = metrics
    for (const view of this.views.values()) view.applyMetrics(metrics)
  }
}
