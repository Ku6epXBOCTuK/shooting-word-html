import type { InputOrigin, Player } from '../core/types'
import type { EnemyKind } from '../ecs/components'
import type { GameEntity } from '../ecs/world'

/** Все события приложения. Логика издаёт, рендер и DOM-UI слушают. */
export type GameEvents = {
  // ввод
  'input:start': { origin: InputOrigin }
  'input:word': { word: string; player: Player; origin: InputOrigin }
  'input:cleared': Record<string, never>
  // бой
  'projectile:hit': { entity: GameEntity; target: GameEntity; word: string; player: Player }
  'projectile:miss': { x: number; y: number; player: Player }
  'enemy:hit': { entity: GameEntity }
  'enemy:destroyed': { entity: GameEntity; x: number; y: number; kind: EnemyKind }
  'enemy:escaped': { x: number; y: number; kind: EnemyKind }
  // состояние игры
  'game:started': Record<string, never>
  'game:over': { finalScore: number; stats: PlayerStatsSnapshot }
  'score:changed': { score: number }
  'wave:changed': { wave: number }
  'player:damaged': { lives: number }
  // эффекты (не сущности)
  'effect:glitch': { durationMs: number }
}

export type PlayerStatsSnapshot = {
  top: { name: string; kills: number }[]
  mazila: { name: string; misses: number } | null
}
