import type { Player } from '../core/types'
import type { PlayerStatsSnapshot } from './events'

/** Статистика зрителей: убийства и промахи по именам. */
export class PlayerStats {
  private readonly entries = new Map<string, { kills: number; misses: number }>()

  reset(): void {
    this.entries.clear()
  }

  addKill(player: Player): void {
    this.entry(player).kills++
  }

  addMiss(player: Player): void {
    this.entry(player).misses++
  }

  /** Топ-3 по убийствам и главный «Мазила» по промахам. */
  snapshot(): PlayerStatsSnapshot {
    const names = [...this.entries.keys()]
    const byKills = names.slice().sort((a, b) => this.entries.get(b)!.kills - this.entries.get(a)!.kills)
    const top = byKills.slice(0, 3).map((name) => ({ name, kills: this.entries.get(name)!.kills }))

    let mazila: PlayerStatsSnapshot['mazila'] = null
    for (const name of names) {
      const { misses } = this.entries.get(name)!
      if (misses > 0 && (!mazila || misses > mazila.misses)) {
        mazila = { name, misses }
      }
    }
    return { top, mazila }
  }

  private entry(player: Player): { kills: number; misses: number } {
    let entry = this.entries.get(player.name)
    if (!entry) {
      entry = { kills: 0, misses: 0 }
      this.entries.set(player.name, entry)
    }
    return entry
  }
}
