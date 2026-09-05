import { Container, TilingSprite, Texture } from 'pixi.js'
import { gameConfig } from '../config/gameConfig'
import type { Metrics } from '../core/metrics'

/**
 * Сетка фона одним TilingSprite: одна текстура, один quad, скролл через
 * tilePosition — вместо ~40 stroke() за кадр в старом canvas-рендере.
 */
export class GridLayer {
  private readonly sprite: TilingSprite
  private texture: Texture | null = null
  private builtGridSize = 0

  constructor(parent: Container) {
    this.sprite = new TilingSprite({ texture: Texture.WHITE, width: 1, height: 1 })
    parent.addChild(this.sprite)
  }

  applyMetrics(metrics: Metrics): void {
    if (metrics.gridSize !== this.builtGridSize) {
      this.texture?.destroy(true)
      this.texture = this.buildTexture(metrics.gridSize)
      this.sprite.texture = this.texture
      this.builtGridSize = metrics.gridSize
    }
    this.sprite.width = metrics.width
    this.sprite.height = metrics.height
  }

  update(delta: number, metrics: Metrics): void {
    this.sprite.tilePosition.y = (this.sprite.tilePosition.y - metrics.gridSpeed * delta) % metrics.gridSize
  }

  private buildTexture(gridSize: number): Texture {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = gridSize
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    ctx.strokeStyle = gameConfig.colors.primaryGrid
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(gridSize - 0.5, 0)
    ctx.lineTo(gridSize - 0.5, gridSize)
    ctx.moveTo(0, gridSize - 0.5)
    ctx.lineTo(gridSize, gridSize - 0.5)
    ctx.stroke()
    return Texture.from(canvas)
  }
}
