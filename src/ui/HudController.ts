import { gameConfig } from '../config/gameConfig'
import type { EventBus } from '../core/eventBus'
import type { GameEvents } from '../game/events'
import { requiredElement } from './dom'

/** HUD: счёт, волна, жизни. */
export class HudController {
  private readonly scoreEl = requiredElement('score')
  private readonly waveEl = requiredElement('wave')
  private readonly livesEl = requiredElement('lives')

  constructor(bus: EventBus<GameEvents>) {
    bus.on('game:started', () => this.reset())
    bus.on('score:changed', ({ score }) => {
      this.scoreEl.textContent = String(score)
    })
    bus.on('wave:changed', ({ wave }) => {
      this.waveEl.textContent = String(wave)
    })
    bus.on('player:damaged', ({ lives }) => {
      this.livesEl.textContent = formatLives(lives)
    })
  }

  reset(): void {
    this.scoreEl.textContent = String(gameConfig.game.startScore)
    this.waveEl.textContent = String(gameConfig.game.startWave)
    this.livesEl.textContent = formatLives(gameConfig.game.startLives)
  }
}

function formatLives(lives: number): string {
  const clamped = Math.max(0, lives)
  const lost = gameConfig.game.startLives - clamped
  return '♡'.repeat(Math.max(0, lost)) + '♥'.repeat(clamped)
}
