import type { Metrics } from '../core/metrics'

/**
 * Масштабирование DOM-оверлея под размер окна (перенос applyOverlayScale).
 * Значения — «дизайн-пиксели» от базовой высоты/ширины 1000.
 */
export class OverlayScaler {
  private readonly title = document.querySelector<HTMLElement>('.screen-title')
  private readonly subtitles = document.querySelectorAll<HTMLElement>('.screen-subtitle')
  private readonly overlay = document.getElementById('ui-overlay')
  private readonly typed = document.getElementById('typed-text')
  private readonly chatText = document.getElementById('chat-text')
  private readonly channelForm = document.getElementById('channel-form')
  private readonly gameoverTitle = document.getElementById('gameover-title')
  private readonly gameoverSubtitles = document.querySelectorAll<HTMLElement>('#gameover-screen .screen-subtitle')
  private readonly statsTitles = document.querySelectorAll<HTMLElement>('.stats-section-title')
  private readonly statsTop1 = document.querySelectorAll<HTMLElement>('.stats-top1')
  private readonly statsTop2 = document.querySelectorAll<HTMLElement>('.stats-top2')
  private readonly statsTop3 = document.querySelectorAll<HTMLElement>('.stats-top3')
  private readonly statsRows = document.querySelectorAll<HTMLElement>(
    '.stats-row:not(.stats-top1):not(.stats-top2):not(.stats-top3)',
  )
  private readonly mazila = document.querySelectorAll<HTMLElement>('.stats-mazila')
  private readonly crowns = document.querySelectorAll<HTMLElement>('.stats-crown')

  apply(metrics: Metrics): void {
    const { width, height } = metrics
    const vw = (value: number) => Math.round((value * width) / 1000) + 'px'
    const vh = (value: number) => Math.round((value * height) / 1000) + 'px'

    if (this.title) this.title.style.fontSize = vh(40)
    for (const el of this.subtitles) el.style.fontSize = vh(18)

    if (this.overlay) {
      this.overlay.style.padding = `${vh(12)} ${vw(16)}`
      this.overlay.style.fontSize = vh(28)
    }
    if (this.typed) {
      this.typed.style.fontSize = vh(20)
      this.typed.style.minHeight = vh(28)
    }
    if (this.chatText) {
      this.chatText.style.fontSize = vh(16)
      this.chatText.style.minHeight = vh(28)
    }
    if (this.channelForm) {
      const formTitle = this.channelForm.querySelector<HTMLElement>('.screen-title')
      if (formTitle) formTitle.style.fontSize = vh(80)
      const input = this.channelForm.querySelector<HTMLInputElement>('input')
      if (input) {
        input.style.fontSize = vh(22)
        input.style.padding = `${vh(12)} ${vw(20)}`
        input.style.width = vw(300)
      }
      const button = this.channelForm.querySelector<HTMLButtonElement>('button')
      if (button) {
        button.style.fontSize = vh(18)
        button.style.padding = `${vh(10)} ${vw(40)}`
        button.style.minWidth = vw(260)
      }
      const link = document.getElementById('game-link')
      if (link) link.style.fontSize = vh(16)
      const note = this.channelForm.querySelector<HTMLElement>('.obs-note')
      if (note) note.style.fontSize = vh(16)
    }
    if (this.gameoverTitle) this.gameoverTitle.style.fontSize = vh(64)
    for (const el of this.gameoverSubtitles) el.style.fontSize = vh(28)
    for (const el of this.statsTitles) el.style.fontSize = vh(28)
    for (const el of this.statsTop1) el.style.fontSize = vh(48)
    for (const el of this.statsTop2) el.style.fontSize = vh(36)
    for (const el of this.statsTop3) el.style.fontSize = vh(28)
    for (const el of this.statsRows) el.style.fontSize = vh(24)
    for (const el of this.mazila) el.style.fontSize = vh(28)
    for (const el of this.crowns) el.style.fontSize = vh(56)
  }
}
