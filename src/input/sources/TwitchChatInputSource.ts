import * as tmi from 'tmi.js'
import { gameConfig } from '../../config/gameConfig'
import type { Player } from '../../core/types'
import type { InputCommand, InputSource } from '../InputSource'
import { firstToken } from '../InputSource'

/**
 * Twitch-чат через tmi.js. Реализует InputSource — при переходе на Twurple
 * заменяется на TwurpleChatInputSource (и дополняется источником наград
 * за баллы канала), без изменений в игровой логике.
 */
export class TwitchChatInputSource implements InputSource {
  readonly origin = 'chat' as const
  private client: tmi.Client | null = null
  private readonly commandHandlers = new Set<(command: InputCommand) => void>()

  constructor(private readonly channel: string) {}

  start(): void {
    if (this.client) return
    const client = new tmi.Client({ channels: [this.channel] })
    client.on('message', this.onMessage)
    client.connect().catch((error) => {
      console.error('Shooting Word: не удалось подключиться к чату', error)
    })
    this.client = client
  }

  stop(): void {
    if (!this.client) return
    this.client.disconnect().catch(() => undefined)
    this.client = null
  }

  onCommand(handler: (command: InputCommand) => void): () => void {
    this.commandHandlers.add(handler)
    return () => this.commandHandlers.delete(handler)
  }

  private onMessage = (_channel: string, tags: tmi.ChatUserstate, message: string): void => {
    const word = firstToken(message)
    if (!word) return
    const player: Player = {
      id: tags.username ?? tags['display-name'] ?? 'anonymous',
      name: tags['display-name'] ?? tags.username ?? 'anonymous',
    }
    const command: InputCommand =
      word === gameConfig.commands.play ? { kind: 'start' } : { kind: 'word', word, player }
    for (const handler of [...this.commandHandlers]) handler(command)
  }
}
