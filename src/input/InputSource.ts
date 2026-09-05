import type { InputOrigin, Player } from '../core/types'

/**
 * Команда ввода — то, что игра понимает. Источники транслируют свои события
 * (сообщения чата, награды за баллы канала, клавиатуру) в эти команды.
 */
export type InputCommand =
  | { kind: 'start' }
  | { kind: 'clear' }
  | { kind: 'word'; word: string; player: Player }

/**
 * Порт ввода. Игра зависит только от этого интерфейса, а не от конкретной
 * библиотеки: сегодня это tmi.js-чат и локальная клавиатура, завтра —
 * Twurple (chat + channel point rewards) — достаточно реализовать интерфейс
 * и зарегистрировать источник в InputRouter.
 */
export interface InputSource {
  readonly origin: InputOrigin
  start(): void
  stop(): void
  onCommand(handler: (command: InputCommand) => void): () => void
}

/** Источник с набираемым текстом (локальная клавиатура). */
export interface LocalBufferSource extends InputSource {
  onBuffer(handler: (text: string) => void): () => void
}

export function firstToken(message: string): string {
  return message.trim().toLowerCase().split(/\s+/)[0] ?? ''
}
