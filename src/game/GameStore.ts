import { gameConfig } from '../config/gameConfig'
import { PlayerStats } from './PlayerStats'

export type GamePhase = 'start' | 'playing' | 'gameover'

/**
 * Скалярное состояние партии (счёт, жизни, фаза). По договорённости — не сущности,
 * как и в старом плане рефакторинга: это переменные партии, а не объекты мира.
 */
export class GameStore {
  phase: GamePhase = 'start'
  score = gameConfig.game.startScore
  lives = gameConfig.game.startLives
  readonly stats = new PlayerStats()

  /** Экранная тряска — тоже скаляр, но её чистит симуляция каждый кадр. */
  readonly shake = { timer: 0, amount: 0 }

  reset(): void {
    this.phase = 'playing'
    this.score = gameConfig.game.startScore
    this.lives = gameConfig.game.startLives
    this.stats.reset()
    this.shake.timer = 0
    this.shake.amount = 0
  }

  triggerShake(amount: number, durationFrames: number): void {
    this.shake.amount = amount
    this.shake.timer = durationFrames
  }

  updateShake(deltaFrames: number): void {
    if (this.shake.timer <= 0) return
    this.shake.timer -= deltaFrames
    this.shake.amount *= Math.pow(0.9, deltaFrames)
  }
}
