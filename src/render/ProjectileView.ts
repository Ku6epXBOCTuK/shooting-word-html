import { Container, Graphics, Sprite, Text, Texture } from 'pixi.js'
import { gameConfig } from '../config/gameConfig'
import type { Metrics } from '../core/metrics'
import type { GameEntity } from '../ecs/world'
import { tintOf } from './textures'

type TrailPoint = { x: number; y: number; life: number }

/** Вью снаряда: слово, окружность, свечение и хвост из квадратов (как в оригинале). */
export class ProjectileView extends Container {
  private readonly glow: Sprite
  private readonly body: Graphics
  private readonly wordLabel: Text
  private readonly trailSprites: Sprite[] = []
  private readonly cssColor: string
  private trail: TrailPoint[] = []

  constructor(
    entity: GameEntity,
    metrics: Metrics,
    glowTexture: Texture,
  ) {
    super()
    const isHit = !!entity.target
    this.cssColor = isHit ? gameConfig.colors.primary : gameConfig.colors.miss
    const tint = tintOf(this.cssColor)

    for (let i = 0; i < metrics.projectileTrailLength; i++) {
      const sprite = new Sprite(Texture.WHITE)
      sprite.anchor.set(0.5)
      sprite.tint = tint
      sprite.visible = false
      this.addChild(sprite)
      this.trailSprites.push(sprite)
    }

    this.glow = new Sprite(glowTexture)
    this.glow.anchor.set(0.5)
    this.glow.tint = tint
    this.glow.blendMode = 'add'
    this.glow.alpha = 0.4
    this.addChild(this.glow)

    this.body = new Graphics()
    this.addChild(this.body)

    this.wordLabel = new Text({
      text: entity.projectile?.word ?? '',
      style: {
        fontFamily: ['Courier New', 'monospace'],
        fontSize: metrics.projectileFont,
        fontWeight: 'bold',
        fill: this.cssColor,
      },
    })
    this.wordLabel.anchor.set(0.5)
    this.addChild(this.wordLabel)

    this.applyMetrics(metrics)
  }

  applyMetrics(metrics: Metrics): void {
    this.body.clear()
    this.body
      .circle(0, 0, metrics.projectileCircleRadius)
      .stroke({ color: this.cssColor, width: 1, alpha: metrics.projectileCircleAlpha })
    this.glow.width = metrics.projectileGlow * 4
    this.glow.height = metrics.projectileGlow * 4
  }

  sync(entity: GameEntity, delta: number, metrics: Metrics): void {
    const position = entity.position as { x: number; y: number }
    this.position.set(position.x, position.y)

    const velocity = entity.velocity
    if (velocity && (velocity.x !== 0 || velocity.y !== 0)) {
      this.trail.unshift({ x: position.x, y: position.y, life: 1 })
      if (this.trail.length > metrics.projectileTrailLength) this.trail.pop()
    }
    for (const point of this.trail) point.life -= metrics.projectileTrailDecay * delta
    this.trail = this.trail.filter((point) => point.life > 0)

    for (let i = 0; i < this.trailSprites.length; i++) {
      const sprite = this.trailSprites[i]
      const point = this.trail[i]
      if (!point) {
        sprite.visible = false
        continue
      }
      sprite.visible = true
      sprite.position.set(point.x - position.x, point.y - position.y)
      sprite.alpha = point.life * metrics.projectileTrailAlpha
      const size = metrics.trailSizeBase + i * metrics.trailSizeInc
      sprite.width = size
      sprite.height = size
    }
  }

  destroyView(): void {
    this.destroy({ children: true })
  }
}
