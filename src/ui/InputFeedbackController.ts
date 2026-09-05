import { gameConfig } from '../config/gameConfig'
import type { EventBus } from '../core/eventBus'
import type { GameEvents } from '../game/events'
import { requiredElement } from './dom'

/** Отображение набираемого текста и «выстрелившего» слова (локальный ввод и чат). */
export class InputFeedbackController {
  private readonly typedEl = requiredElement('typed-text')
  private readonly chatEl = requiredElement('chat-text')
  private readonly clearTimers = new Map<HTMLElement, number>()

  constructor(bus: EventBus<GameEvents>) {
    bus.on('game:started', () => this.clearAll())
    bus.on('input:cleared', () => this.clearAll())
    bus.on('input:word', ({ word, player, origin }) => {
      const el = origin === 'local' ? this.typedEl : this.chatEl
      if (origin === 'local') {
        el.textContent = word
      } else {
        el.replaceChildren()
        const name = document.createElement('span')
        name.style.opacity = '0.6'
        name.textContent = `${player.name}: `
        el.appendChild(name)
        el.appendChild(document.createTextNode(word))
      }
      this.animate(el)
    })
  }

  /** Подписка на набор текста локальной клавиатуры (буфер ещё не отправлен). */
  bindBuffer(source: { onBuffer(handler: (text: string) => void): () => void }): void {
    source.onBuffer((text) => {
      this.typedEl.textContent = text
    })
  }

  private animate(el: HTMLElement): void {
    el.classList.add('shooting')
    const existing = this.clearTimers.get(el)
    if (existing !== undefined) clearTimeout(existing)
    this.clearTimers.set(
      el,
      window.setTimeout(() => {
        el.classList.remove('shooting')
        el.replaceChildren()
        this.clearTimers.delete(el)
      }, gameConfig.timing.inputShootDelay),
    )
  }

  private clearAll(): void {
    for (const el of [this.typedEl, this.chatEl]) {
      const timer = this.clearTimers.get(el)
      if (timer !== undefined) clearTimeout(timer)
      this.clearTimers.delete(el)
      el.classList.remove('shooting')
      el.replaceChildren()
    }
  }
}
