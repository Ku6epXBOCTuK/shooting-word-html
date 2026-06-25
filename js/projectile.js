class Projectile {
  constructor(word, targetEnemy, isHit, username) {
    this.word = word;
    this.isHit = isHit;
    this.username = username;
    this.x = W / 2;
    this.y = H - S.shooterOffset;
    this.speed = S.projectileSpeed;
    this.life = 1;
    this.trail = [];
    this.hit = false;

    if (isHit && targetEnemy) {
      this.target = targetEnemy;
      this.targetX = targetEnemy.x;
      this.targetY = targetEnemy.y;
      const dx = targetEnemy.x - this.x;
      const dy = targetEnemy.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      this.vx = (dx / dist) * this.speed;
      this.vy = (dy / dist) * this.speed;
    } else {
      this.target = null;
      this.targetX = S.missTargetPadX + Math.random() * (W - 2 * S.missTargetPadX);
      this.targetY = S.missTargetPadY + Math.random() * (H * S.missTargetYRange);
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      this.vx = (dx / dist) * this.speed;
      this.vy = (dy / dist) * this.speed;
    }
  }

  update() {
    this.trail.push({ x: this.x, y: this.y, life: 1 });
    if (this.trail.length > S.projectileTrailLength) this.trail.shift();

    for (let t of this.trail) {
      t.life -= S.projectileTrailDecay;
    }
    this.trail = this.trail.filter((t) => t.life > 0);

    this.x += this.vx;
    this.y += this.vy;

    if (this.isHit && this.target && !this.hit) {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < S.projectileHitRadius) {
        this.hit = true;
        game.onProjectileHit(this, this.target);
        return false;
      }

      if (!enemies.includes(this.target)) {
        return false;
      }
    }

    if (!this.isHit && !this.hit) {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < S.projectileMissRadius) {
        this.hit = true;
        game.onProjectileMiss(this);
        return false;
      }
    }

    const off = S.shooterOffset;
    if (this.x < -off || this.x > W + off || this.y < -off || this.y > H + off) {
      return false;
    }

    return true;
  }

  draw() {
    ctx.save();

    const color = this.isHit ? CONFIG.colors.primary : CONFIG.colors.miss;
    const glowColor = this.isHit ? CONFIG.colors.primary : CONFIG.colors.miss;

    for (let i = 0; i < this.trail.length; i++) {
      const t = this.trail[i];
      ctx.globalAlpha = t.life * S.projectileTrailAlpha;
      ctx.fillStyle = color;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = S.trailGlow;
      const size = S.trailSizeBase + i * S.trailSizeInc;
      ctx.fillRect(t.x - size / 2, t.y - size / 2, size, size);
    }

    ctx.globalAlpha = 1;
    ctx.font = `bold ${S.projectileFont}px "Courier New", monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = S.projectileGlow;
    ctx.fillText(this.word, this.x, this.y);

    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = S.projectileCircleAlpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, S.projectileCircleRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
}
