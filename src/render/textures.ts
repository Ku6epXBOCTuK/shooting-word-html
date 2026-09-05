import { Texture } from 'pixi.js'
import { cssColorToHex } from '../core/color'

/**
 * Радиальный градиент вместо canvas shadowBlur: свечение рисуется спрайтом
 * с аддитивным блендингом, что на порядки дешевле попиксельного blur.
 */
export function createGlowTexture(size = 128): Texture {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  const half = size / 2
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half)
  gradient.addColorStop(0, 'rgba(255,255,255,0.85)')
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.3)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return Texture.from(canvas)
}

const tintCache = new Map<string, number>()

export function tintOf(cssColor: string): number {
  let tint = tintCache.get(cssColor)
  if (tint === undefined) {
    tint = cssColorToHex(cssColor)
    tintCache.set(cssColor, tint)
  }
  return tint
}
