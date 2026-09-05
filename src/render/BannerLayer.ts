import { Container, Sprite, Text, Texture } from 'pixi.js'
import { gameConfig } from '../config/gameConfig'
import type { Metrics } from '../core/metrics'
import type { GameWorld } from '../ecs/world'
import { tintOf } from './textures'

/** Баннер между волнами («WAVE N INCOMING» / «BOSS INCOMING»). */
export class BannerLayer {
  private readonly text: Text
  private readonly glow: Sprite
  private lastKey = ''

  constructor(parent: Container, glowTexture: Texture) {
    this.glow = new Sprite(glowTexture)
    this.glow.anchor.set(0.5)
    this.glow.blendMode = 'add'
    this.text = new Text({
      text: '',
      style: {
        fontFamily: ['Courier New', 'monospace'],
        fontSize: 36,
        fontWeight: 'bold',
        fill: gameConfig.colors.primary,
      },
    })
    this.text.anchor.set(0.5)
    this.text.visible = false
    this.text.alpha = 0
    parent.addChild(this.glow)
    parent.addChild(this.text)
  }

  applyMetrics(metrics: Metrics): void {
    this.text.style.fontSize = metrics.wavePauseFont
    this.text.position.set(metrics.width / 2, metrics.inputAreaHeight + 40)
    this.glow.position.set(metrics.width / 2, metrics.inputAreaHeight + 40)
  }

  update(world: GameWorld, metrics: Metrics): void {
    const ws = world.with('waveState').first?.waveState
    const banner = ws?.banner
    if (!ws || !banner || !ws.pauseActive) {
      this.text.visible = false
      this.glow.visible = false
      return
    }

    const color = banner.isBoss ? gameConfig.colors.boss : gameConfig.colors.primary
    const key = `${banner.text}:${color}`
    if (key !== this.lastKey) {
      this.lastKey = key
      this.text.text = banner.text
      this.text.style.fill = color
      this.glow.tint = tintOf(color)
    }
    this.text.visible = true
    this.glow.visible = true
    this.glow.width = this.text.width + metrics.wavePauseFont * 2
    this.glow.height = metrics.wavePauseFont * 4
    this.glow.alpha = 0.35
    this.glow.blendMode = 'add'
    this.text.alpha = ws.pauseTimer > 30 ? 1 : ws.pauseTimer / 30
  }
}
