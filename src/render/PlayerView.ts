import { Container, Graphics, Sprite, Texture } from 'pixi.js'
import { gameConfig } from '../config/gameConfig'
import type { Metrics } from '../core/metrics'
import { tintOf } from './textures'

/** Стрелок в нижней части экрана — статичная неоновая точка со свечением. */
export class PlayerView {
  private readonly glow: Sprite
  private readonly body = new Graphics()

  constructor(parent: Container, glowTexture: Texture) {
    this.glow = new Sprite(glowTexture)
    this.glow.anchor.set(0.5)
    this.glow.tint = tintOf(gameConfig.colors.primary)
    this.glow.blendMode = 'add'
    this.glow.alpha = 0.5
    parent.addChild(this.glow)
    parent.addChild(this.body)
  }

  applyMetrics(metrics: Metrics): void {
    this.body.clear()
    this.body
      .circle(0, 0, metrics.playerRadius)
      .fill({ color: gameConfig.colors.primary })
    this.glow.width = metrics.playerGlow * 4
    this.glow.height = metrics.playerGlow * 4
    this.body.position.set(metrics.width / 2, metrics.height - metrics.playerY)
    this.glow.position.set(metrics.width / 2, metrics.height - metrics.playerY)
  }
}
