import type { GameConfig } from '../config/gameConfig'

/**
 * Масштабированные размеры для текущего окна.
 * Раньше это был глобальный объект S, наполняемый recalc() через циклы по строковым ключам.
 */
export type Metrics = {
  width: number
  height: number
  // геометрия сцены
  gridSize: number
  enemyPaddingX: number
  enemyAlienOffset: number
  armorBarPad: number
  armorBarFont: number
  missTargetPadX: number
  missTargetPadY: number
  missTargetYRange: number
  inputAreaHeight: number
  removeZone: number
  shooterOffset: number
  playerY: number
  playerRadius: number
  playerGlow: number
  // враги
  enemySimpleHeight: number
  enemyHeavyHeight: number
  enemySimpleFont: number
  enemyHeavyFont: number
  enemyArmorBarHeight: number
  enemyArmorBarOffset: number
  enemyArmorLabelOffset: number
  enemyGlow: number
  enemyFlashGlow: number
  enemyLineWidth: number
  enemyPulseRate: number
  enemyAlphaBase: number
  enemyAlphaRange: number
  enemyGlowPulse: number
  bossFontSizeFactor: number
  bossHeightFactor: number
  bossWordGap: number
  flashDuration: number
  // снаряды
  projectileSpeed: number
  projectileGlow: number
  projectileHitRadius: number
  projectileMissRadius: number
  projectileFont: number
  projectileCircleRadius: number
  projectileCircleAlpha: number
  projectileTrailLength: number
  projectileTrailDecay: number
  projectileTrailAlpha: number
  trailSizeBase: number
  trailSizeInc: number
  trailGlow: number
  // частицы
  particleVel: number
  particleSizeMin: number
  particleSizeMax: number
  particleGlow: number
  particleDecayBase: number
  particleDecayRange: number
  particleDamping: number
  particleHit: number
  particleMiss: number
  particleDestroySimple: number
  particleDestroyHeavy: number
  particleArmorBreak: number
  // тряска / волны / ввод
  shakeHit: number
  shakeMiss: number
  shakeDamage: number
  shakeHitDuration: number
  shakeMissDuration: number
  shakeDamageDuration: number
  wavePauseFont: number
  wavePauseFrames: number
  gridSpeed: number
  inputShootDelayMs: number
  glitchDurationMs: number
}

export class MetricsStore {
  current: Metrics

  constructor(private readonly config: GameConfig) {
    this.current = computeMetrics(config, window.innerWidth, window.innerHeight)
  }

  rebuild(width: number, height: number): void {
    this.current = computeMetrics(this.config, width, height)
  }
}

export function computeMetrics(config: GameConfig, width: number, height: number): Metrics {
  const V = config.visual
  const R = config.ratio
  const C = config.counts
  const S = config.speed
  const T = config.timing

  const vw = (value: number) => Math.round((value * width) / 1000)
  const vh = (value: number) => Math.round((value * height) / 1000)

  return {
    width,
    height,
    gridSize: vw(V.gridSize),
    enemyPaddingX: vw(V.enemyPaddingX),
    enemyAlienOffset: vw(V.enemyAlienOffset),
    armorBarPad: vw(V.armorBarPad),
    armorBarFont: vw(V.armorBarFont),
    missTargetPadX: vw(V.missTargetPadX),
    missTargetPadY: vh(V.missTargetPadY),
    missTargetYRange: R.missTargetYRange,
    inputAreaHeight: vh(V.inputAreaHeight),
    removeZone: vh(V.removeZone),
    shooterOffset: vh(V.shooterOffset),
    playerY: vh(V.playerY),
    playerRadius: vh(V.playerRadius),
    playerGlow: vh(V.playerGlow),
    enemySimpleHeight: vh(V.enemySimpleHeight),
    enemyHeavyHeight: vh(V.enemyHeavyHeight),
    enemySimpleFont: vh(V.enemySimpleFont),
    enemyHeavyFont: vh(V.enemyHeavyFont),
    enemyArmorBarHeight: vh(V.enemyArmorBarHeight),
    enemyArmorBarOffset: vh(V.enemyArmorBarOffset),
    enemyArmorLabelOffset: vh(V.enemyArmorLabelOffset),
    enemyGlow: vh(V.enemyGlow),
    enemyFlashGlow: vh(V.enemyFlashGlow),
    enemyLineWidth: vh(V.enemyLineWidth),
    enemyPulseRate: R.enemyPulseRate,
    enemyAlphaBase: R.enemyAlphaBase,
    enemyAlphaRange: R.enemyAlphaRange,
    enemyGlowPulse: R.enemyGlowPulse,
    bossFontSizeFactor: R.bossFontSizeFactor,
    bossHeightFactor: R.bossHeightFactor,
    bossWordGap: R.bossWordGap,
    flashDuration: C.flashDuration,
    projectileSpeed: height / (S.projectileCrossTime * 60),
    projectileGlow: vh(V.projectileGlow),
    projectileHitRadius: vh(V.projectileHitRadius),
    projectileMissRadius: vh(V.projectileMissRadius),
    projectileFont: vh(V.projectileFont),
    projectileCircleRadius: vh(V.projectileCircleRadius),
    projectileCircleAlpha: R.projectileCircleAlpha,
    projectileTrailLength: R.projectileTrailLength,
    projectileTrailDecay: R.projectileTrailDecay,
    projectileTrailAlpha: R.projectileTrailAlpha,
    trailSizeBase: vh(V.trailSizeBase),
    trailSizeInc: vh(V.trailSizeInc),
    trailGlow: vh(V.trailGlow),
    particleVel: vh(V.particleVel),
    particleSizeMin: vh(V.particleSizeMin),
    particleSizeMax: vh(V.particleSizeMax),
    particleGlow: vh(V.particleGlow),
    particleDecayBase: R.particleDecayBase,
    particleDecayRange: R.particleDecayRange,
    particleDamping: R.particleDamping,
    particleHit: C.particleHit,
    particleMiss: C.particleMiss,
    particleDestroySimple: C.particleDestroySimple,
    particleDestroyHeavy: C.particleDestroyHeavy,
    particleArmorBreak: C.particleArmorBreak,
    shakeHit: vh(V.shakeHit),
    shakeMiss: vh(V.shakeMiss),
    shakeDamage: vh(V.shakeDamage),
    shakeHitDuration: C.shakeHitDuration,
    shakeMissDuration: C.shakeMissDuration,
    shakeDamageDuration: C.shakeDamageDuration,
    wavePauseFont: vh(V.wavePauseFont),
    wavePauseFrames: C.wavePauseFrames,
    gridSpeed: (S.gridSpeed * height) / 1000,
    inputShootDelayMs: T.inputShootDelay,
    glitchDurationMs: T.glitchDuration,
  }
}

export function framesFromMs(ms: number): number {
  return ms / (1000 / 60)
}
