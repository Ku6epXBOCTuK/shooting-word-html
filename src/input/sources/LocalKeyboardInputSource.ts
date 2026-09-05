import { gameConfig } from '../../config/gameConfig'
import type { Player } from '../../core/types'
import type { InputCommand, LocalBufferSource } from '../InputSource'
import { firstToken } from '../InputSource'

/** Тестовый источник без Twitch: локальная клавиатура, как в оригинале. */
export class LocalKeyboardInputSource implements LocalBufferSource {
  readonly origin = 'local' as const
  private buffer = ''
  private attached = false
  private readonly commandHandlers = new Set<(command: InputCommand) => void>()
  private readonly bufferHandlers = new Set<(text: string) => void>()

  constructor(private readonly channelName: string) {}

  start(): void {
    if (this.attached) return
    window.addEventListener('keydown', this.onKeyDown)
    this.attached = true
  }

  stop(): void {
    if (!this.attached) return
    window.removeEventListener('keydown', this.onKeyDown)
    this.attached = false
  }

  onCommand(handler: (command: InputCommand) => void): () => void {
    this.commandHandlers.add(handler)
    return () => this.commandHandlers.delete(handler)
  }

  onBuffer(handler: (text: string) => void): () => void {
    this.bufferHandlers.add(handler)
    return () => this.bufferHandlers.delete(handler)
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Backspace') {
      event.preventDefault()
      this.buffer = this.buffer.slice(0, -1)
      this.emitBuffer()
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const line = this.buffer
      this.buffer = ''
      this.submit(line)
    } else if (event.key === 'Escape') {
      this.buffer = ''
      this.emitCommand({ kind: 'clear' })
    } else if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
      this.buffer += event.key
      this.emitBuffer()
    }
  }

  private submit(line: string): void {
    const word = firstToken(line)
    if (!word) return
    if (word === gameConfig.commands.play) {
      this.emitCommand({ kind: 'start' })
      return
    }
    const player: Player = { id: 'local', name: this.channelName }
    this.emitCommand({ kind: 'word', word, player })
  }

  private emitCommand(command: InputCommand): void {
    for (const handler of [...this.commandHandlers]) handler(command)
  }

  private emitBuffer(): void {
    for (const handler of [...this.bufferHandlers]) handler(this.buffer)
  }
}
