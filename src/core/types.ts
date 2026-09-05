/** Игрок — абстракция над источником ввода (TMI, Twurple, локальная клавиатура). */
export type Player = {
  /** Стабильный идентификатор (для чата — логин, для Twurple — user id). */
  id: string
  /** Отображаемое имя для статистики. */
  name: string
}

export type InputOrigin = 'local' | 'chat'
