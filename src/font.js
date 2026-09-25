// Fuente de píxeles de 5x7. Cada glifo son 7 filas de 5 bits en base 32.
TN.FONT = {
  'A': 'ehhvhhh',
  'B': 'uhhuhhu',
  'C': 'ehggghe',
  'D': 'uhhhhhu',
  'E': 'vgguggv',
  'F': 'vgguggg',
  'G': 'ehgnhhf',
  'H': 'hhhvhhh',
  'I': 'e44444e',
  'J': '7222iic',
  'K': 'hikokih',
  'L': 'ggggggv',
  'M': 'hrllhhh',
  'N': 'hpljhhh',
  'Ñ': 'e0hpljh',
  'O': 'ehhhhhe',
  'P': 'uhhuggg',
  'Q': 'ehhhlid',
  'R': 'uhhukih',
  'S': 'fgge11u',
  'T': 'v444444',
  'U': 'hhhhhhe',
  'V': 'hhhhha4',
  'W': 'hhhllla',
  'X': 'hha4ahh',
  'Y': 'hha4444',
  'Z': 'v1248gv',
  '0': 'ehjlphe',
  '1': '4c4444e',
  '2': 'eh1248v',
  '3': 'u11e11u',
  '4': '26aiv22',
  '5': 'vgu11he',
  '6': 'egguhhe',
  '7': 'v124888',
  '8': 'ehhehhe',
  '9': 'ehhf11e',
  '!': '4444404',
  '¡': '4044444',
  '?': 'eh12404',
  '¿': '4048ghe',
  '.': '0000004',
  ',': '0000048',
  ':': '0400040',
  '-': '000v000',
  '/': '11248gg',
  '%': 'pq248bj',
  ' ': '0000000',
};

// Dibuja texto en mayúsculas. Los acentos se quitan (salvo la Ñ); en 16 bits
// se añade una sombra, algo habitual en los juegos de SNES.
TN.drawText = function (ctx, text, x, y, color, options = {}) {
  const clean = text.toUpperCase().replace(/Ñ/g, '\u0001')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\u0001/g, 'Ñ');
  const scale = options.scale || 1;
  const width = (clean.length * 6 - 1) * scale;
  let startX = x;
  if (options.align === 'center') startX = Math.round(x - width / 2);
  if (options.shadow) TN.drawGlyphs(ctx, clean, startX + scale, y + scale, options.shadow, scale);
  TN.drawGlyphs(ctx, clean, startX, y, color, scale);
};

TN.drawGlyphs = function (ctx, text, x, y, color, scale = 1) {
  ctx.fillStyle = color;
  for (let i = 0; i < text.length; i++) {
    const glyph = TN.FONT[text[i]] || TN.FONT['?'];
    for (let row = 0; row < 7; row++) {
      const bits = parseInt(glyph[row], 32);
      for (let col = 0; col < 5; col++) {
        if (bits & (16 >> col)) ctx.fillRect(x + (i * 6 + col) * scale, y + row * scale, scale, scale);
      }
    }
  }
};
