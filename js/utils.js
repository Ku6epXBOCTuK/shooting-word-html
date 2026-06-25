function crossTimeToSpeed(crossTimeSec) {
  const playH = H - S.removeZone;
  return playH / (crossTimeSec * 60);
}

function getEnemyCrossTime(type) {
  const SP = CONFIG.speed;
  if (type === "slow") {
    const t = Math.min(wave / SP.slowEnemyCrossTimeCapWave, 1);
    return SP.slowEnemyCrossTimeStart - (SP.slowEnemyCrossTimeStart - SP.slowEnemyCrossTimeCap) * t;
  }
  if (type === "fast") {
    const t = Math.min(wave / SP.fastEnemyCrossTimeCapWave, 1);
    return SP.fastEnemyCrossTimeStart - (SP.fastEnemyCrossTimeStart - SP.fastEnemyCrossTimeCap) * t;
  }
  return SP.bossCrossTime;
}

let S = {};

function recalc() {
  const dpr = window.devicePixelRatio || 1;
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  S = {};

  const V = CONFIG.visual;
  const C = CONFIG.counts;
  const R = CONFIG.visualRatio;
  const T = CONFIG.timing;

  S.gridSize = Math.round(V.gridSize * W / 1000);
  S.enemyPaddingX = Math.round(V.enemyPaddingX * W / 1000);
  S.enemyAlienOffset = Math.round(V.enemyAlienOffset * W / 1000);
  S.armorBarPad = Math.round(V.armorBarPad * W / 1000);
  S.armorBarFont = Math.round(V.armorBarFont * W / 1000);
  S.missTargetPadX = Math.round(V.missTargetPadX * W / 1000);
  S.missTargetPadY = Math.round(V.missTargetPadY * H / 1000);
  S.inputAreaHeight = Math.round(V.inputAreaHeight * H / 1000);
  S.removeZone = Math.round(V.removeZone * H / 1000);

  for (const k of ["playerY","playerRadius","playerGlow","enemySimpleHeight","enemyHeavyHeight",
    "enemySimpleFont","enemyHeavyFont","enemyArmorBarHeight","enemyArmorBarOffset",
    "enemyArmorLabelOffset","enemyGlow","enemyFlashGlow","enemyLineWidth",
    "projectileGlow","projectileHitRadius","projectileMissRadius","projectileFont",
    "projectileCircleRadius","shakeHit","shakeMiss","shakeDamage","particleVel",
    "particleSizeMin","particleSizeMax","particleGlow","trailSizeBase","trailSizeInc",
    "trailGlow","shooterOffset"]) {
    S[k] = Math.round(V[k] * H / 1000);
  }

  S.projectileSpeed = H / (CONFIG.speed.projectileCrossTime * 60);
  S.gridSpeed = CONFIG.speed.gridSpeed * H / 1000;

  for (const k of ["projectileTrailLength","particleHit","particleMiss",
    "particleDestroySimple","particleDestroyHeavy","particleArmorBreak",
    "flashDuration","shakeHitDuration","shakeMissDuration","shakeDamageDuration",
    "trailMaxLength","trailDecay","trailAlpha"]) {
    S[k] = C[k];
  }

  for (const k of ["missTargetYRange","projectileTrailLength","projectileTrailDecay",
    "projectileTrailAlpha","projectileCircleAlpha","enemyPulseRate","enemyAlphaBase",
    "enemyAlphaRange","enemyGlowPulse","particleDecayBase","particleDecayRange",
    "particleDamping"]) {
    S[k] = R[k];
  }

  S.inputShootDelay = T.inputShootDelay;
  S.glitchDuration = T.glitchDuration;

  applyOverlayScale(W, H);
}

function applyOverlayScale(W, H) {
  const title = document.querySelector(".screen-title");
  if (title) title.style.fontSize = Math.round(40 * H / 1000) + "px";
  const subs = document.querySelectorAll(".screen-subtitle");
  for (let el of subs) el.style.fontSize = Math.round(18 * H / 1000) + "px";

  const overlay = document.getElementById("ui-overlay");
  if (overlay) {
    overlay.style.padding = Math.round(12 * H / 1000) + "px " + Math.round(16 * W / 1000) + "px";
    overlay.style.fontSize = Math.round(14 * H / 1000) + "px";
  }
  const inputDisplay = document.getElementById("input-display");
  if (inputDisplay) {
    inputDisplay.style.padding = Math.round(14 * H / 1000) + "px " + Math.round(16 * W / 1000) + "px";
  }
  const typed = document.getElementById("typed-text");
  if (typed) {
    typed.style.fontSize = Math.round(20 * H / 1000) + "px";
    typed.style.minHeight = Math.round(28 * H / 1000) + "px";
  }
  const chatText = document.getElementById("chat-text");
  if (chatText) {
    chatText.style.fontSize = Math.round(16 * H / 1000) + "px";
    chatText.style.minHeight = Math.round(28 * H / 1000) + "px";
  }
  const chForm = document.getElementById("channel-form");
  if (chForm) {
    chForm.querySelector(".screen-title").style.fontSize = Math.round(80 * H / 1000) + "px";
    const inp = chForm.querySelector("input");
    if (inp) {
      inp.style.fontSize = Math.round(22 * H / 1000) + "px";
      inp.style.padding = Math.round(12 * H / 1000) + "px " + Math.round(20 * W / 1000) + "px";
      inp.style.width = Math.round(300 * W / 1000) + "px";
    }
    const btn = chForm.querySelector("button");
    if (btn) {
      btn.style.fontSize = Math.round(18 * H / 1000) + "px";
      btn.style.padding = Math.round(10 * H / 1000) + "px " + Math.round(40 * W / 1000) + "px";
      btn.style.minWidth = Math.round(260 * W / 1000) + "px";
    }
    const link = document.getElementById("game-link");
    if (link) link.style.fontSize = Math.round(16 * H / 1000) + "px";
    const note = chForm.querySelector(".obs-note");
    if (note) note.style.fontSize = Math.round(16 * H / 1000) + "px";
  }
  const goTitle = document.getElementById("gameover-title");
  if (goTitle) goTitle.style.fontSize = Math.round(64 * H / 1000) + "px";
  const goSubs = document.querySelectorAll("#gameover-screen .screen-subtitle");
  for (let el of goSubs) el.style.fontSize = Math.round(28 * H / 1000) + "px";
  const statsTitle = document.querySelectorAll(".stats-section-title");
  for (let el of statsTitle) el.style.fontSize = Math.round(28 * H / 1000) + "px";
  const statsTop1 = document.querySelectorAll(".stats-top1");
  for (let el of statsTop1) el.style.fontSize = Math.round(48 * H / 1000) + "px";
  const statsTop2 = document.querySelectorAll(".stats-top2");
  for (let el of statsTop2) el.style.fontSize = Math.round(36 * H / 1000) + "px";
  const statsTop3 = document.querySelectorAll(".stats-top3");
  for (let el of statsTop3) el.style.fontSize = Math.round(28 * H / 1000) + "px";
  const statsRow = document.querySelectorAll(".stats-row:not(.stats-top1):not(.stats-top2):not(.stats-top3)");
  for (let el of statsRow) el.style.fontSize = Math.round(24 * H / 1000) + "px";
  const mazila = document.querySelectorAll(".stats-mazila");
  for (let el of mazila) el.style.fontSize = Math.round(28 * H / 1000) + "px";
  const crown = document.querySelectorAll(".stats-crown");
  for (let el of crown) el.style.fontSize = Math.round(56 * H / 1000) + "px";
}

function drawGrid() {
  ctx.strokeStyle = CONFIG.colors.primaryGrid;
  ctx.lineWidth = 1;
  const gridSize = S.gridSize;
  bgOffset = (bgOffset + S.gridSpeed) % gridSize;
  for (let x = 0; x <= W; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = bgOffset; y <= H; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
}

function spawnParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(x, y, color));
  }
}

function triggerShake(amount, duration) {
  shakeAmount = amount;
  shakeTimer = duration;
}
