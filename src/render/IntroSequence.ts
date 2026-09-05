import { Container, Graphics, Sprite, Text, Texture } from 'pixi.js'
import { gameConfig } from '../config/gameConfig'
import type { Metrics } from '../core/metrics'
import { tintOf } from './textures'

type IntroParticle = { x: number; y: number; vx: number; vy: number; life: number; decay: number; size: number }
type IntroShot = { progress: number; done: boolean; trail: IntroParticle[]; body: Graphics; trailSprites: Sprite[] }

/**
 * Заставка «SHOOTING WORLD → SHOOTING WORD»: буква L простреливается,
 * D въезжает на её место. Полностью самодостаточный визуальный блок.
 */
export class IntroSequence {
  readonly container = new Container()
  active = false
  onFinish: (() => void) | null = null

  private readonly main: Text
  private readonly lText: Text
  private readonly dText: Text
  private readonly subtitle: Text
  private readonly glow: Sprite
  private readonly particleGraphics = new Graphics()
  private readonly shots: IntroShot[] = []
  private readonly particles: IntroParticle[] = []

  private frame = 0
  private textAlpha = 0
  private layout = { totalW: 0, lX: 0, lY: 0, dX: 0, shooterX: 0, shooterY: 0 }

  constructor(
    parent: Container,
    private metrics: Metrics,
    glowTexture: Texture,
  ) {
    const style = (fontSize: number, fill: string, bold: boolean) => ({
      fontFamily: ['Courier New', 'monospace'],
      fontSize,
      fontWeight: bold ? ('bold' as const) : ('normal' as const),
      fill,
    })

    this.glow = new Sprite(glowTexture)
    this.glow.anchor.set(0.5)
    this.glow.tint = tintOf(gameConfig.colors.primary)
    this.glow.blendMode = 'add'

    this.main = new Text({ text: 'SHOOTING WOR', style: style(44, gameConfig.colors.primary, true) })
    this.main.anchor.set(0.5)
    this.lText = new Text({ text: 'L', style: style(44, gameConfig.colors.primary, true) })
    this.lText.anchor.set(0.5)
    this.dText = new Text({ text: 'D', style: style(44, gameConfig.colors.primary, true) })
    this.dText.anchor.set(0.5)
    this.subtitle = new Text({ text: gameConfig.texts.startSubtitle, style: style(32, gameConfig.colors.primaryDim, false) })
    this.subtitle.anchor.set(0.5)
    this.subtitle.visible = false

    this.container.addChild(this.glow, this.main, this.lText, this.dText, this.particleGraphics, this.subtitle)
    parent.addChild(this.container)
    this.applyMetrics(metrics)
  }

  applyMetrics(metrics: Metrics): void {
    this.metrics = metrics
    const scale = metrics.height / 1000
    const I = gameConfig.intro

    this.main.style.fontSize = Math.round(I.fontSize * scale)
    this.lText.style.fontSize = Math.round(I.fontSize * scale)
    this.dText.style.fontSize = Math.round(I.fontSize * scale)
    this.subtitle.style.fontSize = Math.round(I.subtitleFont * scale)

    const textY = Math.round(metrics.height * I.textYR)
    const cx = metrics.width / 2
    const worW = this.main.width
    const lW = this.lText.width
    const dW = this.dText.width
    const totalW = worW + lW + dW

    this.main.position.set(cx - totalW / 2 + worW / 2, textY)
    this.layout = {
      totalW,
      lX: cx - totalW / 2 + worW + lW / 2,
      lY: textY,
      dX: cx - totalW / 2 + worW + lW + dW / 2,
      shooterX: cx,
      shooterY: metrics.height - metrics.shooterOffset,
    }
    this.lText.position.set(this.layout.lX, textY)
    this.dText.position.set(this.layout.dX, textY)
    this.subtitle.position.set(cx, textY + Math.round(I.subtitleYOffset * scale))
    this.glow.width = this.main.width + Math.round(I.glow * scale) * 2
    this.glow.height = Math.round(I.fontSize * scale) * 3
    this.glow.position.copyFrom(this.main.position)
  }

  start(): void {
    this.active = true
    this.frame = 0
    this.textAlpha = 0
    this.subtitle.visible = false
    this.lText.alpha = 1
    this.dText.alpha = 1
    this.particles.length = 0
    for (const shot of this.shots) shot.body.destroy()
    this.shots.length = 0
    this.container.visible = true
  }

  hide(): void {
    this.active = false
    this.container.visible = false
  }

  update(delta: number): void {
    if (!this.active) return
    const m = this.metrics
    const I = gameConfig.intro
    const scale = m.height / 1000

    const prevFrame = Math.floor(this.frame)
    this.frame += delta
    const curFrame = Math.floor(this.frame)

    this.textAlpha = Math.min(1, this.frame / I.fadeInFrames)
    this.main.alpha = this.textAlpha

    for (const shotFrame of [I.shot1Frame, I.shot2Frame, I.shot3Frame]) {
      if (prevFrame < shotFrame && curFrame >= shotFrame) this.spawnShot()
    }

    for (const shot of this.shots) {
      if (shot.done) continue
      shot.progress = Math.min(1, shot.progress + I.shotSpeed * delta)
      const x = this.layout.shooterX + (this.layout.lX - this.layout.shooterX) * shot.progress
      const y = this.layout.shooterY + (this.layout.lY - this.layout.shooterY) * shot.progress
      shot.trail.unshift({ x, y, vx: 0, vy: 0, life: 1, decay: I.trailDecay, size: I.trailRect * scale })
      if (shot.trail.length > I.trailMax) shot.trail.pop()
      for (const point of shot.trail) point.life -= I.trailDecay * delta
      while (shot.trail.length && shot.trail[shot.trail.length - 1].life <= 0) shot.trail.pop()
      shot.body.clear()
      shot.body.circle(x, y, I.projectileRadius * scale).fill({ color: gameConfig.colors.primary })
      if (shot.progress >= 1) {
        shot.done = true
        shot.body.clear()
        for (let i = 0; i < I.particleCountPerHit; i++) {
          this.particles.push({
            x: this.layout.lX,
            y: this.layout.lY,
            vx: (Math.random() - 0.5) * m.particleVel,
            vy: (Math.random() - 0.5) * m.particleVel,
            life: 1,
            decay: m.particleDecayBase + Math.random() * m.particleDecayRange,
            size: m.particleSizeMin + Math.random() * (m.particleSizeMax - m.particleSizeMin),
          })
        }
      }
      this.drawTrail(shot)
    }

    const dSlide = this.frame >= I.slideStartFrame ? Math.min(1, (this.frame - I.slideStartFrame) / I.slideDuration) : 0
    this.lText.alpha = this.textAlpha * Math.max(0, 1 - dSlide)
    this.dText.alpha = this.textAlpha
    this.dText.x = this.layout.dX - this.lText.width * dSlide

    for (const p of this.particles) {
      p.x += p.vx * delta
      p.y += p.vy * delta
      p.vx *= m.particleDamping
      p.vy *= m.particleDamping
      p.life -= p.decay * delta
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      if (this.particles[i].life <= 0) this.particles.splice(i, 1)
    }
    this.particleGraphics.clear()
    for (const p of this.particles) {
      this.particleGraphics
        .rect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size)
        .fill({ color: gameConfig.colors.primary, alpha: p.life })
    }

    if (this.frame >= I.totalFrames) {
      this.active = false
      this.subtitle.visible = true
      this.onFinish?.()
    }
  }

  private spawnShot(): void {
    const body = new Graphics()
    const trailSprites: Sprite[] = []
    for (let i = 0; i < gameConfig.intro.trailMax; i++) {
      const sprite = new Sprite(Texture.WHITE)
      sprite.anchor.set(0.5)
      sprite.tint = tintOf(gameConfig.colors.primary)
      sprite.visible = false
      this.container.addChildAt(sprite, this.container.getChildIndex(this.particleGraphics))
      trailSprites.push(sprite)
    }
    this.container.addChild(body)
    this.shots.push({ progress: 0, done: false, trail: [], body, trailSprites })
  }

  private drawTrail(shot: IntroShot): void {
    const I = gameConfig.intro
    shot.trailSprites.forEach((sprite, i) => {
      const point = shot.trail[i]
      if (!point) {
        sprite.visible = false
        return
      }
      sprite.visible = true
      sprite.position.set(point.x, point.y)
      sprite.alpha = point.life * I.trailAlpha
      sprite.width = point.size
      sprite.height = point.size
    })
  }
}
