import type { GameEntity } from '../ecs/world'
import { removeAll, type SystemContext } from './context'

/** Враги, дошедшие до нижней зоны, убывают из мира и наносят урон (через событие). */
export function escapeSystem(ctx: SystemContext): void {
  const metrics = ctx.metrics.current
  const limit = metrics.height - metrics.removeZone
  const escaped: GameEntity[] = []

  for (const entity of ctx.world.with('armor', 'position')) {
    if ((entity.position as { y: number }).y > limit) escaped.push(entity)
  }

  for (const entity of escaped) {
    ctx.bus.emit('enemy:escaped', {
      x: (entity.position as { x: number }).x,
      y: (entity.position as { y: number }).y,
      kind: entity.enemyKind as 'simple' | 'heavy' | 'boss',
    })
  }
  removeAll(ctx.world, escaped)
}
