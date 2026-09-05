import type { GameEntity } from '../ecs/world'
import type { Player } from '../core/types'
import { removeAll, type SystemContext } from './context'

/** Промахи: снаряд без цели долетает до точки и рассыпается. */
export function missSystem(ctx: SystemContext): void {
  const metrics = ctx.metrics.current
  const dead: GameEntity[] = []
  const misses: { x: number; y: number; player: Player }[] = []

  for (const entity of ctx.world.with('projectile', 'targetPoint', 'position', 'velocity')) {
    const point = entity.targetPoint as { x: number; y: number }
    const position = entity.position as { x: number; y: number }
    const dist = Math.hypot(point.x - position.x, point.y - position.y)
    if (dist < metrics.projectileMissRadius) {
      misses.push({ x: point.x, y: point.y, player: entity.player as Player })
      dead.push(entity)
    }
  }

  removeAll(ctx.world, dead)
  for (const miss of misses) ctx.bus.emit('projectile:miss', miss)
}
