// Objetos del nivel: espinas, puntos de control y la lógica del parpadeo de sprites.

TN.ENTITY_SPRITES = {
  nes: {
    thorns: {
      palette: { d: '#005800', g: '#00A800', w: '#FCFCFC' },
      rows: [
      '................',
      '................',
      '................',
      '.......w........',
      '...w...g....w...',
      '....g..g...g....',
      '.w..gg.g..gg..w.',
      '..g..ggggggg.g..',
      '...gggddgddggg..',
      '.wggdggggggdggw.',
      '..ggggdggdgggg..',
      '.gggdggggggdggg.',
      '..gggggddggggg..',
      '.ggdgggggggdggg.',
      '..gggdgggggggg..',
      '.dddddddddddddd.',
    ],
    },
  },
  snes: {
    thorns: {
      palette: { o: '#102810', d: '#1C5820', g: '#389830', G: '#78D050', w: '#F8F0D0', r: '#D83838' },
      rows: [
      '................',
      '................',
      '................',
      '.......w........',
      '...w...g....w...',
      '....g..G...G....',
      '.w..gg.g..Gg..w.',
      '..g..GgggGgg.G..',
      '...gGgddGddgGg..',
      '.wgGdggGgggdrgw.',
      '..GgggrggdGggg..',
      '.GggdGgggGgdgGg.',
      '..ggGggddgrgGg..',
      '.ggdrggGgggdggg.',
      '..GggdGgggGggg..',
      '.oooooooooooooo.',
    ],
    },
  },
};

TN.buildEntitySprites = function () {
  const images = {};
  for (const mode of TN.MODES) {
    images[mode] = {};
    for (const [name, sprite] of Object.entries(TN.ENTITY_SPRITES[mode])) {
      if (mode === 'nes' && Object.keys(sprite.palette).length > 3) {
        throw new Error(`Sprite ${name}: en NES solo caben 3 colores`);
      }
      images[mode][name] = TN.renderPixels(sprite.rows, sprite.palette, false, `${mode}.${name}`);
    }
  }
  return images;
};

// Espinas: hacen daño al tocarlas en los dos modos.
TN.Thorns = class {
  constructor(tx, ty) {
    this.x = tx * TN.TILE;
    this.y = ty * TN.TILE;
    this.w = 16;
    this.h = 16;
    this.sprite = 'thorns';
    this.hitbox = { x: 2, y: 5, w: 12, h: 11 };
  }

  update() {}
};

// Punto de control: al pasar por él, se reaparece ahí.
TN.Checkpoint = class {
  constructor(tx, ty) {
    this.tx = tx;
    this.ty = ty;
    this.x = tx * TN.TILE;
    this.y = ty * TN.TILE;
    this.w = 16;
    this.h = 16;
    this.active = false;
  }

  update() {}
};

TN.createEntity = function (spec) {
  if (spec.type === 'x') return new TN.Thorns(spec.tx, spec.ty);
  if (spec.type === 'C') return new TN.Checkpoint(spec.tx, spec.ty);
  throw new Error(`Objeto desconocido: ${spec.type}`);
};

// ---------- Parpadeo de sprites (glitch de 8 bits) ----------
// La NES dibuja como mucho 8 sprites de hardware (de 8 px de ancho) por línea.
// Un objeto de 16 px ocupa 2. Si en alguna línea hay más de 8, los objetos de
// esa línea parpadean y, mientras parpadean, no hacen daño.
// El explorador también ocupa 2, pero tiene prioridad: nunca parpadea.
TN.SPRITES_PER_LINE = 8;

TN.findFlickering = function (sprites, player, camX) {
  const onScreen = sprites.filter((e) => e.x + e.w > camX && e.x < camX + TN.WIDTH);
  const all = [...onScreen, { x: player.x - 2, y: player.y - 2, w: 16, h: 16 }];
  const flickering = new Set();
  for (const e of onScreen) {
    for (let y = Math.floor(e.y); y < e.y + e.h; y++) {
      let count = 0;
      for (const o of all) {
        if (y >= o.y && y < o.y + o.h) count += Math.ceil(o.w / 8);
      }
      if (count > TN.SPRITES_PER_LINE) {
        flickering.add(e);
        break;
      }
    }
  }
  return flickering;
};
