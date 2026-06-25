const InputModule = {
  currentLine: "",
  localBuffer: "",

  submitLine(text, username) {
    const line = text.trim().toLowerCase().split(/\s+/)[0];
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
    this.updateChatDisplay(line, username);

    const enemy = this.findEnemy(line);

    this.animateShoot(line, enemy, username);
  },

  submitLocal(text) {
    const line = text.trim().toLowerCase().split(/\s+/)[0];
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
    this.updateLocalDisplay(line);

    const enemy = this.findEnemy(line);
    const username = channelName;

    this.animateShoot(line, enemy, username);
  },

  animateShoot(line, enemy, username) {
    const localEl = document.getElementById("typed-text");
    const chatEl = document.getElementById("chat-text");

    const isLocal = username === channelName;
    const el = isLocal ? localEl : chatEl;

    el.classList.add("shooting");

    setTimeout(() => {
      el.classList.remove("shooting");
      this.currentLine = "";
      if (isLocal) {
        this.updateLocalDisplay("");
        this.localBuffer = "";
      } else {
        this.updateChatDisplay("", "");
      }

      if (enemy) {
        game.launchProjectile(line, enemy, true, username);
      } else {
        game.launchProjectile(line, null, false, username);
      }
    }, S.inputShootDelay);
  },

  findEnemy(word) {
    for (let e of enemies) {
      if (e.isBoss) {
        const layer = e.layers[e.currentLayer];
        if (layer && layer.includes(word) && !e.killedInLayer.has(word)) {
          return e;
        }
      } else {
        if (e.text === word) {
          return e;
        }
      }
    }
    return null;
  },

  updateLocalDisplay(text) {
    const el = document.getElementById("typed-text");
    el.innerHTML = text;
  },

  updateChatDisplay(text, username) {
    const el = document.getElementById("chat-text");
    if (text) {
      el.innerHTML = `<span style="opacity:0.6">${username}:</span> ${text}`;
    } else {
      el.innerHTML = "";
    }
  },

  clear() {
    this.currentLine = "";
    this.localBuffer = "";
    this.updateLocalDisplay("");
    this.updateChatDisplay("", "");
  },
};
