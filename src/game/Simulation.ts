import { gameConfig } from '../config/gameConfig'
import {
  createWaveState,
  enemiesPerWave,
  spawnParticleBurst,
  spawnProjectile,
} from '../ecs/spawn'
import type { EnemyKind } from '../ecs/components'
import type { GameEntity } from '../ecs/world'
import type { Player } from '../core/types'
import type { SystemContext } from '../systems/context'
import { cullSystem } from '../systems/cullSystem'
import { escapeSystem } from '../systems/escapeSystem'
import { fuseSystem } from '../systems/fuseSystem'
import { homingSystem } from '../systems/homingSystem'
import { integrationSystem } from '../systems/integrationSystem'
import { lifetimeSystem } from '../systems/lifetimeSystem'
import { missSystem } from '../systems/missSystem'
import { waveSystem } from '../systems/waveSystem'

function scoreByKind(kind: EnemyKind): number {
  if (kind === 'boss') return gameConfig.game.scoreBoss
  return kind === 'heavy' ? gameConfig.game.scoreHeavy : gameConfig.game.scoreSimple
}

function colorByKind(kind: EnemyKind): string {
  if (kind === 'boss') return gameConfig.colors.boss
  return kind === 'heavy' ? gameConfig.colors.heavy : gameConfig.colors.primary
}

function destroyParticleCount(kind: EnemyKind, metrics: SystemContext['metrics']['current']): number {
  if (kind === 'boss') return metrics.particleDestroyHeavy * 2
  return kind === 'heavy' ? metrics.particleDestroyHeavy : metrics.particleDestroySimple
}

/**
 * Симуляция: фиксированный порядок систем за кадр + обработка урона.
 * Ничего не знает про рендер и DOM — только мир, стор и шина событий.
 */
export class Simulation {
  constructor(private readonly ctx: SystemContext) {
    ctx.bus.on('projectile:hit', ({ target, word, player }) => this.applyHit(target, word, player))
    ctx.bus.on('projectile:miss', ({ x, y, player }) => this.applyMiss(x, y, player))
    ctx.bus.on('enemy:escaped', ({ kind }) => this.takeDamage())
  }

  /** Сброс мира и состояния партии; вызывается по команде «старт». */
  start(): void {
    const { world, store, bus } = this.ctx
    world.clear()
    createWaveState(world, gameConfig.game.startWave, enemiesPerWave(gameConfig.game.startWave))
    store.reset()
    bus.emit('game:started', {})
  }

  submitWord(word: string, player: Player): void {
    if (this.ctx.store.phase !== 'playing') return
    const target = this.findEnemyByWord(word)
    spawnProjectile(this.ctx.world, word, target, player, this.ctx.metrics.current)
  }

  update(delta: number): void {
    if (this.ctx.store.phase !== 'playing') return
    const ctx = this.ctx
    fuseSystem(ctx, delta)
    homingSystem(ctx)
    missSystem(ctx)
    waveSystem(ctx, delta)
    integrationSystem(ctx, delta)
    cullSystem(ctx)
    escapeSystem(ctx)
    lifetimeSystem(ctx, delta)
    ctx.store.updateShake(delta)
  }

  /** Первый враг, чей текущий слой содержит слово (порядок спавна — как в оригинале). */
  private findEnemyByWord(word: string): GameEntity | null {
    for (const entity of this.ctx.world.with('armor')) {
      const armor = entity.armor as { layers: string[][]; layerIndex: number; killed: string[] }
      const layer = armor.layers[armor.layerIndex]
      if (layer && layer.includes(word) && !armor.killed.includes(word)) return entity
    }
    return null
  }

  private applyHit(target: GameEntity, word: string, player: Player): void {
    const { store, bus, world, metrics } = this.ctx
    if (store.phase !== 'playing') return
    const armor = target.armor
    if (!armor || !target.position || !target.enemyKind) return
    const kind = target.enemyKind
    const { x, y } = target.position

    armor.killed.push(word)
    bus.emit('enemy:hit', { entity: target })

    const layer = armor.layers[armor.layerIndex]
    const layerComplete = !!layer && armor.killed.length >= layer.length
    if (layerComplete) {
      armor.layerIndex++
      armor.killed = []
    }
    const destroyed = layerComplete && armor.layerIndex >= armor.layers.length

    if (destroyed) {
      store.score += scoreByKind(kind)
      store.stats.addKill(player)
      bus.emit('score:changed', { score: store.score })
      bus.emit('enemy:destroyed', { entity: target, x, y, kind })
      spawnParticleBurst(world, metrics.current, x, y, colorByKind(kind), destroyParticleCount(kind, metrics.current))
      world.remove(target)
    } else {
      // попадание в броню: слой держится
      spawnParticleBurst(world, metrics.current, x, y, colorByKind(kind), metrics.current.particleArmorBreak)
      store.triggerShake(metrics.current.shakeHit, metrics.current.shakeHitDuration)
    }
  }

  private applyMiss(x: number, y: number, player: Player): void {
    const { store, world, metrics } = this.ctx
    if (store.phase !== 'playing') return
    store.stats.addMiss(player)
    store.triggerShake(metrics.current.shakeMiss, metrics.current.shakeMissDuration)
    spawnParticleBurst(world, metrics.current, x, y, gameConfig.colors.miss, metrics.current.particleMiss)
  }

  private takeDamage(): void {
    const { store, bus, metrics } = this.ctx
    if (store.phase !== 'playing') return
    store.lives--
    bus.emit('player:damaged', { lives: store.lives })
    store.triggerShake(metrics.current.shakeDamage, metrics.current.shakeDamageDuration)
    bus.emit('effect:glitch', { durationMs: metrics.current.glitchDurationMs })

    if (store.lives <= 0) {
      store.phase = 'gameover'
      bus.emit('game:over', { finalScore: store.score, stats: store.stats.snapshot() })
    }
  }
}
