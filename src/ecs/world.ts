import { World } from 'miniplex'
import type {
  Armor,
  Damping,
  EnemyBox,
  EnemyKind,
  Lifetime,
  ParticleVisual,
  Position,
  ProjectilePayload,
  TargetPoint,
  Velocity,
  WaveState,
} from './components'
import type { Player } from '../core/types'

/**
 * Сущность — набор опциональных компонентов. Наличие компонента определяется
 * тем, что свойство не undefined (так работает miniplex), поэтому «нет компонента»
 * означает «свойство не установлено».
 */
export type GameEntity = {
  position?: Position
  velocity?: Velocity
  damping?: Damping
  lifetime?: Lifetime
  enemyKind?: EnemyKind
  enemyBox?: EnemyBox
  armor?: Armor
  projectile?: ProjectilePayload
  player?: Player
  /** Цель наведения (только для снарядов-попаданий). */
  target?: GameEntity
  /** Точка полёта мимо (только для снарядов-промахов). */
  targetPoint?: TargetPoint
  /** Кадры до «выстрела» (задержка ввода). */
  fuse?: number
  particle?: ParticleVisual
  waveState?: WaveState
}

export type GameWorld = World<GameEntity>

export function createGameWorld(): GameWorld {
  return new World<GameEntity>()
}
