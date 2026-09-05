import type { GameEntity } from '../ecs/world'
import type { SystemContext } from './context'

/**
 * Задержка выстрела: снаряд существует сразу (для отклика UI), но стоит на месте
 * у стрелка, пока не истечёт fuse. По истечении задаются начальные скорости.
 */
export function fuseSystem(ctx: SystemContext, delta: number): void {
  const armed: GameEntity[] = []
  for (const entity of ctx.world.with('projectile', 'fuse')) {
    const fuse = (entity.fuse ?? 0) - delta
    if (fuse <= 0) armed.push(entity)
    else entity.fuse = fuse
  }

  for (const entity of armed) {
    ctx.world.removeComponent(entity, 'fuse')
    const { position, velocity } = entity
    if (!position || !velocity) continue
    const dest = entity.targetPoint ?? entity.target?.position
    if (!dest) continue
    const dx = dest.x - position.x
    const dy = dest.y - position.y
    const dist = Math.hypot(dx, dy) || 1
    const speed = ctx.metrics.current.projectileSpeed
    velocity.x = (dx / dist) * speed
    velocity.y = (dy / dist) * speed
  }
}
