import { gameConfig } from '../config/gameConfig'

/** Замер ширины текста для логики (расчёт ширины врага). Платформенная зависимость изолирована здесь. */
export interface TextMeasurer {
  measure(text: string, sizePx: number, bold?: boolean): number
}

export class CanvasTextMeasurer implements TextMeasurer {
  private readonly ctx: CanvasRenderingContext2D

  constructor() {
    const canvas = document.createElement('canvas')
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  }

  measure(text: string, sizePx: number, bold = false): number {
    this.ctx.font = `${bold ? 'bold ' : ''}${sizePx}px ${gameConfig.font}`
    return this.ctx.measureText(text).width
  }
}
