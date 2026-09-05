import type { GameEntity } from '../ecs/world'
import { removeAll, type SystemContext } from './context'

/** Частицы: затухание жизни, удаление отживших. */
export function lifetimeSystem(ctx: SystemContext, delta: number): void {
  const dead: GameEntity[] = []
  for (const entity of ctx.world.with('lifetime')) {
    const lifetime = entity.lifetime as { remaining: number; decay: number }
    lifetime.remaining -= lifetime.decay * delta
    if (lifetime.remaining <= 0) dead.push(entity)
  }
  removeAll(ctx.world, dead)
}
