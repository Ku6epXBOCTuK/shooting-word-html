import { removeAll, type SystemContext } from './context'

/** Снаряды, улетевшие за экран. */
export function cullSystem(ctx: SystemContext): void {
  const metrics = ctx.metrics.current
  const margin = metrics.shooterOffset
  const dead = []
  for (const entity of ctx.world.with('projectile', 'position')) {
    const { x, y } = entity.position as { x: number; y: number }
    if (x < -margin || x > metrics.width + margin || y < -margin || y > metrics.height + margin) {
      dead.push(entity)
    }
  }
  removeAll(ctx.world, dead)
}
