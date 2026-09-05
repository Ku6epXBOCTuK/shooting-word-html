import { Container, Graphics, Sprite, Text, Texture } from 'pixi.js'
import { gameConfig } from '../config/gameConfig'
import type { TextMeasurer } from '../core/CanvasTextMeasurer'
import type { Metrics } from '../core/metrics'
import type { Armor, EnemyKind } from '../ecs/components'
import type { GameEntity } from '../ecs/world'
import { tintOf } from './textures'

function kindColor(kind: EnemyKind): string {
  if (kind === 'boss') return gameConfig.colors.boss
  return kind === 'heavy' ? gameConfig.colors.heavy : gameConfig.colors.primary
}

/**
 * Вью врага. Вся «визуальная» логика врага живёт здесь: пульс, вспышка при
 * попадании, перерисовка слоёв брони. Логика урона — в Simulation.
 */
export class EnemyView extends Container {
  private readonly kind: EnemyKind
  private readonly glow: Sprite
  private readonly hull = new Graphics()
  private readonly marks = new Graphics()
  private readonly armorBar = new Graphics()
  private readonly armorLabel: Text
  private wordTexts: Text[] = []
  private pulse = 0
  private flashTimer = 0
  private lastFlash = false
  private lastLayerKey = ''

  constructor(
    private entity: GameEntity,
    private metrics: Metrics,
    private readonly measurer: TextMeasurer,
    glowTexture: Texture,
  ) {
    super()
    this.kind = entity.enemyKind as EnemyKind
    const color = kindColor(this.kind)

    this.glow = new Sprite(glowTexture)
    this.glow.anchor.set(0.5)
    this.glow.tint = tintOf(color)
    this.glow.blendMode = 'add'
    this.addChild(this.glow)

    this.addChild(this.hull)
    this.addChild(this.marks)

    this.armorLabel = new Text({
      text: '',
      style: { fontFamily: ['Courier New', 'monospace'], fontSize: metrics.armorBarFont, fill: color },
    })
    this.armorLabel.anchor.set(0.5)
    this.addChild(this.armorLabel)

    this.addChild(this.armorBar)
    this.rebuildWords()
    this.drawHull(false)
    this.drawArmorBar()
  }

  /** Вспышка при попадании — визуальная реакция на событие. */
  onHit(metrics: Metrics): void {
    this.flashTimer = metrics.flashDuration
  }

  applyMetrics(metrics: Metrics): void {
    this.metrics = metrics
    this.armorLabel.style.fontSize = metrics.armorBarFont
    this.lastLayerKey = ''
    this.rebuildWords()
    this.drawHull(this.lastFlash)
    this.drawArmorBar()
  }

  sync(entity: GameEntity, delta: number, metrics: Metrics, wave: number): void {
    this.entity = entity
    this.metrics = metrics
    const position = entity.position as { x: number; y: number }
    this.position.set(position.x, position.y)

    this.pulse += metrics.enemyPulseRate * delta
    if (this.flashTimer > 0) this.flashTimer -= delta
    const flash = this.flashTimer > 0

    const boxWidth = (entity.enemyBox as { width: number }).width
    const boxHeight = (entity.enemyBox as { height: number }).height
    const glowPad = (flash ? metrics.enemyFlashGlow : metrics.enemyGlow) * 3
    this.glow.width = boxWidth + glowPad * 2
    this.glow.height = boxHeight + glowPad * 2
    this.glow.alpha = flash ? 0.9 : 0.32 + Math.sin(this.pulse * 2) * 0.12

    if (flash !== this.lastFlash) {
      this.lastFlash = flash
      this.drawHull(flash)
      this.drawArmorBar()
    }

    const armor = entity.armor as Armor
    const layerKey = `${armor.layerIndex}:${armor.killed.join(',')}`
    if (layerKey !== this.lastLayerKey) {
      this.lastLayerKey = layerKey
      this.rebuildWords()
      this.drawArmorBar()
    }

    const showArmorLabel = wave <= 5 && this.kind !== 'simple'
    if (showArmorLabel) {
      const total = armor.layers.length
      const remaining = total - armor.layerIndex
      this.armorLabel.text =
        this.kind === 'boss'
          ? `${gameConfig.texts.bossLabel} ${remaining}/${total}`
          : `${gameConfig.texts.armorLabel} ${remaining}/${total}`
      this.armorLabel.y = -boxHeight / 2 - metrics.enemyArmorLabelOffset
      this.armorLabel.style.fill = flash ? gameConfig.colors.white : kindColor(this.kind)
    }
    this.armorLabel.visible = showArmorLabel
  }

  destroyView(): void {
    this.destroy({ children: true })
  }

  private drawHull(flash: boolean): void {
    const box = this.entity.enemyBox as { width: number; height: number }
    const width = box.width
    const height = box.height
    const off = this.metrics.enemyAlienOffset
    const color = flash ? gameConfig.colors.white : kindColor(this.kind)
    const fill = flash ? gameConfig.colors.white : gameConfig.colors.enemyFill
    const lineWidth = flash ? this.metrics.enemyLineWidth * 2 : this.metrics.enemyLineWidth

    const hull = this.hull.clear()
    if (this.kind === 'boss') {
      hull.moveTo(-width / 2 + off, -height / 2)
      hull.lineTo(width / 2 - off, -height / 2)
      hull.lineTo(width / 2, -height / 2 + off)
      hull.lineTo(width / 2, height / 2 - off)
      hull.lineTo(width / 2 - off, height / 2)
      hull.lineTo(-width / 2 + off, height / 2)
      hull.lineTo(-width / 2, height / 2 - off)
      hull.lineTo(-width / 2, -height / 2 + off)
      hull.closePath()
    } else if (this.kind === 'heavy') {
      hull.moveTo(-width / 2 + off, -height / 2)
      hull.lineTo(width / 2 - off, -height / 2)
      hull.lineTo(width / 2, 0)
      hull.lineTo(width / 2 - off, height / 2)
      hull.lineTo(-width / 2 + off, height / 2)
      hull.lineTo(-width / 2, 0)
      hull.closePath()
    } else {
      hull.rect(-width / 2, -height / 2, width, height)
    }
    hull.fill({ color: fill }).stroke({ color, width: lineWidth })
  }

  private drawArmorBar(): void {
    if (this.kind === 'simple') {
      this.armorBar.clear()
      return
    }
    const armor = this.entity.armor as Armor
    const box = this.entity.enemyBox as { width: number; height: number }
    const barWidth = box.width - this.metrics.armorBarPad
    const barHeight = this.metrics.enemyArmorBarHeight
    const y = -box.height / 2 - this.metrics.enemyArmorBarOffset
    const total = armor.layers.length
    const remaining = total - armor.layerIndex

    this.armorBar.clear()
    this.armorBar.rect(-barWidth / 2, y, barWidth, barHeight).fill({ color: gameConfig.colors.armorBarBg })
    if (remaining > 0) {
      this.armorBar
        .rect(-barWidth / 2, y, (barWidth * remaining) / total, barHeight)
        .fill({ color: gameConfig.colors.armorBarFill })
    }
  }

  private rebuildWords(): void {
    for (const text of this.wordTexts) text.destroy()
    this.wordTexts = []
    this.marks.clear()

    const armor = this.entity.armor as Armor
    const layer = armor.layers[armor.layerIndex]
    if (!layer) return
    const flash = this.lastFlash
    const color = flash ? gameConfig.colors.white : kindColor(this.kind)
    const box = this.entity.enemyBox as { width: number; height: number }

    if (this.kind === 'boss') {
      const fontSize = Math.round(this.metrics.enemyHeavyFont * this.metrics.bossFontSizeFactor)
      const widths = layer.map((word) => this.measurer.measure(word, fontSize, true))
      const totalWidth =
        widths.reduce((sum, w) => sum + w, 0) + (layer.length - 1) * gameConfig.ratio.bossWordGap
      let cursor = -totalWidth / 2
      layer.forEach((word, i) => {
        const killed = armor.killed.includes(word)
        const text = new Text({
          text: word,
          style: {
            fontFamily: ['Courier New', 'monospace'],
            fontSize,
            fontWeight: 'bold',
            fill: color,
          },
        })
        text.anchor.set(0.5)
        text.alpha = killed ? 0.3 : 1
        text.x = cursor + widths[i] / 2
        text.y = 0
        this.addChild(text)
        this.wordTexts.push(text)
        if (killed) {
          this.marks
            .moveTo(text.x - widths[i] / 2, 0)
            .lineTo(text.x + widths[i] / 2, 0)
            .stroke({ color, width: 2 })
        }
        cursor += widths[i] + gameConfig.ratio.bossWordGap
      })
    } else {
      const fontSize = this.kind === 'heavy' ? this.metrics.enemyHeavyFont : this.metrics.enemySimpleFont
      const text = new Text({
        text: layer[0] ?? '',
        style: {
          fontFamily: ['Courier New', 'monospace'],
          fontSize,
          fontWeight: 'bold',
          fill: color,
        },
      })
      text.anchor.set(0.5)
      this.addChild(text)
      this.wordTexts.push(text)
    }
  }
}
