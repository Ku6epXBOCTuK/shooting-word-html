class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * S.particleVel;
    this.vy = (Math.random() - 0.5) * S.particleVel;
    this.life = 1;
    this.decay = S.particleDecayBase + Math.random() * S.particleDecayRange;
    this.color = color;
    this.size = S.particleSizeMin + Math.random() * (S.particleSizeMax - S.particleSizeMin);
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;
    this.vx *= S.particleDamping;
    this.vy *= S.particleDamping;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = S.particleGlow;
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    ctx.restore();
  }
}
