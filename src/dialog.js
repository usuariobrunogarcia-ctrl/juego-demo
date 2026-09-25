// Cuadros de diálogo. En 16 bits: retrato y texto limpio. En 8 bits: sin
// retrato, fuente de la NES y algunas letras corruptas.

TN.DIALOG_CHARS = 32; // caracteres por línea con retrato
TN.DIALOG_LINES = 3;

// Parte un texto en líneas de como mucho max caracteres.
TN.wrapText = function (text, max) {
  const lines = [];
  let line = '';
  for (const word of text.split(' ')) {
    if (line && (line + ' ' + word).length > max) {
      lines.push(line);
      line = word;
    } else {
      line = line ? line + ' ' + word : word;
    }
  }
  if (line) lines.push(line);
  return lines;
};

// Corrompe algunas letras de forma fija (siempre las mismas en cada página).
TN.corruptText = function (text, seed) {
  const junk = '#%?/';
  return [...text].map((ch, i) => {
    const h = ((i + 7) * 2654435761 + seed * 40503) >>> 0;
    return ch !== ' ' && h % 9 === 0 ? junk[h % junk.length] : ch;
  }).join('');
};

TN.buildPortraits = function () {
  const images = {};
  for (const [name, p] of Object.entries(TN.PORTRAITS)) {
    images[name] = TN.renderPixels(p.rows, p.palette, false, `retrato.${name}`, 24);
  }
  return images;
};

Object.assign(TN.Game.prototype, {
  startDialog(id, onDone) {
    const pages = [];
    for (const [speaker, text] of TN.DIALOGS[id]) {
      const lines = TN.wrapText(text, TN.DIALOG_CHARS);
      for (let i = 0; i < lines.length; i += TN.DIALOG_LINES) {
        pages.push({ speaker, lines: lines.slice(i, i + TN.DIALOG_LINES) });
      }
    }
    this.dialog = { pages, page: 0, shown: 0, onDone, resume: this.state };
    this.state = 'dialog';
  },

  // Diálogos del nivel que se disparan al pasar por su columna.
  checkDialogTriggers() {
    for (const d of this.level.def.dialogs) {
      if (this.dialogsSeen.has(d.id) || this.player.x < d.tx * TN.TILE) continue;
      this.dialogsSeen.add(d.id);
      this.startDialog(d.id);
      return;
    }
  },

  updateDialog() {
    this.frameCount++;
    const d = this.dialog;
    const page = d.pages[d.page];
    const total = page.lines.join('').length;
    if (d.shown < total) {
      d.shown += 1;
      if (d.shown % 3 === 0) this.sound.sfx('blip');
    }
    if (!this.input.wasPressed('confirm')) return;
    if (d.shown < total) {
      d.shown = total;
    } else if (d.page + 1 < d.pages.length) {
      d.page++;
      d.shown = 0;
    } else {
      this.state = d.resume === 'dialog' ? 'play' : d.resume;
      this.dialog = null;
      if (d.onDone) d.onDone();
    }
  },

  drawDialog() {
    const ctx = this.ctx;
    const d = this.dialog;
    const page = d.pages[d.page];
    const nes = this.mode === 'nes';
    const speaker = TN.SPEAKERS[page.speaker];
    const x = 8;
    const y = 150;
    const w = TN.WIDTH - 16;
    const h = 66;

    if (nes) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#FCFCFC';
      ctx.fillRect(x + 2, y + 2, w - 4, 1);
      ctx.fillRect(x + 2, y + h - 3, w - 4, 1);
      ctx.fillRect(x + 2, y + 2, 1, h - 4);
      ctx.fillRect(x + w - 3, y + 2, 1, h - 4);
    } else {
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = '#101838';
      ctx.fillRect(x, y, w, h);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#7890D8';
      ctx.fillRect(x, y, w, 1);
      ctx.fillRect(x, y + h - 1, w, 1);
      ctx.fillRect(x, y, 1, h);
      ctx.fillRect(x + w - 1, y, 1, h);
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + 7, y + 9, 26, 26);
      ctx.drawImage(this.portraits[speaker.portrait], x + 8, y + 10);
    }

    const textX = nes ? x + 10 : x + 40;
    const name = nes ? TN.corruptText(speaker.name, d.page + 3) : speaker.name;
    TN.drawText(ctx, name, textX, y + 8, nes ? '#FC9838' : '#F8D848', { shadow: nes ? null : '#000000' });
    let remaining = d.shown;
    page.lines.forEach((line, i) => {
      let text = line.slice(0, Math.max(0, remaining));
      remaining -= line.length;
      if (nes) text = TN.corruptText(text, d.page * 7 + i);
      TN.drawText(ctx, text, textX, y + 22 + i * 11, nes ? '#FCFCFC' : '#F8F8F8', { shadow: nes ? null : '#000000' });
    });
    const total = page.lines.join('').length;
    if (d.shown >= total && (this.frameCount >> 4) % 2 === 0) {
      TN.drawText(ctx, '>', x + w - 12, y + h - 12, nes ? '#FCFCFC' : '#F8D848');
    }
  },
});
