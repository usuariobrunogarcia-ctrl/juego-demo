// Bucle principal: simulación a paso fijo de 60 Hz y dibujado a resolución nativa.
TN.STEP_MS = 1000 / 60;

TN.Game = class {
  constructor(canvas) {
    canvas.width = TN.WIDTH;
    canvas.height = TN.HEIGHT;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.input = new TN.Input();
    this.level = new TN.Level(TN.LEVEL_1);
    this.player = new TN.Player(this.level);
    this.camX = 0;
    this.state = 'play';

    this.accumulator = 0;
    this.lastTime = null;
    this.frame = this.frame.bind(this);
  }

  start() {
    requestAnimationFrame(this.frame);
  }

  frame(time) {
    if (this.lastTime === null) this.lastTime = time;
    // Limitar el salto de tiempo evita una avalancha de pasos al volver a la pestaña.
    this.accumulator += Math.min(time - this.lastTime, 250);
    this.lastTime = time;

    while (this.accumulator >= TN.STEP_MS) {
      this.update();
      this.input.endStep();
      this.accumulator -= TN.STEP_MS;
    }
    this.render();
    requestAnimationFrame(this.frame);
  }

  update() {
    if (this.state === 'win') {
      if (this.input.wasPressed('jump')) this.restart();
      return;
    }

    const player = this.player;
    player.update(this.input, this.level);

    if (player.y > this.level.pixelHeight + 32) {
      player.respawn(this.level);
    }

    const flagX = this.level.flag.x * TN.TILE;
    if (player.x + player.w > flagX + 6 && player.x < flagX + 10) {
      this.state = 'win';
    }

    this.updateCamera();
  }

  restart() {
    this.player.respawn(this.level);
    this.state = 'play';
    this.updateCamera();
  }

  updateCamera() {
    const target = this.player.x + this.player.w / 2 - TN.WIDTH / 2;
    const maxX = this.level.pixelWidth - TN.WIDTH;
    this.camX = Math.max(0, Math.min(target, maxX));
  }

  // ---------- Dibujado ----------

  render() {
    const ctx = this.ctx;
    const C = TN.COLORS;
    const camX = Math.round(this.camX);

    ctx.fillStyle = C.sky;
    ctx.fillRect(0, 0, TN.WIDTH, TN.HEIGHT);

    const T = TN.TILE;
    const firstCol = Math.floor(camX / T);
    const lastCol = firstCol + Math.ceil(TN.WIDTH / T);
    for (let ty = 0; ty < this.level.height; ty++) {
      for (let tx = firstCol; tx <= lastCol; tx++) {
        this.drawTile(tx, ty, tx * T - camX, ty * T);
      }
    }

    this.drawFlag(camX);
    this.drawPlayer(camX);

    if (this.state === 'win') {
      this.drawBanner('¡NIVEL COMPLETADO!', 'Pulsa saltar para repetir');
    }
  }

  drawTile(tx, ty, x, y) {
    const ctx = this.ctx;
    const C = TN.COLORS;
    const tile = this.level.tileAt(tx, ty);

    if (tile === '#') {
      ctx.fillStyle = C.ground;
      ctx.fillRect(x, y, 16, 16);
      ctx.fillStyle = C.groundDark;
      ctx.fillRect(x + 3, y + 7, 2, 2);
      ctx.fillRect(x + 11, y + 12, 2, 2);
      ctx.fillStyle = C.groundLight;
      ctx.fillRect(x + 9, y + 5, 2, 1);
      if (!this.level.isSolid(tx, ty - 1)) {
        ctx.fillStyle = C.grass;
        ctx.fillRect(x, y, 16, 4);
        ctx.fillStyle = C.grassLight;
        ctx.fillRect(x, y, 16, 1);
      }
    } else if (tile === 'B') {
      ctx.fillStyle = C.brick;
      ctx.fillRect(x, y, 16, 16);
      ctx.fillStyle = C.mortar;
      ctx.fillRect(x, y + 7, 16, 1);
      ctx.fillRect(x, y + 15, 16, 1);
      ctx.fillRect(x + 7, y, 1, 7);
      ctx.fillRect(x + 3, y + 8, 1, 7);
      ctx.fillRect(x + 12, y + 8, 1, 7);
    }
  }

  drawFlag(camX) {
    const ctx = this.ctx;
    const C = TN.COLORS;
    const x = this.level.flag.x * TN.TILE - camX;
    const baseY = (this.level.flag.y + 1) * TN.TILE;
    ctx.fillStyle = C.pole;
    ctx.fillRect(x + 7, baseY - 96, 2, 96);
    ctx.fillStyle = C.flag;
    ctx.fillRect(x + 9, baseY - 94, 12, 8);
  }

  // Explorador provisional: el sprite definitivo llega en la etapa 3.
  drawPlayer(camX) {
    const ctx = this.ctx;
    const C = TN.COLORS;
    const p = this.player;
    const x = Math.round(p.x) - camX;
    const y = Math.round(p.y);

    ctx.fillStyle = C.hat;
    ctx.fillRect(x - 1, y + 2, 14, 2);
    ctx.fillRect(x + 2, y, 8, 2);
    ctx.fillStyle = C.skin;
    ctx.fillRect(x + 2, y + 4, 8, 4);
    ctx.fillStyle = C.black;
    ctx.fillRect(p.facing > 0 ? x + 7 : x + 4, y + 5, 1, 2);
    ctx.fillStyle = C.khaki;
    ctx.fillRect(x + 1, y + 8, 10, 4);
    ctx.fillStyle = C.hat;
    ctx.fillRect(x + 2, y + 12, 3, 2);
    ctx.fillRect(x + 7, y + 12, 3, 2);
  }

  drawBanner(title, subtitle) {
    const ctx = this.ctx;
    ctx.fillStyle = TN.COLORS.black;
    ctx.fillRect(0, 88, TN.WIDTH, 44);
    ctx.fillStyle = TN.COLORS.white;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(title, TN.WIDTH / 2, 104);
    ctx.font = '8px monospace';
    ctx.fillText(subtitle, TN.WIDTH / 2, 120);
  }
};
