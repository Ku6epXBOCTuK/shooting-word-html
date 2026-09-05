import type { EventBus } from '../core/eventBus'
import type { GameEvents } from '../game/events'
import type { InputCommand, InputSource } from './InputSource'

/** Регистрирует источники ввода и переносит их команды на шину событий. */
export class InputRouter {
  constructor(
    private readonly sources: InputSource[],
    private readonly bus: EventBus<GameEvents>,
  ) {}

  start(): void {
    for (const source of this.sources) {
      source.onCommand((command) => this.forward(source.origin, command))
      source.start()
    }
  }

  stop(): void {
    for (const source of this.sources) source.stop()
  }

  private forward(origin: InputSource['origin'], command: InputCommand): void {
    switch (command.kind) {
      case 'start':
        this.bus.emit('input:start', { origin })
        break
      case 'word':
        this.bus.emit('input:word', { word: command.word, player: command.player, origin })
        break
      case 'clear':
        this.bus.emit('input:cleared', {})
        break
    }
  }
}
