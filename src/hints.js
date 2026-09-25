// Enseñar sin palabras: íconos de tecla que flotan junto a algo nuevo y
// desaparecen para siempre cuando el jugador hace esa acción. Si recibe daño
// 3 veces desde el último punto de control, vuelven a aparecer como pista.

TN.HINT_RANGE = 7 * TN.TILE;
TN.HINT_RETRY = 3;

Object.assign(TN.Game.prototype, {
  // Registra las acciones que el jugador ya sabe hacer.
  trackLearning() {
    const p = this.player;
    const P = TN.PHYSICS.snes;
    if (Math.abs(p.vx) > 0.5) this.learn('move');
    if (p.event === 'jump') this.learn('jump');
    if (p.event === 'stroke') this.learn('swim');
    if (p.clipping) this.learn('clip');
    if (this.mode === 'snes' && p.onGround && Math.abs(p.vx) > P.walkSpeed + 0.2) this.learn('run');
  },

  learn(action) {
    if (!this.save.hasLearned(action)) this.save.learn(action);
  },

  drawHints(camX) {
    const retry = this.hurtCount >= TN.HINT_RETRY;
    const px = this.player.x;
    for (const h of this.level.def.hints) {
      if (this.save.hasLearned(h.learn) && !retry) continue;
      const x = h.tx * TN.TILE + 8;
      if (Math.abs(x - px) > TN.HINT_RANGE) continue;
      const bob = Math.round(Math.sin(this.frameCount / 10) * 2);
      this.drawKeys(h.keys, x - camX, h.ty * TN.TILE + bob);
    }
  },

  // Dibuja teclas en fila, centradas en x.
  drawKeys(keys, cx, y) {
    const widths = keys.map((k) => k.length * 6 + 7);
    const total = widths.reduce((a, b) => a + b, 0) + (keys.length - 1) * 2;
    let x = Math.round(cx - total / 2);
    keys.forEach((k, i) => {
      this.drawKeycap(k, x, y, widths[i]);
      x += widths[i] + 2;
    });
  },

  drawKeycap(label, x, y, w) {
    const ctx = this.ctx;
    const nes = this.mode === 'nes';
    const h = 13;
    ctx.fillStyle = nes ? '#000000' : '#202030';
    ctx.fillRect(x, y, w, h + 2);
    ctx.fillStyle = nes ? '#7C7C7C' : '#8888A0';
    ctx.fillRect(x + 1, y + 1, w - 2, h);
    ctx.fillStyle = nes ? '#FCFCFC' : '#E8E8F0';
    ctx.fillRect(x + 1, y + 1, w - 2, h - 3);
    if (!nes) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + 2, y + 1, w - 4, 1);
    }
    TN.drawText(ctx, label, x + 4, y + 2, nes ? '#000000' : '#202030');
  },
});
