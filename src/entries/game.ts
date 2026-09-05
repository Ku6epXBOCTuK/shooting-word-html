import { bootstrapGame } from '../app/GameApp'

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement | null
if (!canvas) throw new Error('Shooting Word: не найден #game-canvas')

bootstrapGame(canvas).catch((error) => {
  console.error('Shooting Word: ошибка запуска', error)
})
