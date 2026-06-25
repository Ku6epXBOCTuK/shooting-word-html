const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
let W, H;

let gameState = "start";
let score = 0,
  wave = 1,
  lives = 3;
let enemies = [];
let particles = [];
let projectiles = [];
let spawnTimer = 0;
let waveEnemiesLeft = 0;
let waveTimer = 0;
let wavePauseTimer = 0;
let wavePauseText = "";
let wavePauseActive = false;
let shakeTimer = 0;
let shakeAmount = 0;
let bgOffset = 0;
let gameLoopStarted = false;
let introPlaying = false;

let playerStats = {};

const params = new URLSearchParams(location.search);
const settings = {
  singlePlay: params.get("singlePlay") === "1",
};

function initKeyboardBridge() {
  if (initKeyboardBridge._done) return;
  initKeyboardBridge._done = true;
  let buffer = "";
  document.addEventListener("keydown", (e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      buffer = buffer.slice(0, -1);
      InputModule.updateLocalDisplay(buffer);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const line = buffer;
      buffer = "";
      InputModule.submitLocal(line);
      InputModule.updateLocalDisplay("");
    } else if (e.key === "Escape") {
      buffer = "";
      InputModule.clear();
    } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      buffer += e.key;
      InputModule.updateLocalDisplay(buffer);
    }
  });
}

const game = {
  launchProjectile(word, targetEnemy, isHit, username) {
    projectiles.push(new Projectile(word, targetEnemy, isHit, username));
  },

  onProjectileHit(projectile, enemy) {
    const dead = enemy.hitWord(projectile.word);

    if (dead) {
      score += enemy.isBoss ? CONFIG.game.scoreBoss : enemy.isHeavy ? CONFIG.game.scoreHeavy : CONFIG.game.scoreSimple;
      document.getElementById("score").textContent = score;
      if (projectile.username) {
        if (!playerStats[projectile.username]) playerStats[projectile.username] = { kills: 0, misses: 0 };
        playerStats[projectile.username].kills++;
      }
      this.destroyEnemy(enemy);
    } else {
      const color = enemy.isBoss ? "#ff4444" : CONFIG.colors.heavy;
      spawnParticles(enemy.x, enemy.y, color, S.particleArmorBreak);
      triggerShake(S.shakeHit, S.shakeHitDuration);
    }
  },

  onProjectileMiss(projectile) {
    spawnParticles(projectile.targetX, projectile.targetY, CONFIG.colors.miss, S.particleMiss);
    triggerShake(S.shakeMiss, S.shakeMissDuration);
    if (projectile.username) {
      if (!playerStats[projectile.username]) playerStats[projectile.username] = { kills: 0, misses: 0 };
      playerStats[projectile.username].misses++;
    }
  },

  destroyEnemy(enemy) {
    const idx = enemies.indexOf(enemy);
    if (idx > -1) {
      const color = enemy.isBoss ? "#ff4444" : enemy.isHeavy ? CONFIG.colors.heavy : CONFIG.colors.primary;
      const count = enemy.isBoss
        ? S.particleDestroyHeavy * 2
        : enemy.isHeavy
          ? S.particleDestroyHeavy
          : S.particleDestroySimple;
      spawnParticles(enemy.x, enemy.y, color, count);
      enemies.splice(idx, 1);
    }
  },
};

function spawnEnemy() {
  enemies.push(new Enemy());
}

function spawnBoss() {
  enemies.push(new Enemy(true));
}

function getEnemiesPerWave() {
  return CONFIG.game.enemiesPerWaveBase + (wave - 1) * CONFIG.game.enemiesPerWaveInc;
}

function takeDamage() {
  lives--;
  document.getElementById("lives").textContent = "♡".repeat(CONFIG.game.startLives - lives) + "♥".repeat(lives);
  triggerShake(S.shakeDamage, S.shakeDamageDuration);
  document.getElementById("game-container").classList.add("glitch");
  setTimeout(
    () => document.getElementById("game-container").classList.remove("glitch"),
    S.glitchDuration,
  );

  if (lives <= 0) {
    gameOver();
  }
}

let gameOverTimeout = null;

function renderPlayerStats() {
  const container = document.getElementById("player-stats");
  container.innerHTML = "";

  const names = Object.keys(playerStats);
  if (names.length === 0) return;

  const byKills = names.slice().sort((a, b) => playerStats[b].kills - playerStats[a].kills);
  const top3 = byKills.slice(0, 3);

  const sectionTitle = document.createElement("div");
  sectionTitle.className = "stats-section-title";
  sectionTitle.textContent = "УБИЙЦЫ";
  container.appendChild(sectionTitle);

  top3.forEach((name, i) => {
    const row = document.createElement("div");
    row.className = "stats-row" + (i === 0 ? " stats-top1" : i === 1 ? " stats-top2" : " stats-top3");
    const crown = i === 0 ? '<span class="stats-crown">👑</span> ' : "";
    const place = i === 0 ? "1" : i === 1 ? "2" : "3";
    row.innerHTML = `<span class="stats-place">#${place}</span> ${crown}<span class="stats-name">${name}</span> <span class="stats-kills">${playerStats[name].kills}</span>`;
    container.appendChild(row);
  });

  let maxMisses = 0;
  let mazilaName = "";
  for (const name of names) {
    if (playerStats[name].misses > maxMisses) {
      maxMisses = playerStats[name].misses;
      mazilaName = name;
    }
  }

  if (mazilaName && maxMisses > 0) {
    const mazila = document.createElement("div");
    mazila.className = "stats-mazila";
    mazila.innerHTML = `<span class="mazila-title">Мазила:</span> ${mazilaName} <span class="mazila-count">(${maxMisses})</span>`;
    container.appendChild(mazila);
  }
}

function gameOver() {
  gameState = "gameover";
  document.getElementById("final-score").textContent = score;
  renderPlayerStats();
  document.getElementById("gameover-screen").classList.remove("hidden");
  document.getElementById("gameover-subtitle").classList.add("hidden");

  if (gameOverTimeout) clearTimeout(gameOverTimeout);
  gameOverTimeout = setTimeout(() => {
    gameOverTimeout = null;
    document.getElementById("gameover-screen").classList.add("hidden");
    document.getElementById("ui-overlay").classList.add("hidden");
    document.getElementById("input-chat").classList.add("hidden");
    gameLoopStarted = false;
    if (!settings.singlePlay) {
      recalc();
      runIntro();
    } else {
      document.body.classList.add("hidden");
    }
  }, CONFIG.game.gameOverDelay);
}

function startGame() {
  if (gameOverTimeout) {
    clearTimeout(gameOverTimeout);
    gameOverTimeout = null;
  }
  gameState = "playing";
  score = CONFIG.game.startScore;
  wave = CONFIG.game.startWave;
  lives = CONFIG.game.startLives;
  enemies = [];
  particles = [];
  projectiles = [];
  playerStats = {};
  spawnTimer = 0;
  waveEnemiesLeft = getEnemiesPerWave();
  waveTimer = 0;
  wavePauseActive = false;
  InputModule.clear();

  document.getElementById("score").textContent = score;
  document.getElementById("wave").textContent = wave;
  document.getElementById("lives").textContent = "♡".repeat(CONFIG.game.startLives - lives) + "♥".repeat(lives);
  document.getElementById("start-screen").classList.add("hidden");
  document.getElementById("gameover-screen").classList.add("hidden");
  document.getElementById("ui-overlay").classList.remove("hidden");
  document.getElementById("input-chat").classList.remove("hidden");

  if (!gameLoopStarted) {
    gameLoopStarted = true;
    loop();
  }
}

function update() {
  if (gameState !== "playing") return;

  if (wavePauseActive) {
    wavePauseTimer--;
    if (wavePauseTimer <= 0) {
      wavePauseActive = false;
      waveEnemiesLeft = getEnemiesPerWave();
      if (wave % CONFIG.game.bossEveryNthWave === 0) {
        spawnBoss();
      }
    }
  } else if (waveEnemiesLeft > 0) {
    spawnTimer++;
    const spawnInterval = CONFIG.game.waveInterval / getEnemiesPerWave();
    if (spawnTimer >= spawnInterval) {
      spawnEnemy();
      waveEnemiesLeft--;
      spawnTimer = 0;
    }
  }

  waveTimer++;
  if (waveTimer >= CONFIG.game.waveInterval && !wavePauseActive && waveEnemiesLeft <= 0) {
    wave++;
    waveTimer = 0;
    document.getElementById("wave").textContent = wave;
    wavePauseActive = true;
    wavePauseTimer = 120;
    wavePauseText = wave % CONFIG.game.bossEveryNthWave === 0
      ? `BOSS INCOMING`
      : `WAVE ${wave} INCOMING`;
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    e.update();

    if (e.y > H - S.removeZone) {
      takeDamage();
      enemies.splice(i, 1);
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    if (particles[i].life <= 0) particles.splice(i, 1);
  }

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const alive = projectiles[i].update();
    if (!alive) {
      projectiles.splice(i, 1);
    }
  }

  if (shakeTimer > 0) {
    shakeTimer--;
    shakeAmount *= 0.9;
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  ctx.save();
  if (shakeTimer > 0) {
    ctx.translate((Math.random() - 0.5) * shakeAmount, (Math.random() - 0.5) * shakeAmount);
  }

  drawGrid();

  for (let p of projectiles) p.draw();
  for (let p of particles) p.draw();
  const sortedEnemies = enemies.slice().sort((a, b) => a.speed - b.speed);
  for (let e of sortedEnemies) e.draw();

  if (wavePauseActive) {
    const alpha = wavePauseTimer > 30 ? 1 : wavePauseTimer / 30;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `bold ${Math.round(36 * H / 1000)}px "Courier New", monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = wavePauseText === "BOSS INCOMING" ? "#ff4444" : CONFIG.colors.primary;
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 20;
    ctx.fillText(wavePauseText, W / 2, S.inputAreaHeight + 40);
    ctx.restore();
  }

  ctx.save();
  ctx.fillStyle = CONFIG.colors.primary;
  ctx.shadowColor = CONFIG.colors.primary;
  ctx.shadowBlur = S.playerGlow;
  ctx.beginPath();
  ctx.arc(W / 2, H - S.playerY, S.playerRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

function loop() {
  update();
  draw();
  if (gameLoopStarted) {
    requestAnimationFrame(loop);
  }
}
