/** Преобразует CSS-цвет '#rrggbb' в число для Pixi (tint/fill). */
export function cssColorToHex(css: string): number {
  const hex = css.replace('#', '')
  return parseInt(hex, 16)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
