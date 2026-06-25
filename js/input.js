const InputModule = {
  currentLine: "",

  submitLine(text, username) {
    const line = text.trim().toLowerCase();
    if (!line) return;
    if (introPlaying) return;

    if (line === CONFIG.commands.play) {
      if (gameState === "start" || gameState === "gameover") {
        startGame();
      }
      return;
    }

    if (gameState !== "playing") return;

    this.currentLine = line;
    this.updateDisplay(line);

    const enemy = this.findEnemy(line);

    this.animateShoot(line, enemy, username);
  },

  animateShoot(line, enemy, username) {
    const el = document.getElementById("typed-text");

    el.classList.add("shooting");

    setTimeout(() => {
      el.classList.remove("shooting");
      this.currentLine = "";
      this.updateDisplay("");

      if (enemy) {
        game.launchProjectile(line, enemy, true, username);
      } else {
        game.launchProjectile(line, null, false, username);
      }
    }, S.inputShootDelay);
  },

  findEnemy(word) {
    for (let e of enemies) {
      if (e.text === word) {
        return e;
      }
    }
    return null;
  },

  updateDisplay(text) {
    const el = document.getElementById("typed-text");
    el.innerHTML = text;
  },

  clear() {
    this.currentLine = "";
    this.updateDisplay("");
  },
};
