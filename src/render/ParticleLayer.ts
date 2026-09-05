import { Container, Particle, ParticleContainer, Texture } from 'pixi.js'
import type { GameEntity, GameWorld } from '../ecs/world'
import { tintOf } from './textures'

/** Размер эталонной белой текстуры Pixi (Texture.WHITE). */
const WHITE_TEXTURE_SIZE = 16

/**
 * Частицы — сущности ECS, отрисовка — один ParticleContainer.
 * Батч всего слоя за один draw call, без Graphics на частицу.
 */
export class ParticleLayer {
  private readonly container = new ParticleContainer({
    dynamicProperties: { position: true, scale: true, rotation: false, color: true },
  })
  private readonly views = new Map<GameEntity, Particle>()

  constructor(parent: Container, world: GameWorld) {
    parent.addChild(this.container)
    world.onEntityAdded.subscribe((entity) => {
      if (!entity.particle) return
      const particle = new Particle({
        texture: Texture.WHITE,
        x: entity.position?.x ?? 0,
        y: entity.position?.y ?? 0,
        anchorX: 0.5,
        anchorY: 0.5,
        tint: tintOf(entity.particle.color),
        alpha: entity.lifetime?.remaining ?? 1,
      })
      this.views.set(entity, particle)
      this.container.addParticle(particle)
    })
    world.onEntityRemoved.subscribe((entity) => {
      const particle = this.views.get(entity)
      if (!particle) return
      this.container.removeParticle(particle)
      this.views.delete(entity)
    })
  }

  update(world: GameWorld): void {
    for (const [entity, particle] of this.views) {
      particle.x = entity.position?.x ?? 0
      particle.y = entity.position?.y ?? 0
      particle.alpha = Math.max(0, entity.lifetime?.remaining ?? 0)
      const scale = (entity.particle?.size ?? 4) / WHITE_TEXTURE_SIZE
      particle.scaleX = scale
      particle.scaleY = scale
    }
  }
}
