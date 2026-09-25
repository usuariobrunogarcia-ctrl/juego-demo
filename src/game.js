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
    this.entitySprites = TN.buildEntitySprites();
    this.resetEntities();
    this.frameCount = 0;
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

    this.frameCount++;
    const player = this.player;
    if (this.input.wasPressed('switch')) this.trySwitch();
    this.carryOnBranch();
    const prevBottom = player.y + player.h;
    player.update(this.input, this.level, this.mode);
    this.landOnBranches(prevBottom);
    for (const e of this.entities) e.update(this);

    if (player.y > this.level.pixelHeight + 32) {
      this.hurt();
    }
    this.checkEntities();

    const flagX = this.level.flag.x * TN.TILE;
    if (player.x + player.w > flagX + 6 && player.x < flagX + 10) {
      this.state = 'win';
    }

    this.canSwitch = this.isSafeToSwitch();
    this.updateCamera();
  }

  // Si el explorador estaba sobre una rama, se mueve con ella.
  carryOnBranch() {
    const b = this.riding;
    if (!b) return;
    const oldX = b.x;
    b.place(this.camX);
    const p = this.player;
    const dx = b.x - oldX;
    if (dx !== 0 && !this.level.overlapsSolid(p.x + dx, p.y, p.w, p.h, this.mode)) p.x += dx;
  }

  landOnBranches(prevBottom) {
    const p = this.player;
    this.riding = null;
    if (this.mode !== 'snes' || p.vy < 0) return;
    for (const b of this.branches) {
      b.place(this.camX);
      const bottom = p.y + p.h;
      if (prevBottom <= b.y + 0.01 && bottom >= b.y && p.x + p.w > b.x && p.x < b.x + b.w) {
        p.y = b.y - p.h;
        p.vy = 0;
        p.onGround = true;
        this.riding = b;
        return;
      }
    }
  }

  resetEntities() {
    this.entities = this.level.entities.map(TN.createEntity);
    this.branches = this.level.branches.map((b) => new TN.Branch(b, this.level));
    this.riding = null;
    this.hazards = this.entities.filter((e) => e.sprite);
    this.checkpoint = this.level.spawn;
    this.flickering = new Set();
  }

  checkEntities() {
    const p = this.player;
    this.flickering = this.mode === 'nes'
      ? TN.findFlickering(this.hazards, p, this.camX)
      : new Set();

    for (const e of this.entities) {
      if (e instanceof TN.Checkpoint && !e.active && p.x > e.x) {
        e.active = true;
        this.checkpoint = { x: e.tx, y: e.ty };
      }
    }
    for (const e of this.hazards) {
      if (this.flickering.has(e)) continue;
      const hb = e.hitbox;
      if (p.x < e.x + hb.x + hb.w && p.x + p.w > e.x + hb.x &&
          p.y < e.y + hb.y + hb.h && p.y + p.h > e.y + hb.y) {
        this.hurt();
        return;
      }
    }
  }

  hurt() {
    this.player.respawn(this.checkpoint);
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
    this.resetEntities();
    this.player.respawn(this.checkpoint);
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
    this.drawEntities(camX);
    this.drawPlayer(camX);
    if (this.mode === 'snes') this.drawWater(camX);
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
      this.drawStrip(bg.jungle, camX * TN.PARALLAX_NEAR);
    }
    this.drawBranches(camX);
  }

  // Transparencia por "color math" de la SNES: el agua tiñe lo que hay detrás.
  drawWater(camX) {
    const ctx = this.ctx;
    const T = TN.TILE;
    const firstCol = Math.floor(camX / T);
    for (let ty = 0; ty < this.level.height; ty++) {
      for (let tx = firstCol; tx <= firstCol + TN.WIDTH / T; tx++) {
        if (this.level.tileAt(tx, ty) !== '~') continue;
        const x = tx * T - camX;
        const y = ty * T;
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#2070D0';
        ctx.fillRect(x, y, T, T);
        if (this.level.tileAt(tx, ty - 1) === '.') {
          const wave = (this.frameCount >> 3) % 4;
          ctx.globalAlpha = 0.8;
          ctx.fillStyle = '#B8E8F8';
          for (let i = 0; i < T; i++) {
            if ((i + tx * T + wave) % 8 < 5) ctx.fillRect(x + i, y, 1, 1);
          }
          ctx.fillStyle = '#58A8E8';
          ctx.fillRect(x, y + 1, T, 1);
        }
        ctx.globalAlpha = 1;
      }
    }
  }

  drawBranches(camX) {
    const ctx = this.ctx;
    for (const b of this.branches) {
      b.place(camX);
      const x = Math.round(b.x) - camX;
      const y = Math.round(b.y);
      if (x + b.w < 0 || x >= TN.WIDTH) continue;
      if (this.mode === 'nes') {
        // En NES no hay segunda capa: solo se ve el contorno de dónde estaría.
        ctx.globalAlpha = 0.45;
        ctx.fillStyle = '#FCFCFC';
        for (let i = 0; i < b.w; i += 2) {
          ctx.fillRect(x + i, y, 1, 1);
          ctx.fillRect(x + i + 1, y + b.h - 1, 1, 1);
        }
        ctx.globalAlpha = 1;
        continue;
      }
      ctx.fillStyle = '#3C2010';
      ctx.fillRect(x, y, b.w, b.h);
      ctx.fillStyle = '#8C6030';
      ctx.fillRect(x + 1, y, b.w - 2, 2);
      ctx.fillStyle = '#6C4020';
      ctx.fillRect(x + 1, y + 2, b.w - 2, 3);
      ctx.fillStyle = '#48A048';
      for (let i = 6; i < b.w - 4; i += 13) {
        ctx.fillRect(x + i, y - 3, 5, 3);
        ctx.fillRect(x + i + 1, y - 4, 3, 1);
      }
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
    } else if (tile === '~') {
      // En 16 bits el agua se dibuja encima de todo, translúcida (drawWater).
      if (this.mode === 'nes') {
        ctx.drawImage(this.level.tileAt(tx, ty - 1) === '.' ? images.waterTop : images.water, x, y);
      }
    } else if (tile === 'W') {
      ctx.drawImage(images.glitchWall, x, y);
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

  drawEntities(camX) {
    const ctx = this.ctx;
    const images = this.entitySprites[this.mode];
    this.entities.forEach((e, i) => {
      const x = Math.round(e.x) - camX;
      if (x + e.w < 0 || x >= TN.WIDTH) return;
      if (e instanceof TN.Checkpoint) {
        this.drawCheckpoint(e, x);
        return;
      }
      // Los objetos de una línea saturada se turnan para aparecer.
      if (this.flickering.has(e) && (this.frameCount + i) % 2 === 0) return;
      ctx.drawImage(images[e.sprite], x, Math.round(e.y));
    });
  }

  drawCheckpoint(e, x) {
    const ctx = this.ctx;
    const nes = this.mode === 'nes';
    const y = e.y;
    ctx.fillStyle = nes ? '#BCBCBC' : '#A8A8B8';
    ctx.fillRect(x + 4, y + 2, 2, 14);
    ctx.fillStyle = e.active ? (nes ? '#00A800' : '#F8D848') : (nes ? '#7C7C7C' : '#686878');
    ctx.fillRect(x + 6, y + 2, 7, 5);
    if (!nes) {
      ctx.fillStyle = e.active ? '#C89818' : '#484858';
      ctx.fillRect(x + 6, y + 6, 7, 1);
    }
  }

  drawPlayer(camX) {
    const p = this.player;
    let shakeOffset = p.shake > 0 ? (p.shake % 4 < 2 ? -1 : 1) : 0;
    if (p.clipping) shakeOffset = (this.frameCount >> 1) % 3 - 1;
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
