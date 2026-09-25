// Comentarios de Alex que no frenan el juego: una línea corta en una franja
// inferior, sin pausar, que reacciona a lo que hace el jugador.

TN.REMARK_FRAMES = 200;
TN.REMARK_QUIET = 120; // fotogramas sin comentarios después de un diálogo

Object.assign(TN.Game.prototype, {
  resetRemarks() {
    this.remark = null;
    this.remarksDone = new Set();
    this.wasClipping = false;
    if (!this.remarkTurn) this.remarkTurn = {};
  },

  // Muestra una frase de la situación dada. once: solo una vez por nivel.
  sayRemark(kind, once = true) {
    // Antes de la ruptura Alex todavía no sabe que existes.
    if (!this.level.def.switchUnlocked) return;
    if (once && this.remarksDone.has(kind)) return;
    if (this.remark || this.frameCount - (this.dialogEndFrame || -1e9) < TN.REMARK_QUIET) return;
    const lines = TN.REMARKS[kind];
    const turn = this.remarkTurn[kind] || 0;
    this.remarkTurn[kind] = turn + 1;
    this.remarksDone.add(kind);
    this.remark = { text: lines[turn % lines.length], timer: TN.REMARK_FRAMES };
    this.sound.sfx('blip');
  },

  updateRemarks() {
    const clipping = this.player.clipping;
    if (this.wasClipping && !clipping) this.sayRemark('clip');
    this.wasClipping = clipping;
    if (this.remark && --this.remark.timer <= 0) this.remark = null;
  },

  drawRemark() {
    const r = this.remark;
    const ctx = this.ctx;
    const nes = this.mode === 'nes';
    const shown = Math.min(r.text.length, Math.floor((TN.REMARK_FRAMES - r.timer) / 2));
    const y = TN.HEIGHT - 18;
    // Entra y sale deslizándose desde abajo.
    const slide = Math.max(0, 8 - Math.min(TN.REMARK_FRAMES - r.timer, r.timer)) * 2;
    if (nes) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, y + slide, TN.WIDTH, 18);
      ctx.fillStyle = '#FCFCFC';
      ctx.fillRect(0, y + slide, TN.WIDTH, 1);
    } else {
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = '#101838';
      ctx.fillRect(0, y + slide, TN.WIDTH, 18);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#7890D8';
      ctx.fillRect(0, y + slide, TN.WIDTH, 1);
    }
    const shadow = nes ? null : '#000000';
    TN.drawText(ctx, 'ALEX', 8, y + 6 + slide, nes ? '#FC9838' : '#F8D848', { shadow });
    let text = r.text.slice(0, shown);
    // En 8 bits, destellos breves de letras corruptas, como en los diálogos.
    if (nes && this.frameCount % 150 < 5) text = TN.corruptText(text, this.frameCount);
    TN.drawText(ctx, text, 38, y + 6 + slide, nes ? '#FCFCFC' : '#F8F8F8', { shadow });
  },
});
