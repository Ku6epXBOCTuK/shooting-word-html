import type { Player } from '../core/types'

export type Position = { x: number; y: number }

/** Скорость в пикселях за кадр (60 FPS-нормированный кадр). */
export type Velocity = { x: number; y: number }

export type Damping = { factor: number }

/** Затухание частиц: remaining -= decay * dt. */
export type Lifetime = { remaining: number; decay: number }

export type EnemyKind = 'simple' | 'heavy' | 'boss'

/**
 * Броня врага — слои слов. Отображается и уязвима только текущий слой.
 * simple — 1 слой из одного слова; heavy — 2 слоя по одному слову (порядок строгий);
 * boss — 3 слоя по 3 слова (внутри слоя порядок свободный).
 */
export type Armor = {
  layers: string[][]
  layerIndex: number
  /** Убитые слова текущего слоя. */
  killed: string[]
}

export type EnemyBox = { width: number; height: number }

export type ProjectilePayload = { word: string }

export type ParticleVisual = { size: number; color: string }

export type TargetPoint = { x: number; y: number }

export type WaveBanner = { text: string; isBoss: boolean }

export type WaveState = {
  wave: number
  enemiesLeft: number
  spawnTimer: number
  waveTimer: number
  pauseActive: boolean
  pauseTimer: number
  banner: WaveBanner | null
}
