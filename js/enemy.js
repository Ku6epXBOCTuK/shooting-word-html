class Enemy {
  constructor(boss) {
    this.isBoss = !!boss;
    this.isHeavy = false;

    if (this.isBoss) {
      this.layers = [];
      this.currentLayer = 0;
      this.killedInLayer = new Set();
      for (let i = 0; i < CONFIG.game.bossLayers; i++) {
        const layerWords = [];
        for (let j = 0; j < CONFIG.game.bossWordsPerLayer; j++) {
          layerWords.push(WordGenerator.generateWord(false));
        }
        this.layers.push(layerWords);
      }
      this.height = S.enemyHeavyHeight * 1.5;
      this.speed = crossTimeToSpeed(getEnemyCrossTime("boss"));
    } else {
      const isHeavy = Math.random() < CONFIG.game.heavyEnemyChanceBase + wave * CONFIG.game.heavyEnemyChancePerWave;
      this.isHeavy = isHeavy;
      const wordData = WordGenerator.generateWord(isHeavy);

      if (isHeavy) {
        this.words = wordData;
        this.currentWordIndex = 0;
        this.text = this.words[0];
      } else {
        this.words = [wordData];
        this.currentWordIndex = 0;
        this.text = wordData;
      }

      this.height = isHeavy ? S.enemyHeavyHeight : S.enemySimpleHeight;

      if (isHeavy) {
        this.speed = crossTimeToSpeed(getEnemyCrossTime("slow"));
      } else {
        this.speed = crossTimeToSpeed(getEnemyCrossTime("fast"));
      }
    }

    this.y = 0;
    this.pulse = 0;
    this.flashTimer = 0;
    this.width = 0;
    this.x = this._calculateSpawnX();
  }

  _calculateSpawnX() {
    const padding = S.enemyPaddingX;
    const fontSize = this.isBoss
      ? S.enemyHeavyFont * 1.2
      : this.isHeavy ? S.enemyHeavyFont : S.enemySimpleFont;
    const fontWeight = (this.isBoss || this.isHeavy) ? "bold " : "";

    ctx.save();
    ctx.font = `${fontWeight}${fontSize}px 'Courier New', monospace`;

    let maxTextWidth = 0;
    if (this.isBoss) {
      for (const layer of this.layers) {
        let w = 0;
        for (const word of layer) {
          w += ctx.measureText(word).width;
        }
        w += (layer.length - 1) * 24;
        if (w > maxTextWidth) maxTextWidth = w;
      }
    } else {
      for (let word of this.words) {
        const w = ctx.measureText(word).width;
        if (w > maxTextWidth) maxTextWidth = w;
      }
    }
    ctx.restore();

    this.width = maxTextWidth + 24;
    const halfWidth = this.width / 2;

    const minX = padding + halfWidth;
    const maxX = W - padding - halfWidth;

    return minX + Math.random() * (maxX - minX);
  }

  hitWord(word) {
    if (this.isBoss) {
      this.killedInLayer.add(word);
      this.flashTimer = S.flashDuration;

      const layer = this.layers[this.currentLayer];
      const allKilled = layer.every(w => this.killedInLayer.has(w));

      if (allKilled) {
        this.currentLayer++;
        this.killedInLayer.clear();
        if (this.currentLayer >= this.layers.length) {
          return true;
        }
      }
      return false;
    }

    this.currentWordIndex++;
    this.flashTimer = S.flashDuration;
    if (this.currentWordIndex >= this.words.length) {
      return true;
    }
    this.text = this.words[this.currentWordIndex];
    return false;
  }

  update() {
    this.y += this.speed;
    this.pulse += 0.05;
    if (this.flashTimer > 0) this.flashTimer--;
  }

  draw() {
    const alpha = S.enemyAlphaBase + Math.sin(this.pulse) * S.enemyAlphaRange;
    const flash = this.flashTimer > 0;

    ctx.save();

    const fontSize = this.isBoss
      ? S.enemyHeavyFont * 1.2
      : this.isHeavy ? S.enemyHeavyFont : S.enemySimpleFont;
    const fontWeight = (this.isBoss || this.isHeavy) ? "bold " : "";

    const boxW = this.width;
    const boxH = this.height;

    const color = this.isBoss ? CONFIG.colors.boss : this.isHeavy ? CONFIG.colors.heavy : CONFIG.colors.primary;
    ctx.shadowColor = flash ? CONFIG.colors.white : color;
    ctx.shadowBlur = flash ? S.enemyFlashGlow : S.enemyGlow + Math.sin(this.pulse * 2) * S.enemyGlowPulse;

    const rgb = this.isBoss ? "255,68,68" : this.isHeavy ? "255,170,0" : "0,255,65";
    ctx.strokeStyle = flash ? CONFIG.colors.white : `rgba(${rgb},${alpha})`;
    ctx.lineWidth = flash ? S.enemyLineWidth * 2 : S.enemyLineWidth;

    if (this.isBoss) {
      const off = S.enemyAlienOffset;
      ctx.beginPath();
      ctx.moveTo(this.x - boxW / 2 + off, this.y - boxH / 2);
      ctx.lineTo(this.x + boxW / 2 - off, this.y - boxH / 2);
      ctx.lineTo(this.x + boxW / 2, this.y - boxH / 2 + off);
      ctx.lineTo(this.x + boxW / 2, this.y + boxH / 2 - off);
      ctx.lineTo(this.x + boxW / 2 - off, this.y + boxH / 2);
      ctx.lineTo(this.x - boxW / 2 + off, this.y + boxH / 2);
      ctx.lineTo(this.x - boxW / 2, this.y + boxH / 2 - off);
      ctx.lineTo(this.x - boxW / 2, this.y - boxH / 2 + off);
      ctx.closePath();
      ctx.fillStyle = flash ? "#ffffff" : "#0a0a0a";
      ctx.fill();
      ctx.stroke();

      const barW = boxW - S.armorBarPad;
      const barH = S.enemyArmorBarHeight;
      const totalLayers = this.layers.length;
      const remainingLayers = totalLayers - this.currentLayer;
      ctx.fillStyle = CONFIG.colors.armorBarBg;
      ctx.fillRect(this.x - barW / 2, this.y - boxH / 2 - S.enemyArmorBarOffset, barW, barH);
      ctx.fillStyle = flash ? CONFIG.colors.white : CONFIG.colors.armorBarFill;
      ctx.fillRect(
        this.x - barW / 2,
        this.y - boxH / 2 - S.enemyArmorBarOffset,
        barW * (remainingLayers / totalLayers),
        barH,
      );

      if (wave <= 5) {
        ctx.font = `${S.armorBarFont}px "Courier New", monospace`;
        ctx.fillStyle = flash ? CONFIG.colors.white : CONFIG.colors.boss;
        ctx.textAlign = "center";
        ctx.fillText(
          `BOSS ${remainingLayers}/${totalLayers}`,
          this.x,
          this.y - boxH / 2 - S.enemyArmorLabelOffset,
        );
      }

      ctx.shadowBlur = 0;
      ctx.font = `${fontWeight}${fontSize}px 'Courier New', monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const layer = this.layers[this.currentLayer];
      const wordGap = 24;

      let totalTextW = 0;
      const wordWidths = [];
      for (const word of layer) {
        const w = ctx.measureText(word).width;
        wordWidths.push(w);
        totalTextW += w;
      }
      totalTextW += (layer.length - 1) * wordGap;

      let drawX = this.x - totalTextW / 2;

      for (let i = 0; i < layer.length; i++) {
        const word = layer[i];
        const w = wordWidths[i];
        const wordX = drawX + w / 2;

        if (this.killedInLayer.has(word)) {
          ctx.fillStyle = flash ? CONFIG.colors.white : `rgba(${rgb},0.3)`;
          ctx.fillText(word, wordX, this.y);
          ctx.beginPath();
          ctx.moveTo(wordX - w / 2, this.y);
          ctx.lineTo(wordX + w / 2, this.y);
          ctx.strokeStyle = flash ? CONFIG.colors.white : CONFIG.colors.boss;
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          ctx.fillStyle = flash ? CONFIG.colors.white : CONFIG.colors.boss;
          ctx.fillText(word, wordX, this.y);
        }

        drawX += w + wordGap;
      }
    } else if (this.isHeavy) {
      const off = S.enemyAlienOffset;
      ctx.beginPath();
      ctx.moveTo(this.x - boxW / 2 + off, this.y - boxH / 2);
      ctx.lineTo(this.x + boxW / 2 - off, this.y - boxH / 2);
      ctx.lineTo(this.x + boxW / 2, this.y);
      ctx.lineTo(this.x + boxW / 2 - off, this.y + boxH / 2);
      ctx.lineTo(this.x - boxW / 2 + off, this.y + boxH / 2);
      ctx.lineTo(this.x - boxW / 2, this.y);
      ctx.closePath();
      ctx.fillStyle = flash ? "#ffffff" : "#0a0a0a";
      ctx.fill();
      ctx.stroke();

      const barW = boxW - S.armorBarPad;
      const barH = S.enemyArmorBarHeight;
      const totalLayers = this.words.length;
      const remainingLayers = totalLayers - this.currentWordIndex;
      ctx.fillStyle = CONFIG.colors.armorBarBg;
      ctx.fillRect(this.x - barW / 2, this.y - boxH / 2 - S.enemyArmorBarOffset, barW, barH);
      ctx.fillStyle = flash ? CONFIG.colors.white : CONFIG.colors.armorBarFill;
      ctx.fillRect(
        this.x - barW / 2,
        this.y - boxH / 2 - S.enemyArmorBarOffset,
        barW * (remainingLayers / totalLayers),
        barH,
      );

      if (wave <= 5) {
        ctx.font = `${S.armorBarFont}px "Courier New", monospace`;
        ctx.fillStyle = flash ? CONFIG.colors.white : CONFIG.colors.heavy;
        ctx.textAlign = "center";
        ctx.fillText(
          `${CONFIG.texts.armorLabel} ${remainingLayers}/${totalLayers}`,
          this.x,
          this.y - boxH / 2 - S.enemyArmorLabelOffset,
        );
      }

      ctx.shadowBlur = 0;
      ctx.font = `${fontWeight}${fontSize}px 'Courier New', monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = flash ? CONFIG.colors.white : CONFIG.colors.heavy;
      ctx.fillText(this.text, this.x, this.y);
    } else {
      ctx.fillStyle = flash ? "#ffffff" : "#0a0a0a";
      ctx.fillRect(this.x - boxW / 2, this.y - boxH / 2, boxW, boxH);
      ctx.strokeRect(this.x - boxW / 2, this.y - boxH / 2, boxW, boxH);

      ctx.shadowBlur = 0;
      ctx.font = `${fontWeight}${fontSize}px 'Courier New', monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = flash ? CONFIG.colors.white : CONFIG.colors.primary;
      ctx.fillText(this.text, this.x, this.y);
    }

    ctx.restore();
  }

  getBounds() {
    return {
      left: this.x - this.width / 2,
      right: this.x + this.width / 2,
      top: this.y - this.height / 2,
      bottom: this.y + this.height / 2,
    };
  }
}
