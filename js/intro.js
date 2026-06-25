function runIntro() {
  introPlaying = true;
  const I = CONFIG.intro;
  const ih = H / 1000;
  const IS = {
    fontSize: Math.round(I.fontSize * ih),
    glow: Math.round(I.glow * ih),
    trailGlow: Math.round(I.trailGlow * ih),
    projectileGlow: Math.round(I.projectileGlow * ih),
    projectileRadius: Math.round(I.projectileRadius * ih),
    trailRect: Math.round(I.trailRect * ih),
    subtitleFont: Math.round(I.subtitleFont * ih),
    subtitleGlow: Math.round(I.subtitleGlow * ih),
    subtitleYOffset: Math.round(I.subtitleYOffset * ih),
  };
  const TEXT_Y = Math.round(H * I.textYR);
  ctx.save();
  ctx.font = `bold ${IS.fontSize}px "Courier New", monospace`;
  const totalW = ctx.measureText("SHOOTING WORLD").width;
  const worW = ctx.measureText("SHOOTING WOR").width;
  const lW = ctx.measureText("L").width;
  const dW = ctx.measureText("D").width;
  ctx.restore();

  const cx = W / 2;
  const lTargetX = cx - totalW / 2 + worW + lW / 2;
  const lTargetY = TEXT_Y;
  const shooterX = cx;
  const shooterY = H - S.shooterOffset;

  let frame = 0;
  let textAlpha = 0;
  let p1 = [];
  let shots = [];

  function drawPartialWorld(alpha, dSlide) {
    ctx.save();
    ctx.font = `bold ${IS.fontSize}px "Courier New", monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.globalAlpha = alpha;
    ctx.fillStyle = CONFIG.colors.primary;
    ctx.shadowColor = CONFIG.colors.primaryGlow;
    ctx.shadowBlur = IS.glow;
    ctx.fillText("SHOOTING WOR", cx - totalW / 2 + worW / 2, TEXT_Y);

    const lFade = Math.max(0, 1 - dSlide);
    if (lFade > 0) {
      ctx.globalAlpha = alpha * lFade;
      ctx.fillText("L", cx - totalW / 2 + worW + lW / 2, TEXT_Y);
    }

    const dOffset = lW * dSlide;
    ctx.globalAlpha = alpha;
    ctx.fillText("D", cx - totalW / 2 + worW + lW + dW / 2 - dOffset, TEXT_Y);

    ctx.restore();
  }

  function drawShotProjectile(s) {
    const x = shooterX + (lTargetX - shooterX) * s.progress;
    const y = shooterY + (lTargetY - shooterY) * s.progress;
    ctx.save();

    for (let t of s.trail) {
      ctx.globalAlpha = t.life * I.trailAlpha;
      ctx.fillStyle = CONFIG.colors.primary;
      ctx.shadowColor = CONFIG.colors.primary;
      ctx.shadowBlur = IS.trailGlow;
      ctx.fillRect(t.x - IS.trailRect / 2, t.y - IS.trailRect / 2, IS.trailRect, IS.trailRect);
    }

    if (!s.done) {
      ctx.globalAlpha = 1;
      ctx.fillStyle = CONFIG.colors.primary;
      ctx.shadowColor = CONFIG.colors.primary;
      ctx.shadowBlur = IS.projectileGlow;
      ctx.beginPath();
      ctx.arc(x, y, IS.projectileRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function introLoop() {
    frame++;

    if (frame <= I.fadeInFrames) {
      textAlpha = Math.min(1, frame / I.fadeInFrames);
    }

    if (frame === I.shot1Frame) shots.push({ progress: 0, trail: [], done: false });
    if (frame === I.shot2Frame) shots.push({ progress: 0, trail: [], done: false });
    if (frame === I.shot3Frame) shots.push({ progress: 0, trail: [], done: false });

    for (let s of shots) {
      if (s.done) continue;
      s.progress = Math.min(1, s.progress + I.shotSpeed);

      const x = shooterX + (lTargetX - shooterX) * s.progress;
      const y = shooterY + (lTargetY - shooterY) * s.progress;

      s.trail.push({ x, y, life: 1 });
      if (s.trail.length > I.trailMax) s.trail.shift();
      for (let t of s.trail) t.life -= I.trailDecay;
      s.trail = s.trail.filter((t) => t.life > 0);

      if (s.progress >= 1) {
        s.done = true;
        for (let i = 0; i < I.particleCountPerHit; i++) {
          p1.push(new Particle(lTargetX, lTargetY, CONFIG.colors.primary));
        }
      }
    }

    let dSlide = 0;
    if (frame >= I.slideStartFrame) {
      dSlide = Math.min(1, (frame - I.slideStartFrame) / I.slideDuration);
    }

    for (let p of p1) p.update();
    p1 = p1.filter((p) => p.life > 0);

    ctx.clearRect(0, 0, W, H);
    drawGrid();

    drawPartialWorld(textAlpha, dSlide);
    for (let s of shots) drawShotProjectile(s);
    for (let p of p1) p.draw();

    if (frame < I.totalFrames) {
      requestAnimationFrame(introLoop);
    } else {
      p1 = [];
      introPlaying = false;
      ctx.clearRect(0, 0, W, H);
      drawGrid();
      drawPartialWorld(1, 1);
      ctx.save();
      ctx.font = `${IS.subtitleFont}px "Courier New", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = CONFIG.colors.primaryDim;
      ctx.shadowColor = CONFIG.colors.primary;
      ctx.shadowBlur = IS.subtitleGlow;
      ctx.fillText(CONFIG.texts.startSubtitle, cx, TEXT_Y + IS.subtitleYOffset);
      ctx.restore();
    }
  }

  setTimeout(introLoop, I.startDelay);
}
