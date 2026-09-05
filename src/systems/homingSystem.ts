import type { GameEntity } from '../ecs/world'
import type { Player } from '../core/types'
import { removeAll, type SystemContext } from './context'

type HitInfo = { entity: GameEntity; target: GameEntity; word: string; player: Player }

/** Наведение: снаряд доворачивает к цели, при касании издаёт событие попадания. */
export function homingSystem(ctx: SystemContext): void {
  const metrics = ctx.metrics.current
  const dead: GameEntity[] = []
  const hits: HitInfo[] = []

  for (const entity of ctx.world.with('projectile', 'target', 'position', 'velocity')) {
    const target = entity.target as GameEntity
    const position = entity.position as { x: number; y: number }
    const velocity = entity.velocity as { x: number; y: number }

    if (!ctx.world.has(target)) {
      dead.push(entity)
      continue
    }

    const dx = (target.position as { x: number; y: number }).x - position.x
    const dy = (target.position as { x: number; y: number }).y - position.y
    const dist = Math.hypot(dx, dy)
    if (dist > 0) {
      velocity.x = (dx / dist) * metrics.projectileSpeed
      velocity.y = (dy / dist) * metrics.projectileSpeed
    }
    if (dist < metrics.projectileHitRadius) {
      hits.push({ entity, target, word: entity.projectile?.word ?? '', player: entity.player as Player })
      dead.push(entity)
    }
  }

  removeAll(ctx.world, dead)
  for (const hit of hits) ctx.bus.emit('projectile:hit', hit)
}
