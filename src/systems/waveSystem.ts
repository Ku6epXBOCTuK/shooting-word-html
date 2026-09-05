import { gameConfig } from '../config/gameConfig'
import { enemiesPerWave, spawnEnemy } from '../ecs/spawn'
import type { SystemContext } from './context'

/** Волны: таймеры спавна, пауза между волнами, боссы. */
export function waveSystem(ctx: SystemContext, delta: number): void {
  const ws = ctx.world.with('waveState').first?.waveState
  if (!ws) return
  const cfg = gameConfig.game
  const metrics = ctx.metrics.current

  if (ws.pauseActive) {
    ws.pauseTimer -= delta
    if (ws.pauseTimer <= 0) {
      ws.pauseActive = false
      ws.banner = null
      ws.enemiesLeft = enemiesPerWave(ws.wave)
      if (ws.wave % cfg.bossEveryNthWave === 0) {
        spawnEnemy(ctx.world, ctx.spawn, 'boss', metrics, ws.wave)
      }
    }
    return
  }

  if (ws.enemiesLeft > 0) {
    ws.spawnTimer += delta
    const spawnInterval = cfg.waveInterval / enemiesPerWave(ws.wave)
    if (ws.spawnTimer >= spawnInterval) {
      ws.spawnTimer = 0
      ws.enemiesLeft--
      const heavyChance = cfg.heavyEnemyChanceBase + ws.wave * cfg.heavyEnemyChancePerWave
      spawnEnemy(ctx.world, ctx.spawn, Math.random() < heavyChance ? 'heavy' : 'simple', metrics, ws.wave)
    }
  }

  ws.waveTimer += delta
  if (ws.waveTimer >= cfg.waveInterval && ws.enemiesLeft <= 0) {
    ws.wave++
    ws.waveTimer = 0
    ws.pauseActive = true
    ws.pauseTimer = metrics.wavePauseFrames
    const isBoss = ws.wave % cfg.bossEveryNthWave === 0
    ws.banner = {
      text: isBoss ? gameConfig.texts.bossIncoming : `WAVE ${ws.wave} INCOMING`,
      isBoss,
    }
    ctx.bus.emit('wave:changed', { wave: ws.wave })
  }
}
