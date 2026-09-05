/** Реестр обработчиков кадра; delta — прошедшие кадры, нормированные к 60 FPS (аналог старого frameFactor). */
export class GameClock {
  private subscribers = new Set<(deltaFrames: number) => void>()
  private rafId = 0
  private lastTime = 0
  private running = false

  add(handler: (deltaFrames: number) => void): void {
    this.subscribers.add(handler)
  }

  isRunning(): boolean {
    return this.running
  }

  start(): void {
    if (this.running) return
    this.running = true
    this.lastTime = 0
    this.rafId = requestAnimationFrame(this.frame)
  }

  stop(): void {
    this.running = false
    cancelAnimationFrame(this.rafId)
  }

  private frame = (timestamp: number): void => {
    if (!this.running) return
    let delta = 1
    if (this.lastTime && timestamp) {
      delta = Math.min((timestamp - this.lastTime) / (1000 / 60), 6)
    }
    this.lastTime = timestamp || performance.now()
    for (const handler of [...this.subscribers]) {
      try {
        handler(delta)
      } catch (error) {
        // Виджет живёт в OBS часами: сбой кадра не должен убивать цикл навсегда.
        console.error('Shooting Word: ошибка кадра', error)
      }
    }
    if (this.running) this.rafId = requestAnimationFrame(this.frame)
  }
}
