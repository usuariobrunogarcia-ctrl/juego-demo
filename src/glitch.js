// La ruptura del juego: al final del prólogo, el explorador se mete en la pared
// rota y sale del nivel. La imagen se corrompe, aparecen errores de depuración y
// el juego carga la build del remaster.

TN.BREAK_FRAMES = 330;
TN.BREAK_LOG = [
  'ERROR: SPRITE 01 FUERA DE LOS LIMITES',
  'PC=$C3F2  A=$FF  X=$1B  Y=$00',
  'VOLCADO DE MEMORIA........ FALLO',
  '',
  'BUSCANDO NIVEL VALIDO...',
  'ENCONTRADO: TERRA_NOVA_DX/BUILD_0.3',
  'CARGANDO...',
];

Object.assign(TN.Game.prototype, {
  startBreak() {
    this.state = 'break';
    this.stateTimer = 0;
    this.sound.sfx('crash');
    this.sound.setMusic(false);
    // Guarda ya la ruptura: desde ahora el título es el de DX.
    this.save.data.broken = true;
    this.savePieces();
    this.save.unlock(this.levelIndex + 1);
  },

  updateBreak() {
    this.frameCount++;
    this.stateTimer++;
    if (this.stateTimer % 20 === 0 && this.stateTimer < 150) this.sound.sfx('crash');
    if (this.stateTimer >= TN.BREAK_FRAMES) {
      this.sound.setMusic(true);
      this.enterLevel(this.levelIndex + 1);
    }
  },

  drawBreak() {
    const ctx = this.ctx;
    const t = this.stateTimer;
    if (t < 150) {
      // 1) La imagen se rompe: franjas desplazadas y tiles fuera de sitio.
      const images = Object.values(this.tiles.nes);
      let seed = t * 7919;
      const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
      const junk = Math.floor(t / 4);
      for (let i = 0; i < junk; i++) {
        const img = images[Math.floor(rand() * images.length)];
        ctx.drawImage(img, Math.floor(rand() * 16) * 16, Math.floor(rand() * 14) * 16);
      }
      TN.tearScreen(ctx, 10 + t, t);
      if (t > 90 && t % 6 < 3) {
        ctx.fillStyle = ['#000000', '#FCFCFC', '#F83800'][Math.floor(rand() * 3)];
        ctx.globalAlpha = 0.5;
        ctx.fillRect(0, 0, TN.WIDTH, TN.HEIGHT);
        ctx.globalAlpha = 1;
      }
      return;
    }
    // 2) Pantalla negra con el registro de errores, línea a línea.
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, TN.WIDTH, TN.HEIGHT);
    const lines = Math.min(TN.BREAK_LOG.length, Math.floor((t - 160) / 20));
    for (let i = 0; i < lines; i++) {
      TN.drawText(ctx, TN.BREAK_LOG[i], 12, 40 + i * 12, i < 3 ? '#F83800' : '#FCFCFC');
    }
    if (lines === TN.BREAK_LOG.length && (t >> 3) % 2) {
      ctx.fillStyle = '#FCFCFC';
      ctx.fillRect(12 + 12 * 6, 40 + (lines - 1) * 12, 5, 7);
    }
  },
});
