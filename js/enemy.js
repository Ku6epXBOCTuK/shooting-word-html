class Enemy {
  constructor() {
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

    this.y = 0;
    this.speed = isHeavy
      ? S.heavyEnemySpeedBase + Math.random() * S.heavyEnemySpeedRandom
      : Math.min(
          S.simpleEnemySpeedBase +
            Math.random() * S.simpleEnemySpeedRandom +
            wave * S.simpleEnemySpeedPerWave,
          S.simpleEnemyMaxSpeed,
        );
    this.height = isHeavy ? S.enemyHeavyHeight : S.enemySimpleHeight;
    this.pulse = 0;
    this.flashTimer = 0;
    this.width = 0;
    this.x = this._calculateSpawnX();
  }

  _calculateSpawnX() {
    const padding = S.enemyPaddingX;

    ctx.save();
    ctx.font = `${this.isHeavy ? "bold " : ""}${this.isHeavy ? S.enemyHeavyFont : S.enemySimpleFont}px 'Courier New', monospace`;

    let maxTextWidth = 0;
    for (let word of this.words) {
      const w = ctx.measureText(word).width;
      if (w > maxTextWidth) maxTextWidth = w;
    }
    ctx.restore();

    this.width = maxTextWidth + 24;
    const halfWidth = this.width / 2;

    const minX = padding + halfWidth;
    const maxX = W - padding - halfWidth;

    return minX + Math.random() * (maxX - minX);
  }

  nextWord() {
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
    ctx.font = `${this.isHeavy ? "bold " : ""}${this.isHeavy ? S.enemyHeavyFont : S.enemySimpleFont}px 'Courier New', monospace`;

    const boxW = this.width;
    const boxH = this.height;

    ctx.shadowColor = flash ? CONFIG.colors.white : this.isHeavy ? CONFIG.colors.heavy : CONFIG.colors.primary;
    ctx.shadowBlur = flash ? S.enemyFlashGlow : S.enemyGlow + Math.sin(this.pulse * 2) * S.enemyGlowPulse;

    ctx.strokeStyle = flash
      ? CONFIG.colors.white
      : this.isHeavy
        ? `rgba(255,170,0,${alpha})`
        : `rgba(0,255,65,${alpha})`;
    ctx.lineWidth = flash ? S.enemyLineWidth * 2 : S.enemyLineWidth;

    if (this.isHeavy) {
      const off = S.enemyAlienOffset;
      ctx.beginPath();
      ctx.moveTo(this.x - boxW / 2 + off, this.y - boxH / 2);
      ctx.lineTo(this.x + boxW / 2 - off, this.y - boxH / 2);
      ctx.lineTo(this.x + boxW / 2, this.y);
      ctx.lineTo(this.x + boxW / 2 - off, this.y + boxH / 2);
      ctx.lineTo(this.x - boxW / 2 + off, this.y + boxH / 2);
      ctx.lineTo(this.x - boxW / 2, this.y);
      ctx.closePath();
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
    } else {
      ctx.strokeRect(this.x - boxW / 2, this.y - boxH / 2, boxW, boxH);
    }

    ctx.shadowBlur = 0;
    ctx.font = `${this.isHeavy ? "bold " : ""}${this.isHeavy ? S.enemyHeavyFont : S.enemySimpleFont}px 'Courier New', monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = flash ? CONFIG.colors.white : this.isHeavy ? CONFIG.colors.heavy : CONFIG.colors.primary;
    ctx.fillText(this.text, this.x, this.y);

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
