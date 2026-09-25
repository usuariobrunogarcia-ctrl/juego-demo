// Pantalla de título. Antes de romper el juego es la de "Terra Nova (1989)" para
// NES; después es la del remaster "DX", que de vez en cuando se corrompe y deja
// ver la de 1989.

TN.STUDIO = 'Brujula Soft';

// Desplaza franjas horizontales de lo ya dibujado: efecto de imagen rota.
TN.tearScreen = function (ctx, strength, seed) {
  let s = seed;
  const rand = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  for (let y = 0; y < TN.HEIGHT;) {
    const h = 2 + Math.floor(rand() * 14);
    if (rand() < 0.5) {
      const dx = Math.round((rand() - 0.5) * strength);
      ctx.drawImage(ctx.canvas, 0, y, TN.WIDTH, h, dx, y, TN.WIDTH, h);
    }
    y += h;
  }
};

Object.assign(TN.Game.prototype, {
  openTitle() {
    this.state = 'title';
    this.menuIndex = 0;
    this.titleTime = 0;
    this.sound.setMode(this.save.data.broken ? 'snes' : 'nes');
  },

  menuItems() {
    if (!this.save.hasProgress) return [{ label: 'Empezar', action: 'new' }];
    return [{ label: 'Continuar', action: 'continue' }, { label: 'Nueva partida', action: 'new' }];
  },

  updateTitle() {
    this.frameCount++;
    this.titleTime++;
    const items = this.menuItems();
    if (this.input.wasPressed('down')) this.menuIndex = (this.menuIndex + 1) % items.length;
    if (this.input.wasPressed('up') && items.length > 1) this.menuIndex = (this.menuIndex + items.length - 1) % items.length;
    if (!this.input.wasPressed('confirm') || this.titleTime < 20) return;
    const choice = items[this.menuIndex].action;
    this.sound.sfx('checkpoint');
    if (choice === 'new') {
      this.save.reset();
      this.enterLevel(0);
    } else {
      this.enterLevel(Math.min(this.save.data.unlocked, TN.LEVELS.length - 1));
    }
  },

  drawTitle() {
    const dx = !!this.save.data.broken;
    // Cada ~4 segundos, la versión DX falla durante unos fotogramas.
    const glitching = dx && this.titleTime % 240 > 228;
    if (dx && !glitching) this.drawTitleDX();
    else this.drawTitle1989();
    if (glitching) TN.tearScreen(this.ctx, 40, this.titleTime);
    this.drawTitleMenu(dx && !glitching);
  },

  drawTitle1989() {
    const ctx = this.ctx;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, TN.WIDTH, TN.HEIGHT);

    // Estrellas que titilan.
    for (let i = 0; i < 40; i++) {
      const x = (i * 83) % TN.WIDTH;
      const y = (i * 47) % 120;
      if ((i + (this.titleTime >> 4)) % 7 === 0) continue;
      ctx.fillStyle = i % 3 ? '#FCFCFC' : '#A4E4FC';
      ctx.fillRect(x, y, 1, 1);
    }
    // Montañas: dos siluetas de la paleta de la NES.
    for (let x = 0; x < TN.WIDTH; x++) {
      const far = Math.round(128 + TN.wave(x, TN.WIDTH, [[2, 16], [5, 6, 1]]));
      const near = Math.round(160 + TN.wave(x, TN.WIDTH, [[3, 10, 2], [7, 4]]));
      ctx.fillStyle = '#005800';
      ctx.fillRect(x, far, 1, TN.HEIGHT - far);
      ctx.fillStyle = '#00A800';
      ctx.fillRect(x, near, 1, TN.HEIGHT - near);
    }
    const tiles = this.tiles.nes;
    for (let x = 0; x < TN.WIDTH; x += 16) {
      ctx.drawImage(tiles.groundTop, x, 192);
      ctx.drawImage(tiles.ground, x, 208);
    }
    ctx.drawImage(this.sprites.nes.idle.right, 32, 176);

    // Logo en bloque, con sombra dura.
    TN.drawText(ctx, 'TERRA NOVA', TN.WIDTH / 2, 30, '#FC9838', { align: 'center', scale: 3, shadow: '#A81000' });
    ctx.fillStyle = '#FC9838';
    ctx.fillRect(40, 58, TN.WIDTH - 80, 2);
    TN.drawText(ctx, 'Expedicion al fin del mapa', TN.WIDTH / 2, 64, '#FCFCFC', { align: 'center' });
    TN.drawText(ctx, `(C) 1989 ${TN.STUDIO}`, TN.WIDTH / 2, 212, '#FCFCFC', { align: 'center', shadow: '#000000' });
  },

  drawTitleDX() {
    const ctx = this.ctx;
    const theme = TN.THEMES.snes;
    const band = Math.ceil(TN.HEIGHT / theme.sky.length);
    theme.sky.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.fillRect(0, i * band, TN.WIDTH, band);
    });
    // El fondo se desplaza solo: la pantalla de título de la SNES "respira".
    const pan = this.titleTime * 0.5;
    const bg = this.backgrounds.snes;
    for (const c of TN.CLOUDS) ctx.drawImage(bg.cloud, Math.round(((c.x * 0.5 - pan * 0.15) % 600 + 600) % 600 - 40), c.y);
    this.drawStrip(bg.hills, pan * 0.25);
    this.drawStrip(bg.jungle, pan * 0.5);
    const tiles = this.tiles.snes;
    for (let x = -16; x < TN.WIDTH + 16; x += 16) {
      const ox = x - Math.round(pan) % 16;
      ctx.drawImage(tiles.groundTop, ox, 192);
      ctx.drawImage(tiles.ground, ox, 208);
    }
    const walk = this.sprites.snes[TN.SPRITES.snes.walkCycle[(this.titleTime >> 3) % 4]];
    ctx.drawImage(walk.right, 32, 176);

    // Panel translúcido detrás del logo (transparencia de la SNES).
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#101030';
    ctx.fillRect(20, 22, TN.WIDTH - 40, 58);
    ctx.globalAlpha = 1;
    TN.drawText(ctx, 'TERRA NOVA', TN.WIDTH / 2 - 20, 30, '#F8D848', { align: 'center', scale: 3, shadow: '#8C3010' });
    // Sello "DX".
    ctx.fillStyle = '#F8F8F8';
    ctx.fillRect(205, 27, 30, 26);
    ctx.fillStyle = '#D83838';
    ctx.fillRect(206, 28, 28, 24);
    TN.drawText(ctx, 'DX', 209, 33, '#F8F8F8', { scale: 2, shadow: '#701818' });
    TN.drawText(ctx, 'Expedicion al fin del mapa', TN.WIDTH / 2, 64, '#F8F8F8', { align: 'center', shadow: '#383850' });
    TN.drawText(ctx, 'BUILD 0.3 - NO DISTRIBUIR', 4, 4, '#F8F8F8', { shadow: '#000000' });
    TN.drawText(ctx, `(C) 1989 ${TN.STUDIO}`, TN.WIDTH / 2, 212, '#F8F8F8', { align: 'center', shadow: '#383850' });
  },

  drawTitleMenu(dx) {
    const ctx = this.ctx;
    const items = this.menuItems();
    const top = 100;
    if (dx) {
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#101030';
      ctx.fillRect(72, top - 6, 112, items.length * 14 + 10);
      ctx.globalAlpha = 1;
    }
    items.forEach((item, i) => {
      const y = top + i * 14;
      const selected = i === this.menuIndex;
      const color = selected ? (dx ? '#F8D848' : '#FCFCFC') : '#A0A0A0';
      TN.drawText(ctx, item.label, 96, y, color, { shadow: dx ? '#383850' : null });
      if (selected && (this.titleTime >> 4) % 2 === 0) {
        TN.drawText(ctx, '>', 84, y, color, { shadow: dx ? '#383850' : null });
      }
    });
  },
});
