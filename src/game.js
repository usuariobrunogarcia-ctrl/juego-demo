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
    this.sprites = TN.buildSprites();
    this.camX = 0;
    this.state = 'play';
    this.mode = 'nes';
    this.canSwitch = true;

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
    if (this.input.wasPressed('switch')) this.trySwitch();
    player.update(this.input, this.level, this.mode);

    if (player.y > this.level.pixelHeight + 32) {
      player.respawn(this.level);
    }

    const flagX = this.level.flag.x * TN.TILE;
    if (player.x + player.w > flagX + 6 && player.x < flagX + 10) {
      this.state = 'win';
    }

    this.canSwitch = this.isSafeToSwitch();
    this.updateCamera();
  }

  get otherMode() {
    return this.mode === 'nes' ? 'snes' : 'nes';
  }

  // Solo se puede cambiar si el hueco que ocupa el explorador está libre
  // también en la otra versión del nivel.
  isSafeToSwitch() {
    const p = this.player;
    return !this.level.overlapsSolid(p.x, p.y, p.w, p.h, this.otherMode);
  }

  trySwitch() {
    if (this.isSafeToSwitch()) {
      this.mode = this.otherMode;
    } else {
      this.player.shake = TN.SWITCH_ERROR_FRAMES;
    }
  }

  restart() {
    this.player.respawn(this.level);
    this.mode = 'nes';
    this.state = 'play';
    this.updateCamera();
  }

  get theme() {
    return TN.THEMES[this.mode];
  }

  updateCamera() {
    const target = this.player.x + this.player.w / 2 - TN.WIDTH / 2;
    const maxX = this.level.pixelWidth - TN.WIDTH;
    this.camX = Math.max(0, Math.min(target, maxX));
  }

  // ---------- Dibujado ----------

  render() {
    const ctx = this.ctx;
    const camX = Math.round(this.camX);

    const sky = this.theme.sky;
    const band = Math.ceil(TN.HEIGHT / sky.length);
    sky.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.fillRect(0, i * band, TN.WIDTH, band);
    });

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
    this.drawHud();

    if (this.state === 'win') {
      this.drawBanner('¡NIVEL COMPLETADO!', 'Pulsa saltar para repetir');
    }
  }

  drawTile(tx, ty, x, y) {
    const ctx = this.ctx;
    const C = this.theme;
    const tile = this.level.tileAt(tx, ty);
    const onlyTile = this.mode === 'nes' ? 'N' : 'S';
    const ghostTile = this.mode === 'nes' ? 'S' : 'N';

    if (tile === '#') {
      ctx.fillStyle = C.ground;
      ctx.fillRect(x, y, 16, 16);
      ctx.fillStyle = C.groundDark;
      ctx.fillRect(x + 3, y + 7, 2, 2);
      ctx.fillRect(x + 11, y + 12, 2, 2);
      ctx.fillStyle = C.groundLight;
      ctx.fillRect(x + 9, y + 5, 2, 1);
      if (!this.level.isSolid(tx, ty - 1, this.mode)) {
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
    } else if (tile === onlyTile) {
      // Bloque exclusivo de este modo.
      ctx.fillStyle = C.onlyBlockDark;
      ctx.fillRect(x, y, 16, 16);
      ctx.fillStyle = C.onlyBlock;
      ctx.fillRect(x + 1, y + 1, 14, 14);
      ctx.fillStyle = C.onlyBlockLight;
      ctx.fillRect(x + 1, y + 1, 14, 2);
      ctx.fillRect(x + 1, y + 1, 2, 14);
      ctx.fillRect(x + 6, y + 6, 4, 4);
    } else if (tile === ghostTile) {
      // Bloque de la otra versión: solo un contorno punteado, sin colisión.
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = C.ghost;
      for (let i = 0; i < 16; i += 2) {
        ctx.fillRect(x + i, y, 1, 1);
        ctx.fillRect(x + i + 1, y + 15, 1, 1);
        ctx.fillRect(x, y + i + 1, 1, 1);
        ctx.fillRect(x + 15, y + i, 1, 1);
      }
      ctx.globalAlpha = 1;
    }
  }

  drawFlag(camX) {
    const ctx = this.ctx;
    const C = this.theme;
    const x = this.level.flag.x * TN.TILE - camX;
    const baseY = (this.level.flag.y + 1) * TN.TILE;
    ctx.fillStyle = C.pole;
    ctx.fillRect(x + 7, baseY - 96, 2, 96);
    ctx.fillStyle = C.flag;
    ctx.fillRect(x + 9, baseY - 94, 12, 8);
  }

  drawPlayer(camX) {
    const p = this.player;
    const shakeOffset = p.shake > 0 ? (p.shake % 4 < 2 ? -1 : 1) : 0;
    // El sprite mide 16x16 y la caja de colisión 12x14: se centra y se apoya en los pies.
    const x = Math.round(p.x) - camX - 2 + shakeOffset;
    const y = Math.round(p.y) - 2;
    const frame = this.sprites[this.mode][p.frameName(this.mode)];
    this.ctx.drawImage(p.facing > 0 ? frame.right : frame.left, x, y);
  }

  // Marcador: modo actual y cartucho que indica si se puede cambiar.
  drawHud() {
    const ctx = this.ctx;
    const C = this.theme;
    const error = this.player.shake > 0;

    ctx.fillStyle = C.black;
    ctx.fillRect(4, 4, 62, 16);

    // Cartucho: verde si se puede cambiar, rojo si no.
    const body = error ? '#F83800' : this.canSwitch ? '#58D854' : '#787878';
    ctx.fillStyle = body;
    ctx.fillRect(8, 7, 10, 10);
    ctx.fillRect(10, 6, 6, 1);
    ctx.fillStyle = C.black;
    ctx.fillRect(10, 9, 6, 4);
    if (!this.canSwitch) {
      ctx.fillStyle = '#F83800';
      for (let i = 0; i < 6; i++) {
        ctx.fillRect(10 + i, 9 + Math.floor(i * 4 / 6), 1, 1);
        ctx.fillRect(15 - i, 9 + Math.floor(i * 4 / 6), 1, 1);
      }
    }

    ctx.fillStyle = C.white;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 8px monospace';
    ctx.fillText(TN.MODE_LABEL[this.mode], 22, 12);
  }

  drawBanner(title, subtitle) {
    const ctx = this.ctx;
    ctx.fillStyle = this.theme.black;
    ctx.fillRect(0, 88, TN.WIDTH, 44);
    ctx.fillStyle = this.theme.white;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(title, TN.WIDTH / 2, 104);
    ctx.font = '8px monospace';
    ctx.fillText(subtitle, TN.WIDTH / 2, 120);
  }
};
