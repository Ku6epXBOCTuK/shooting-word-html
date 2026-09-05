import type { SystemContext } from './context'

/** Интеграция движения для всех сущностей с позицией и скоростью (враги, снаряды, частицы). */
export function integrationSystem(ctx: SystemContext, delta: number): void {
  for (const entity of ctx.world.with('position', 'velocity')) {
    const position = entity.position as { x: number; y: number }
    const velocity = entity.velocity as { x: number; y: number }
    position.x += velocity.x * delta
    position.y += velocity.y * delta
    const damping = entity.damping
    if (damping) {
      const k = Math.pow(damping.factor, delta)
      velocity.x *= k
      velocity.y *= k
    }
  }
}
