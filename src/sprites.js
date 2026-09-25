// Sprites en texto: cada carácter es un píxel y "." es transparente.
// Todos los fotogramas miden 16x16 y miran a la derecha; el volteo se genera solo.

// ---------- 8 bits ----------
// Como en la NES: una sola paleta de 3 colores + transparente.
// Por eso el sombrero, el cinturón y las botas comparten el mismo marrón.
TN.NES_TOP = [
  '................',
  '......dddd......',
  '.....dddddd.....',
  '...dddddddddd...',
  '.....ssssss.....',
  '.....sssdsss....',
  '.....ssssss.....',
  '......ssss......',
];
TN.NES_BODY = [
  '....kkkkkkkk....',
  '...kkkkdkkkkk...',
  '...skkkkdkkks...',
  '....dddddddd....',
  '....kkkkkkkk....',
];
TN.NES_BODY_JUMP = [
  '..s.kkkkkkkk....',
  '..skkkkdkkkkk...',
  '...kkkkdkkkks...',
  '....dddddddd....',
  '....kkkkkkkk....',
];

// ---------- 16 bits ----------
// Hasta 15 colores: contorno, sombreado y un pañuelo rojo que en NES no cabía.
TN.SNES_TOP = [
  '.....oooooo.....',
  '....ojjHHHho....',
  '....oHHHHhho....',
  '....obbbbbbo....',
  '..oooHHHHHhooo..',
  '....oSssepsso...',
  '....oSsssssso...',
  '.....oSSssso....',
  '....orrrrRro....',
  '...okkkrRkkKo...',
];

TN.SPRITES = {
  nes: {
    palette: { d: '#503000', k: '#AC7C00', s: '#FCA044' },
    walkCycle: ['walk1', 'walk2'],
    stepPixels: 6,
    frames: {
      idle: [...TN.NES_TOP, ...TN.NES_BODY,
        '....kkk..kkk....',
        '....ddd..ddd....',
        '....dddd.dddd...'],
      walk1: [...TN.NES_TOP, ...TN.NES_BODY,
        '...kkk....kkk...',
        '..ddd......ddd..',
        '.dddd......dddd.'],
      walk2: [...TN.NES_TOP, ...TN.NES_BODY,
        '.....kkkkkk.....',
        '......dddd......',
        '......ddddd.....'],
      jump: [...TN.NES_TOP, ...TN.NES_BODY_JUMP,
        '....kkkkkkkk....',
        '...ddd....ddd...',
        '................'],
    },
  },
  snes: {
    palette: {
      o: '#201010', p: '#201010', e: '#F8F8F8',
      h: '#6C4020', H: '#9C6838', j: '#C89858', b: '#D84830',
      s: '#F0B888', S: '#C88058',
      r: '#D83838', R: '#902020',
      k: '#D8B878', K: '#A08048',
      n: '#6C5838', N: '#4C3C24', g: '#F8D848',
      d: '#5C3018', D: '#3C1C10',
    },
    walkCycle: ['walkA', 'walkB', 'walkC', 'walkB'],
    stepPixels: 5,
    frames: {
      idle: [...TN.SNES_TOP,
        '..oskkkkkkKKso..',
        '...onnngnnnno...',
        '...onnnnnNNno...',
        '...onNo..onNo...',
        '...oddDo..oddDo.',
        '...ooooo..ooooo.'],
      walkA: [...TN.SNES_TOP,
        '...okkkkkkKKso..',
        '...onnngnnnno...',
        '...onnnnnNNno...',
        '..onNo....onNo..',
        '.oddDo....oddDo.',
        '.ooooo....ooooo.'],
      walkB: [...TN.SNES_TOP,
        '...okkkkkkKKo...',
        '...onnngnnnno...',
        '...onnnnnNNno...',
        '.....onNNo......',
        '.....oddDDo.....',
        '.....oooooo.....'],
      walkC: [...TN.SNES_TOP,
        '..oskkkkkkKKo...',
        '...onnngnnnno...',
        '...onnnnnNNno...',
        '..onNo....onNo..',
        '.oddDo....oddDo.',
        '.ooooo....ooooo.'],
      jump: [...TN.SNES_TOP.slice(0, 8),
        '..sorrrrRros....',
        '...okkkrRkkKo...',
        '...okkkkkkKKo...',
        '...onnngnnnno...',
        '...onnnnnNNno...',
        '..onNo...onNo...',
        '..oddDo..oddDo..',
        '..ooooo..ooooo..'],
    },
  },
};

// Convierte los sprites de texto en imágenes (normal y volteada) una sola vez.
TN.buildSprites = function () {
  const images = {};
  for (const mode of TN.MODES) {
    const { palette, frames } = TN.SPRITES[mode];
    if (mode === 'nes' && Object.keys(palette).length > 3) {
      throw new Error('Un sprite de NES solo puede tener 3 colores');
    }
    images[mode] = {};
    for (const [name, rows] of Object.entries(frames)) {
      images[mode][name] = {
        right: TN.renderPixels(rows, palette, false, `${mode}.${name}`),
        left: TN.renderPixels(rows, palette, true, `${mode}.${name}`),
      };
    }
  }
  return images;
};

TN.renderPixels = function (rows, palette, flip, name) {
  const size = 16;
  if (rows.length !== size) throw new Error(`Sprite ${name}: ${rows.length} filas`);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  rows.forEach((row, y) => {
    if (row.length !== size) throw new Error(`Sprite ${name}, fila ${y}: ${row.length} píxeles`);
    for (let x = 0; x < size; x++) {
      const ch = row[x];
      if (ch === '.') continue;
      if (!palette[ch]) throw new Error(`Sprite ${name}: color "${ch}" no está en la paleta`);
      ctx.fillStyle = palette[ch];
      ctx.fillRect(flip ? size - 1 - x : x, y, 1, 1);
    }
  });
  return canvas;
};
