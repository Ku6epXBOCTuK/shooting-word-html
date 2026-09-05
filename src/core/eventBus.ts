export type EventHandler<T> = (payload: T) => void

/** Минималистичная типизированная шина событий: источники ввода/логика — издатели, рендер и DOM-UI — подписчики. */
export class EventBus<Events extends Record<string, unknown>> {
  private handlers = new Map<keyof Events, Set<EventHandler<never>>>()

  on<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): () => void {
    let set = this.handlers.get(event)
    if (!set) {
      set = new Set()
      this.handlers.set(event, set)
    }
    set.add(handler as EventHandler<never>)
    return () => set.delete(handler as EventHandler<never>)
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    const set = this.handlers.get(event)
    if (!set) return
    for (const handler of [...set]) {
      ;(handler as EventHandler<Events[K]>)(payload)
    }
  }
}
