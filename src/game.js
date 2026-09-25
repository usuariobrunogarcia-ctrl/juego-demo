// Bucle principal: simulación a paso fijo de 60 Hz y dibujado a resolución nativa.
TN.STEP_MS = 1000 / 60;

TN.Game = class {
  constructor(canvas) {
    canvas.width = TN.WIDTH;
    canvas.height = TN.HEIGHT;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.input = new TN.Input();
    this.sound = new TN.Sound();
    this.save = new TN.Save();
    this.sprites = TN.buildSprites();
    this.tiles = TN.buildTiles();
    this.debugTiles = TN.buildDebugTiles();
    this.backgrounds = TN.buildBackgrounds();
    this.entitySprites = TN.buildEntitySprites();
    this.portraits = TN.buildPortraits();
    this.frameCount = 0;
    this.loadLevel(0);
    this.openTitle();

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
    if (this.input.wasPressed('mute')) this.sound.toggleMute();
    if (this.state === 'title') {
      this.updateTitle();
      return;
    }
    if (this.state === 'dialog') {
      this.updateDialog();
      return;
    }
    if (this.state === 'break') {
      this.updateBreak();
      return;
    }
    if (this.state === 'ending') {
      this.updateEnding();
      return;
    }
    if (this.patchBanner > 0) this.patchBanner--;
    if (this.state === 'card') {
      this.frameCount++;
      this.stateTimer--;
      if (this.stateTimer <= 0 || (this.stateTimer < 100 && this.input.wasPressed('jump'))) {
        this.state = 'play';
        const intro = this.level.def.introDialog;
        if (intro && !this.dialogsSeen.has(intro)) {
          this.dialogsSeen.add(intro);
          this.startDialog(intro);
        }
      }
      return;
    }
    if (this.state === 'win') {
      this.stateTimer--;
      if (this.stateTimer <= 0 && this.input.wasPressed('jump')) this.nextLevel();
      return;
    }
    if (this.respawnBlink > 0) this.respawnBlink--;

    this.frameCount++;
    const player = this.player;
    if (this.input.wasPressed('switch')) this.trySwitch();
    for (const e of this.entities) e.update(this);
    for (const b of this.branches) {
      b.prevX = b.x;
      b.prevY = b.y;
      b.place(this.camX);
    }
    this.carryOnPlatform();
    const prevBottom = player.y + player.h;
    player.update(this.input, this.level, this.mode);
    if (player.event) this.sound.sfx(player.event);
    this.trackLearning();
    this.landOnPlatforms(prevBottom);

    if (player.y > this.level.pixelHeight + 32) {
      this.hurt();
    }
    this.checkEntities();

    const flagX = this.level.flag.x * TN.TILE;
    if (player.x + player.w > flagX + 6 && player.x < flagX + 10) this.completeLevel();

    this.canSwitch = this.isSafeToSwitch();
    this.updateCamera();
    if (this.level.def.breakOnClip && player.clipping) this.startBreak();
    if (this.state === 'play') this.checkDialogTriggers();
  }

  // Plataformas móviles: ramas de la capa de fondo y murciélagos (solo en 16 bits).
  get platforms() {
    return this.mode === 'snes' ? [...this.branches, ...this.bats] : [];
  }

  // Si el explorador estaba sobre una plataforma, se mueve con ella.
  carryOnPlatform() {
    const pl = this.riding;
    if (!pl || this.mode !== 'snes') return;
    const p = this.player;
    const dx = pl.x - pl.prevX;
    const dy = pl.y - pl.prevY;
    if (dx !== 0 && !this.level.overlapsSolid(p.x + dx, p.y, p.w, p.h, this.mode)) p.x += dx;
    if (dy !== 0 && !this.level.overlapsSolid(p.x, p.y + dy, p.w, p.h, this.mode)) p.y += dy;
  }

  landOnPlatforms(prevBottom) {
    const p = this.player;
    this.riding = null;
    if (p.vy < 0) return;
    for (const pl of this.platforms) {
      const top = pl.top;
      const bottom = p.y + p.h;
      // Si la plataforma subió este fotograma, se compara con dónde estaba antes.
      const prevTop = top - (pl.y - pl.prevY);
      if (prevBottom <= Math.max(top, prevTop) + 0.01 && bottom >= top && p.x + p.w > pl.x && p.x < pl.x + pl.w) {
        p.y = top - p.h;
        p.vy = 0;
        p.onGround = true;
        this.riding = pl;
        return;
      }
    }
  }

  // ---------- Niveles ----------

  loadLevel(index) {
    this.levelIndex = index;
    this.level = new TN.Level(TN.LEVELS[index]);
    this.player = new TN.Player(this.level);
    this.resetEntities();
    this.mode = this.level.def.startMode;
    this.sound.setMode(this.mode);
    this.canSwitch = true;
    this.respawnBlink = 0;
    this.hurtCount = 0;
    this.dialogsSeen = new Set();
    this.patches = new Set();
    this.patchBanner = 0;
    this.updateCamera();
  }

  // Tarjeta de presentación del nivel, y después a jugar.
  enterLevel(index) {
    this.loadLevel(index);
    this.state = 'card';
    this.stateTimer = 150;
  }

  completeLevel() {
    this.state = 'win';
    this.stateTimer = 40;
    this.sound.sfx('win');
    const found = this.mapPieces.map((m, i) => (m.collected ? i : -1)).filter((i) => i >= 0);
    this.save.addPieces(this.level.def.id, found);
    this.save.unlock(this.levelIndex + 1);
  }

  // Acciones del guion que cambian las reglas del juego.
  runEvent(event) {
    if (event === 'patchFlicker') {
      // Alex quita el límite de sprites: se acabó el parpadeo en 8 bits.
      this.patches.add('flicker');
      this.patchBanner = 200;
      this.sound.sfx('patch');
    }
  }

  nextLevel() {
    if (this.level.def.worldEnd) {
      this.state = 'ending';
      this.stateTimer = 0;
    } else if (this.levelIndex + 1 < TN.LEVELS.length) {
      this.enterLevel(this.levelIndex + 1);
    } else {
      this.openTitle();
    }
  }

  resetEntities() {
    this.entities = this.level.entities.map(TN.createEntity);
    this.branches = this.level.branches.map((b) => new TN.Branch(b, this.level));
    this.riding = null;
    this.hazards = this.entities.filter((e) => e.dangerous);
    this.mapPieces = this.entities.filter((e) => e instanceof TN.MapPiece);
    this.bats = this.entities.filter((e) => e instanceof TN.Bat);
    this.checkpoint = this.level.spawn;
    this.flickering = new Set();
  }

  checkEntities() {
    const p = this.player;
    this.flickering = this.mode === 'nes' && !this.patches.has('flicker')
      ? TN.findFlickering(this.entities.filter((e) => e.sprite && !e.collected), p, this.camX)
      : new Set();

    for (const e of this.entities) {
      if (e instanceof TN.Checkpoint && !e.active && p.x > e.x) {
        e.active = true;
        this.checkpoint = { x: e.tx, y: e.ty };
        this.hurtCount = 0;
        this.sound.sfx('checkpoint');
      }
    }
    for (const m of this.mapPieces) {
      if (!m.collected && this.touches(m)) {
        m.collected = true;
        this.sound.sfx('collect');
      }
    }
    for (const e of this.hazards) {
      if (this.flickering.has(e) || e.harmless(this.mode)) continue;
      if (this.touches(e)) {
        this.hurt();
        return;
      }
    }
  }

  touches(e) {
    const p = this.player;
    const hb = e.hitbox;
    return p.x < e.x + hb.x + hb.w && p.x + p.w > e.x + hb.x &&
      p.y < e.y + hb.y + hb.h && p.y + p.h > e.y + hb.y;
  }

  get mapCount() {
    return `${this.mapPieces.filter((m) => m.collected).length}/${this.mapPieces.length}`;
  }

  hurt() {
    this.sound.sfx('hurt');
    this.hurtCount++;
    this.player.respawn(this.checkpoint);
    this.respawnBlink = 40;
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
    // Antes de la ruptura del juego, el botón de cambio no existe.
    if (!this.level.def.switchUnlocked) return;
    if (this.isSafeToSwitch()) {
      this.mode = this.otherMode;
      this.learn('switch');
      this.sound.setMode(this.mode);
      this.sound.sfx('switch');
    } else {
      this.player.shake = TN.SWITCH_ERROR_FRAMES;
      this.sound.sfx('error');
    }
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
    if (this.state === 'ending') {
      this.drawEnding();
      return;
    }
    if (this.state === 'title') {
      this.drawTitle();
      return;
    }
    if (this.state === 'card') {
      this.drawCard();
      return;
    }

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

    this.drawLabels(camX);
    this.drawFlag(camX);
    this.drawEntities(camX);
    this.drawPlayer(camX);
    if (this.mode === 'snes') this.drawWater(camX);
    this.drawHints(camX);
    this.drawHud();
    if (this.patchBanner > 0) this.drawPatchBanner();

    if (this.state === 'dialog') this.drawDialog();
    if (this.state === 'break') this.drawBreak();
    if (this.state === 'win') {
      this.drawBanner('¡NIVEL COMPLETADO!', `Mapa ${this.mapCount} - Pulsa saltar`);
    }
  }

  get isDebugRoom() {
    return this.level.def.theme === 'debug';
  }

  // Imágenes de tiles del modo actual (en la sala de pruebas, las provisionales).
  get tileImages() {
    if (this.isDebugRoom && this.mode === 'snes') return { ...this.tiles.snes, ...this.debugTiles };
    return this.tiles[this.mode];
  }

  drawBackground(camX) {
    if (this.isDebugRoom) {
      this.drawDebugBackground(camX);
      return;
    }
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

  // Sala de pruebas: negro en 8 bits; cuadrícula de depuración en 16 bits.
  drawDebugBackground(camX) {
    const ctx = this.ctx;
    ctx.fillStyle = this.mode === 'nes' ? '#000000' : '#1C2230';
    ctx.fillRect(0, 0, TN.WIDTH, TN.HEIGHT);
    if (this.mode === 'nes') return;
    ctx.fillStyle = '#2C3850';
    for (let x = -(camX % 16); x < TN.WIDTH; x += 16) ctx.fillRect(x, 0, 1, TN.HEIGHT);
    for (let y = 0; y < TN.HEIGHT; y += 16) ctx.fillRect(0, y, TN.WIDTH, 1);
  }

  drawLabels(camX) {
    if (!this.isDebugRoom || this.mode !== 'snes') return;
    const ctx = this.ctx;
    for (const l of this.level.def.labels) {
      const x = l.tx * TN.TILE - camX;
      if (x > TN.WIDTH || x + l.text.length * 6 < 0) continue;
      ctx.fillStyle = '#000000';
      ctx.fillRect(x - 2, l.ty * TN.TILE - 2, l.text.length * 6 + 3, 11);
      TN.drawText(ctx, l.text, x, l.ty * TN.TILE, '#F8D848');
    }
  }

  drawBranches(camX) {
    const ctx = this.ctx;
    for (const b of this.branches) {
      const x = Math.round(b.x) - camX;
      const y = Math.round(b.y);
      if (x + b.w < 0 || x >= TN.WIDTH) continue;
      if (this.mode === 'nes') {
        if (!this.level.def.switchUnlocked) continue;
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

    const images = this.tileImages;
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
    } else if (tile === ghostTile && this.level.def.switchUnlocked) {
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
      if (x + e.w < 0 || x >= TN.WIDTH || e.collected) return;
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
    if (this.respawnBlink > 0 && (this.respawnBlink >> 2) % 2 === 0) return;
    let shakeOffset = p.shake > 0 ? (p.shake % 4 < 2 ? -1 : 1) : 0;
    if (p.clipping) shakeOffset = (this.frameCount >> 1) % 3 - 1;
    // El sprite mide 16x16 y la caja de colisión 12x14: se centra y se apoya en los pies.
    const x = Math.round(p.x) - camX - 2 + shakeOffset;
    const y = Math.round(p.y) - 2;
    const frame = this.sprites[this.mode][p.frameName(this.mode)];
    this.ctx.drawImage(p.facing > 0 ? frame.right : frame.left, x, y);
  }

  drawPatchBanner() {
    const ctx = this.ctx;
    const t = this.patchBanner;
    if (t > 185) {
      ctx.globalAlpha = (t - 185) / 15;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, TN.WIDTH, TN.HEIGHT);
      ctx.globalAlpha = 1;
    }
    if (t < 20 && (t >> 2) % 2) return;
    ctx.fillStyle = '#000000';
    ctx.fillRect(16, 26, TN.WIDTH - 32, 24);
    TN.drawText(ctx, 'PARCHE 0.3.1 APLICADO', TN.WIDTH / 2, 29, '#F8D848', { align: 'center' });
    TN.drawText(ctx, 'LIMITE DE SPRITES: ELIMINADO', TN.WIDTH / 2, 40, '#F8F8F8', { align: 'center' });
  }

  // Tarjeta negra con el número y el nombre del nivel, como en la NES.
  drawCard() {
    const ctx = this.ctx;
    const C = this.theme;
    const def = this.level.def;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, TN.WIDTH, TN.HEIGHT);
    const options = { align: 'center', shadow: this.textShadow };
    TN.drawText(ctx, def.code, TN.WIDTH / 2, 76, C.white, { ...options, scale: 2 });
    TN.drawText(ctx, def.name, TN.WIDTH / 2, 100, C.white, options);
    const frame = this.sprites[this.mode].idle.right;
    ctx.drawImage(frame, TN.WIDTH / 2 - 8, 120);
    const known = (this.save.data.pieces[def.id] || []).length;
    if (this.mapPieces.length) {
      TN.drawText(ctx, `MAPA ${known}/${this.mapPieces.length}`, TN.WIDTH / 2, 148, '#A0A0A0', { align: 'center' });
    }
  }

  // Marcador: modo actual y cartucho que indica si se puede cambiar.
  drawHud() {
    const ctx = this.ctx;
    const C = this.theme;
    const error = this.player.shake > 0;
    if (!this.level.def.switchUnlocked) {
      this.drawMapCounter();
      return;
    }

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
    this.drawMapCounter();
  }

  // Fragmentos de mapa recogidos.
  drawMapCounter() {
    if (!this.mapPieces.length) return;
    const ctx = this.ctx;
    const C = this.theme;
    ctx.fillStyle = C.black;
    ctx.fillRect(TN.WIDTH - 70, 4, 66, 16);
    TN.drawText(ctx, `MAPA ${this.mapCount}`, TN.WIDTH - 65, 8, C.white, { shadow: this.textShadow });
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
