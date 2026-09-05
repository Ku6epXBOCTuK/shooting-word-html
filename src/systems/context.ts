import type { EventBus } from '../core/eventBus'
import type { MetricsStore } from '../core/metrics'
import type { SpawnDependencies } from '../ecs/spawn'
import type { GameEntity, GameWorld } from '../ecs/world'
import type { GameEvents } from '../game/events'
import type { GameStore } from '../game/GameStore'

/** Общий контекст, который получают все системы за кадр. */
export type SystemContext = {
  world: GameWorld
  store: GameStore
  bus: EventBus<GameEvents>
  metrics: MetricsStore
  spawn: SpawnDependencies
}

/** Сущности, запланированные к удалению внутри системы, удаляются после обхода запроса. */
export function removeAll(world: GameWorld, entities: GameEntity[]): void {
  for (const entity of entities) world.remove(entity)
}
