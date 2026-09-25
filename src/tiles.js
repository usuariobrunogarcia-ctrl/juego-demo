// Tiles del nivel en texto, igual que los sprites. "." deja ver el cielo.
// En 8 bits cada tile usa una sola paleta de fondo de la NES: 3 colores + el color
// común del fondo (el cielo). En 16 bits cada tile puede usar hasta 15 colores.
TN.TILES = {
  nes: {
    groundTop: {
      palette: { b: '#C84C0C', d: '#503000', g: '#00A800' },
      rows: [
        'gggggggggggggggg',
        'gggggggggggggggg',
        'gdgggdggggdgggdg',
        'dbdgdbdggdbdgdbd',
        'bbbbbbbbbbbbbbbb',
        'bbbbbbbbbbbbbbbb',
        'bdbbbbbbbbbbbbbb',
        'bbdbbbbbbbbbbbbb',
        'bbbbbbbbbbbbbbbb',
        'bbbbbbbbbbbbbdbb',
        'bbbbdbbbbbbbbbbb',
        'bdbbbbbbbbbbbbbb',
        'bdbbbbbbbbbbbbbb',
        'bddbbbbbbbbbbbbb',
        'bbbbbbbbbbbbbbbb',
        'bbbbbbbbbbbbbbbb',
      ],
    },
    ground: {
      palette: { b: '#C84C0C', d: '#503000', g: '#00A800' },
      rows: [
        'bbbbbbbbbbbbbbbb',
        'bbbbdbbdbbbbdbbb',
        'bbbdbbbbbbbbbdbb',
        'bbbbbbbdbbbbbbbb',
        'bbbbbbbbbbbbbbbb',
        'bbbbbbbbbbbbbbbb',
        'bdbbbbbbbbbbbbbb',
        'bbdbbbbbbbbbbbbb',
        'bbbbbbbbbbbbbbbb',
        'bbbbbbbbbbbbbdbb',
        'bbbbdbbbbbbbbbbb',
        'bdbbbbbbbbbbbbbb',
        'bdbbbbbbbbbbbbbb',
        'bddbbbbbbbbbbbbb',
        'bbbbbbbbbbbbbbbb',
        'bbbbbbbbbbbbbbbb',
      ],
    },
    brick: {
      palette: { l: '#FC9838', b: '#C84C0C', d: '#000000' },
      rows: [
        'llllllldllllllld',
        'bbbbbbbdbbbbbbbd',
        'bbbbbbbdbbbbbbbd',
        'dddddddddddddddd',
        'lllldllllllldlll',
        'bbbbdbbbbbbbdbbb',
        'bbbbdbbbbbbbdbbb',
        'dddddddddddddddd',
        'llllllldllllllld',
        'bbbbbbbdbbbbbbbd',
        'bbbbbbbdbbbbbbbd',
        'dddddddddddddddd',
        'lllldllllllldlll',
        'bbbbdbbbbbbbdbbb',
        'bbbbdbbbbbbbdbbb',
        'dddddddddddddddd',
      ],
    },
    block: {
      palette: { l: '#BCBCBC', m: '#7C7C7C', d: '#000000' },
      rows: [
        'llllllllllllllld',
        'llmmmmmmmmmmmmdd',
        'lmmmmmmmmmmmmmmd',
        'lmmmllllllllmmmd',
        'lmmlmmmmmmmmdmmd',
        'lmmlmmmmmmmmdmmd',
        'lmmlmmmmmmmmdmmd',
        'lmmlmmmmmmmmdmmd',
        'lmmlmmmmmmmmdmmd',
        'lmmlmmmmmmmmdmmd',
        'lmmlmmmmmmmmdmmd',
        'lmmlmmmmmmmmdmmd',
        'lmmmddddddddmmmd',
        'lmmmmmmmmmmmmmmd',
        'lmmmmmmmmmmmmmdd',
        'dddddddddddddddd',
      ],
    },
    glitchWall: {
      palette: { l: '#FC9838', b: '#C84C0C', d: '#000000' },
      rows: [
        'bbbbddddlllldddd',
        'bbbbddddddbbbbbb',
        'bbdbbbbdbbbbbbbd',
        'llbbddbbdddddddd',
        'llllllldllllllld',
        'bbbbbbbdbbbbbbbd',
        'ddllllbbllddlldd',
        'dddddddddddddddd',
        'llllllldllllllld',
        'bbbbdbdbbbbbdbbb',
        'ddddddddddbbddll',
        'dddddddddddddddd',
        'ddddddbbddllddbb',
        'bbbbdbbbbdbbdbbb',
        'bdbbdbbbbbbbdbbb',
        'dddddddddddddddd',
      ],
    },
    waterTop: {
      palette: { w: '#FCFCFC', l: '#3CBCFC', b: '#0058F8' },
      rows: [
        'wwllwwwwwwllwwww',
        'lllbllllllllbbll',
        'bbbbbbbbbbbbbbbb',
        'bblbbbbbbbbllbbb',
        'bbbllbbbbbbbbbbb',
        'bbbbbbbbbllbbbbb',
        'bbbbbbbbbbbbbbbb',
        'bllbbbbbbbbbbblb',
        'bbbbbbllbbbbbbbb',
        'bbbbbbbbbbbbbbbb',
        'bbbbbbbbbbbllbbb',
        'bbbbllbbbbbbbbbb',
        'bbbbbbbbbbbbbbbb',
        'bbbbbbbbbllbbbbb',
        'llbbbbbbbbbbbbbb',
        'bbbbbbbbbbbbbbbb',
      ],
    },
    water: {
      palette: { w: '#FCFCFC', l: '#3CBCFC', b: '#0058F8' },
      rows: [
        'bbbbbbbbbbbbbbbb',
        'bbbbbbbbbbbbbbbb',
        'bbbbbbbbbbbbbbbb',
        'bblbbbbbbbbllbbb',
        'bbbllbbbbbbbbbbb',
        'bbbbbbbbbllbbbbb',
        'bbbbbbbbbbbbbbbb',
        'bllbbbbbbbbbbblb',
        'bbbbbbllbbbbbbbb',
        'bbbbbbbbbbbbbbbb',
        'bbbbbbbbbbbllbbb',
        'bbbbllbbbbbbbbbb',
        'bbbbbbbbbbbbbbbb',
        'bbbbbbbbbllbbbbb',
        'llbbbbbbbbbbbbbb',
        'bbbbbbbbbbbbbbbb',
      ],
    },
  },
  snes: {
    groundTop: {
      palette: { G: '#88E060', g: '#389830', h: '#206820', b: '#8C5030', B: '#6C3C20', l: '#B87848', s: '#C8B090' },
      rows: [
        '..G....G.....G..',
        '.GgG..GgG.G.GgG.',
        'GGgGGGGgGGgGGgGG',
        'gggGgggggGggggGg',
        'ggghgggghggghggg',
        'hghhhghhhhghhhgh',
        'bhbbbhbbbhbbbbhb',
        'bbBbbBbbbbbbbbbb',
        'bbbbbbbbbbbbbbbl',
        'bbBbbBbbbbbblblB',
        'bbbbbbbbbbbBbbBb',
        'lbbBbbbbbBbbbbbb',
        'bbbbbbbbsbbbsbbb',
        'bBbbbbbbbbBbbbbb',
        'bbbbbbbbbbblbbBb',
        'blsbbbbbbbbbbbBb',
      ],
    },
    ground: {
      palette: { G: '#88E060', g: '#389830', h: '#206820', b: '#8C5030', B: '#6C3C20', l: '#B87848', s: '#C8B090' },
      rows: [
        'bbbbbbbbbbbbbbbb',
        'bbbbbbbbbbbbbbbb',
        'blBbbbbbbbBbbbbb',
        'bbbbbbBbbbbbbBbb',
        'bbbBbbblbbbbbbbB',
        'bbblbbbbbbBbbbsb',
        'bbbbbbbbblbbbbbB',
        'bbBbbBbbbbbbbbbb',
        'bbbbbbbbbbbbbbbl',
        'bbBbbBbbbbbblblB',
        'bbbbbbbbbbbBbbBb',
        'lbbBbbbbbBbbbbbb',
        'bbbbbbbbsbbbsbbb',
        'bBbbbbbbbbBbbbbb',
        'bbbbbbbbbbblbbBb',
        'blsbbbbbbbbbbbBb',
      ],
    },
    brick: {
      palette: { a: '#C87850', b: '#A85838', c: '#804028', m: '#582818' },
      rows: [
        'aaaaaaamaaaaaaam',
        'abbbbbcmabbbbbcm',
        'bbbbbccmbbbbbccm',
        'mmmmmmmmmmmmmmmm',
        'aaamaaaaaaamaaaa',
        'bbcmabbbbbcmabbb',
        'bccmbbbbbccmbbbb',
        'mmmmmmmmmmmmmmmm',
        'aaaaaaamaaaaaaam',
        'abbbbbcmabbbbbcm',
        'bbbbbccmbbbbbccm',
        'mmmmmmmmmmmmmmmm',
        'aaamaaaaaaamaaaa',
        'bbcmabbbbbcmabbb',
        'bccmbbbbbccmbbbb',
        'mmmmmmmmmmmmmmmm',
      ],
    },
    block: {
      palette: { w: '#F8F8F8', j: '#90E0F8', J: '#3890C0', t: '#2868A0', k: '#1C4870' },
      rows: [
        'jjjjjjjjjjjjjjjk',
        'jwJJJJJJJJJJJJtk',
        'jJJJJJJJJJJJJJtk',
        'jJJkkkkkkkkkkJtk',
        'jJJkJJJJJJJJjJtk',
        'jJJkJwjjjjJJjJtk',
        'jJJkJjttttJJjJtk',
        'jJJkJjtwwtJJjJtk',
        'jJJkJjtwwtJJjJtk',
        'jJJkJjttttJJjJtk',
        'jJJkJJJJJJJJjJtk',
        'jJJkJJJJJJJJjJtk',
        'jJJjjjjjjjjjjJtk',
        'jJJJJJJJJJJJJJtk',
        'jtttttttttttttkk',
        'kkkkkkkkkkkkkkkk',
      ],
    },
    glitchWall: {
      palette: { a: '#B8B8C8', b: '#9090A0', c: '#686878', m: '#383848' },
      rows: [
        'aaaaaaamaaaaaaam',
        'abbbbbcmabbbbbcm',
        'bbbbbccmbbbbbccm',
        'mmmmmmmmmmmmmmmm',
        'aaamaaaaaaamaaaa',
        'bbcmabbbbbcmabbb',
        'bccmbbbbbccmbbbb',
        'mmmmmmmmmmmmmmmm',
        'aaaaaaamaaaaaaam',
        'abbbbbcmabbbbbcm',
        'bbbbbccmbbbbbccm',
        'mmmmmmmmmmmmmmmm',
        'aaamaaaaaaamaaaa',
        'bbcmabbbbbcmabbb',
        'bccmbbbbbccmbbbb',
        'mmmmmmmmmmmmmmmm',
      ],
    },
  },
};

TN.buildTiles = function () {
  const images = {};
  for (const mode of TN.MODES) {
    images[mode] = {};
    for (const [name, tile] of Object.entries(TN.TILES[mode])) {
      if (mode === 'nes' && Object.keys(tile.palette).length > 3) {
        throw new Error(`Tile ${name}: en NES solo caben 3 colores + el fondo`);
      }
      images[mode][name] = TN.renderPixels(tile.rows, tile.palette, false, `${mode}.${name}`);
    }
  }
  return images;
};

// Sala de pruebas (16 bits): texturas provisionales de "falta textura".
TN.buildDebugTiles = function () {
  const make = (top) => {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    for (let y = 0; y < 16; y += 8) {
      for (let x = 0; x < 16; x += 8) {
        ctx.fillStyle = (x + y) % 16 ? '#E040E0' : '#301030';
        ctx.fillRect(x, y, 8, 8);
      }
    }
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 15, 16, 1);
    ctx.fillRect(15, 0, 1, 16);
    if (top) {
      ctx.fillStyle = '#40F040';
      ctx.fillRect(0, 0, 16, 2);
    }
    return canvas;
  };
  return { groundTop: make(true), ground: make(false) };
};
