import { gameConfig } from '../config/gameConfig'
import type { WordDictionary } from '../config/words'
import type { TextMeasurer } from '../core/CanvasTextMeasurer'
import { framesFromMs, type Metrics } from '../core/metrics'
import type { Player } from '../core/types'
import type { EnemyKind, TargetPoint } from './components'
import type { GameEntity, GameWorld } from './world'

/** Отступ текста внутри рамки врага (в старом коде — фиксированные 24px). */
const ENEMY_BOX_PAD = 24

export type SpawnDependencies = {
  words: WordDictionary
  measurer: TextMeasurer
}

/** Время пересечения экрана врагом (сек) с разгоном по волнам. */
export function enemyCrossTime(kind: 'slow' | 'fast' | 'boss', wave: number): number {
  const S = gameConfig.speed
  if (kind === 'slow') {
    const t = Math.min(wave / S.slowEnemyCrossTimeCapWave, 1)
    return S.slowEnemyCrossTimeStart - (S.slowEnemyCrossTimeStart - S.slowEnemyCrossTimeCap) * t
  }
  if (kind === 'fast') {
    const t = Math.min(wave / S.fastEnemyCrossTimeCapWave, 1)
    return S.fastEnemyCrossTimeStart - (S.fastEnemyCrossTimeStart - S.fastEnemyCrossTimeCap) * t
  }
  return S.bossCrossTime
}

export function crossTimeToSpeed(crossTimeSec: number, metrics: Metrics): number {
  const playHeight = metrics.height - metrics.removeZone
  return playHeight / (crossTimeSec * 60)
}

function armorLayers(words: WordDictionary, kind: EnemyKind): string[][] {
  if (kind === 'boss') {
    return Array.from({ length: gameConfig.game.bossLayers }, () =>
      Array.from({ length: gameConfig.game.bossWordsPerLayer }, () => words.simple()),
    )
  }
  if (kind === 'heavy') {
    return words.heavyPair().map((word) => [word])
  }
  return [[words.simple()]]
}

function enemyWidth(
  kind: EnemyKind,
  layers: string[][],
  metrics: Metrics,
  measurer: TextMeasurer,
): number {
  if (kind === 'boss') {
    const font = Math.round(metrics.enemyHeavyFont * metrics.bossFontSizeFactor)
    return Math.max(
      ...layers.map((layer) => {
        const textWidth = layer.reduce((sum, word) => sum + measurer.measure(word, font, true), 0)
        return textWidth + (layer.length - 1) * gameConfig.ratio.bossWordGap
      }),
    )
  }
  const font = kind === 'heavy' ? metrics.enemyHeavyFont : metrics.enemySimpleFont
  return Math.max(...layers.flat().map((word) => measurer.measure(word, font, true)))
}

export function enemyHeight(kind: EnemyKind, metrics: Metrics): number {
  if (kind === 'boss') return Math.round(metrics.enemyHeavyHeight * metrics.bossHeightFactor)
  return kind === 'heavy' ? metrics.enemyHeavyHeight : metrics.enemySimpleHeight
}

export function spawnEnemy(
  world: GameWorld,
  deps: SpawnDependencies,
  kind: EnemyKind,
  metrics: Metrics,
  wave: number,
): GameEntity {
  const layers = armorLayers(deps.words, kind)
  const width = Math.round(enemyWidth(kind, layers, metrics, deps.measurer)) + ENEMY_BOX_PAD
  const height = enemyHeight(kind, metrics)
  const speed = crossTimeToSpeed(enemyCrossTime(kind === 'boss' ? 'boss' : kind === 'heavy' ? 'slow' : 'fast', wave), metrics)

  const minX = metrics.enemyPaddingX + width / 2
  const maxX = metrics.width - metrics.enemyPaddingX - width / 2
  const spawnX = minX + Math.random() * Math.max(0, maxX - minX)

  return world.add({
    enemyKind: kind,
    enemyBox: { width, height },
    armor: { layers, layerIndex: 0, killed: [] },
    position: { x: spawnX, y: 0 },
    velocity: { x: 0, y: speed },
  })
}

export function missTargetPoint(metrics: Metrics): TargetPoint {
  return {
    x: metrics.missTargetPadX + Math.random() * (metrics.width - 2 * metrics.missTargetPadX),
    y: metrics.missTargetPadY + Math.random() * metrics.height * metrics.missTargetYRange,
  }
}

export function spawnProjectile(
  world: GameWorld,
  word: string,
  target: GameEntity | null,
  player: Player,
  metrics: Metrics,
): GameEntity {
  const entity: GameEntity = {
    projectile: { word },
    player,
    position: { x: metrics.width / 2, y: metrics.height - metrics.shooterOffset },
    velocity: { x: 0, y: 0 },
    fuse: framesFromMs(metrics.inputShootDelayMs),
  }
  if (target) {
    entity.target = target
  } else {
    entity.targetPoint = missTargetPoint(metrics)
  }
  return world.add(entity)
}

export function spawnParticleBurst(
  world: GameWorld,
  metrics: Metrics,
  x: number,
  y: number,
  color: string,
  count: number,
): void {
  for (let i = 0; i < count; i++) {
    world.add({
      position: { x, y },
      velocity: {
        x: (Math.random() - 0.5) * metrics.particleVel,
        y: (Math.random() - 0.5) * metrics.particleVel,
      },
      damping: { factor: metrics.particleDamping },
      lifetime: {
        remaining: 1,
        decay: metrics.particleDecayBase + Math.random() * metrics.particleDecayRange,
      },
      particle: {
        size: metrics.particleSizeMin + Math.random() * (metrics.particleSizeMax - metrics.particleSizeMin),
        color,
      },
    })
  }
}

export function createWaveState(world: GameWorld, wave: number, enemiesLeft: number): GameEntity {
  return world.add({
    waveState: {
      wave,
      enemiesLeft,
      spawnTimer: 0,
      waveTimer: 0,
      pauseActive: false,
      pauseTimer: 0,
      banner: null,
    },
  })
}

export function enemiesPerWave(wave: number): number {
  return gameConfig.game.enemiesPerWaveBase + (wave - 1) * gameConfig.game.enemiesPerWaveInc
}
