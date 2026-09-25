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
    this.tiles = TN.buildTiles();
    this.backgrounds = TN.buildBackgrounds();
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
    this.drawBackground(camX);

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

  drawBackground(camX) {
    const bg = this.backgrounds[this.mode];
    if (this.mode === 'nes') {
      // Una sola capa: las nubes van pegadas al nivel.
      for (const c of TN.CLOUDS) this.ctx.drawImage(bg.cloud, c.x - camX, c.y);
    } else {
      for (const c of TN.CLOUDS) this.ctx.drawImage(bg.cloud, Math.round(c.x * 0.5 - camX * 0.15), c.y);
      this.drawStrip(bg.hills, camX * 0.25);
      this.drawStrip(bg.jungle, camX * 0.5);
    }
  }

  drawStrip(image, offset) {
    for (let x = -(Math.round(offset) % image.width); x < TN.WIDTH; x += image.width) {
      this.ctx.drawImage(image, x, 0);
    }
  }

  get textShadow() {
    return this.mode === 'snes' ? '#383850' : null;
  }

  drawTile(tx, ty, x, y) {
    const ctx = this.ctx;
    const C = this.theme;
    const tile = this.level.tileAt(tx, ty);
    const onlyTile = this.mode === 'nes' ? 'N' : 'S';
    const ghostTile = this.mode === 'nes' ? 'S' : 'N';

    const images = this.tiles[this.mode];
    if (tile === '#') {
      const top = !this.level.isSolid(tx, ty - 1, this.mode);
      ctx.drawImage(top ? images.groundTop : images.ground, x, y);
    } else if (tile === 'B') {
      ctx.drawImage(images.brick, x, y);
    } else if (tile === onlyTile) {
      ctx.drawImage(images.block, x, y);
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

    TN.drawText(ctx, TN.MODE_LABEL[this.mode], 22, 8, C.white, { shadow: this.textShadow });
  }

  drawBanner(title, subtitle) {
    const ctx = this.ctx;
    ctx.fillStyle = this.theme.black;
    ctx.fillRect(0, 88, TN.WIDTH, 44);
    const options = { align: 'center', shadow: this.textShadow };
    TN.drawText(ctx, title, TN.WIDTH / 2, 98, this.theme.white, options);
    TN.drawText(ctx, subtitle, TN.WIDTH / 2, 114, this.theme.white, options);
  }
};
