export type EnemyKind = 'simple' | 'heavy' | 'boss'

/**
 * Состояние врага: позиция, слова и урон. Ничего не знает про рендер и ввод.
 * simple — одно слово; heavy — пара слов по порядку; boss — слои слов в произвольном порядке.
 */
export class Enemy {
  x: number
  y = 0
  readonly speed: number
  readonly width: number
  readonly height: number
  pulse = 0
  flashTimer = 0

  private layerIndex = 0
  /** Прогресс внутри текущего слоя для simple/heavy (слова уничтожаются по порядку). */
  private wordProgress = 0
  private readonly killedInLayer = new Set<string>()

  constructor(
    readonly kind: EnemyKind,
    /** simple/heavy: единственный слой с последовательностью слов. boss: слои слов. */
    readonly layers: string[][],
    spawnX: number,
    speed: number,
    width: number,
    height: number,
    private readonly flashDurationFrames: number,
  ) {
    this.x = spawnX
    this.speed = speed
    this.width = width
    this.height = height
  }

  /** Слой слов, который нужно уничтожить боссу (null — не босс). */
  get bossLayer(): string[] | null {
    return this.kind === 'boss' ? (this.layers[this.layerIndex] ?? null) : null
  }

  /** Текущее отображаемое слово (для simple/heavy). */
  get label(): string | null {
    return this.kind === 'boss' ? null : (this.layers[this.layerIndex]?.[this.wordProgress] ?? null)
  }

  /** Слово доступно для попадания. */
  acceptsWord(word: string): boolean {
    if (this.kind === 'boss') {
      const layer = this.bossLayer
      return !!layer && layer.includes(word) && !this.killedInLayer.has(word)
    }
    return this.label === word
  }

  /** Сколько слов осталось в текущем слое (для полоски брони). */
  remainingInLayer(): number {
    if (this.kind === 'boss') {
      const layer = this.bossLayer
      return layer ? layer.length - this.killedInLayer.size : 0
    }
    const words = this.layers[this.layerIndex]
    return words ? words.length - this.wordProgress : 0
  }

  totalLayers(): number {
    return this.layers.length
  }

  currentLayerIndex(): number {
    return this.layerIndex
  }

  killedWordsInLayer(): ReadonlySet<string> {
    return this.killedInLayer
  }

  /** Применяет попадание словом. Возвращает true, если враг уничтожен. */
  hit(word: string): boolean {
    this.flashTimer = this.flashDurationFrames
    if (this.kind === 'boss') {
      this.killedInLayer.add(word)
      const layer = this.bossLayer
      if (layer && layer.every((w) => this.killedInLayer.has(w))) {
        this.layerIndex++
        this.killedInLayer.clear()
        return this.layerIndex >= this.layers.length
      }
      return false
    }
    const next = this.wordProgress + 1
    if (next >= (this.layers[this.layerIndex]?.length ?? 0)) {
      return true
    }
    this.wordProgress = next
    return false
  }

  update(deltaFrames: number, pulseRate: number): void {
    this.y += this.speed * deltaFrames
    this.pulse += pulseRate * deltaFrames
    if (this.flashTimer > 0) this.flashTimer -= deltaFrames
  }
}
