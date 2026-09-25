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
    batUp: {
      palette: { k: '#000000', p: '#6844FC', e: '#FCFCFC' },
      rows: [
        '................',
        '................',
        'k..............k',
        'kk............kk',
        'kpk....kk....kpk',
        'kppk..kkkk..kppk',
        'kpppkkekkekkpppk',
        '.kpppkkkkkkpppk.',
        '..kppkkkkkkppk..',
        '...kk.kkkk.kk...',
        '......k..k......',
        '................',
        '................',
        '................',
        '................',
        '................',
      ],
    },
    batDown: {
      palette: { k: '#000000', p: '#6844FC', e: '#FCFCFC' },
      rows: [
        '................',
        '................',
        '................',
        '................',
        '.......kk.......',
        '......kkkk......',
        '..kkkkekkekkkk..',
        '.kpppkkkkkkpppk.',
        'kpppk.kkkk.kpppk',
        'kppk...kk...kppk',
        'kpk..........kpk',
        'kk............kk',
        'k..............k',
        '................',
        '................',
        '................',
      ],
    },
    map: {
      palette: { d: '#000000', l: '#FCE0A8', b: '#C84C0C' },
      rows: [
        '................',
        '..dddddddddddd..',
        '.dlllllllllllld.',
        '.dlbbllllbbllld.',
        '.dlllblllllblld.',
        '.dllllbbbbbllld.',
        '.dlblllllllllld.',
        '.dllblllbbbllld.',
        '.dlllllllllbbld.',
        '.dllbblllllllld.',
        '.dlllllblllllld.',
        '.dlllllllllllld.',
        '..dddddddddddd..',
        '................',
        '................',
        '................',
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
    batUp: {
      palette: { o: '#201830', b: '#584878', m: '#8870B0', l: '#B8A0D8', e: '#F8D848' },
      rows: [
        '................',
        '................',
        'o..............o',
        'oo............oo',
        'olo....oo....olo',
        'omlo..obbo..olmo',
        'ommlooebbeoolmmo',
        '.ommlbbbbbblmmo.',
        '..ommbbbbbbmmo..',
        '...oo.obbo.oo...',
        '......o..o......',
        '................',
        '................',
        '................',
        '................',
        '................',
      ],
    },
    batDown: {
      palette: { o: '#201830', b: '#584878', m: '#8870B0', l: '#B8A0D8', e: '#F8D848' },
      rows: [
        '................',
        '................',
        '................',
        '................',
        '.......oo.......',
        '......obbo......',
        '..ooooebbeoooo..',
        '.olllbbbbbblllo.',
        'olmmo.obbo.ommlo',
        'ommo...oo...ommo',
        'omo..........omo',
        'oo............oo',
        'o..............o',
        '................',
        '................',
        '................',
      ],
    },
    map: {
      palette: { o: '#503018', l: '#F8E8B8', L: '#E0C888', b: '#C84830', g: '#58A038' },
      rows: [
        '................',
        '..oooooooooooo..',
        '.ollllllllllLLo.',
        '.olggllllbblLLo.',
        '.olllglllllbLLo.',
        '.ollllgbbbblLLo.',
        '.olgllllllllLLo.',
        '.ollglllbbblLLo.',
        '.olllllllllbbLo.',
        '.ollggllllllLLo.',
        '.oLLLLLbLLLLLLo.',
        '.oLLLLLLLLLLLLo.',
        '..oooooooooooo..',
        '................',
        '................',
        '................',
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
    this.dangerous = true;
  }

  harmless() {
    return false;
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

// Rama de la capa de fondo cercana (solo existe en 16 bits). Esa capa se desplaza
// a la mitad de velocidad que el nivel, así que la rama se mueve respecto al suelo
// cuando se mueve la cámara: al caminar sobre ella, te lleva hacia delante.
TN.PARALLAX_NEAR = 0.5;

TN.Branch = class {
  constructor(spec, level) {
    this.baseX = spec.tx * TN.TILE;
    this.y = spec.ty * TN.TILE + 4;
    this.w = spec.length * TN.TILE;
    this.h = 6;
    // La rama está en su sitio del mapa cuando el explorador llega justo a su izquierda.
    const maxCam = level.pixelWidth - TN.WIDTH;
    this.anchorCam = Math.max(0, Math.min(this.baseX - TN.TILE - TN.WIDTH / 2 + 8, maxCam));
    this.x = this.baseX;
  }

  get top() {
    return this.y;
  }

  place(camX) {
    this.x = this.baseX + (camX - this.anchorCam) * (1 - TN.PARALLAX_NEAR);
  }
};

// Murciélago: vuela de lado a lado siguiendo su rutina. En 8 bits hace daño al
// tocarlo; en 16 bits fue rediseñado y se puede usar como plataforma móvil.
TN.Bat = class {
  constructor(tx, ty) {
    this.baseX = tx * TN.TILE;
    this.baseY = ty * TN.TILE;
    this.x = this.baseX;
    this.y = this.baseY;
    this.w = 16;
    this.h = 16;
    this.phase = tx * 0.7;
    this.hitbox = { x: 1, y: 5, w: 14, h: 6 };
    this.dangerous = true;
    this.time = 0;
    this.update();
  }

  get sprite() {
    return (this.time >> 3) % 2 ? 'batDown' : 'batUp';
  }

  get top() {
    return this.y + 5;
  }

  harmless(mode) {
    return mode === 'snes';
  }

  update() {
    this.prevX = this.x;
    this.prevY = this.y;
    this.time++;
    this.x = this.baseX + Math.round(20 * Math.sin(this.time / 40 + this.phase));
    this.y = this.baseY + Math.round(3 * Math.sin(this.time / 12 + this.phase));
  }
};

// Fragmento de mapa: coleccionable. Flota suavemente.
TN.MapPiece = class {
  constructor(tx, ty) {
    this.baseY = ty * TN.TILE;
    this.x = tx * TN.TILE;
    this.y = this.baseY;
    this.w = 16;
    this.h = 16;
    this.sprite = 'map';
    this.hitbox = { x: 2, y: 2, w: 12, h: 11 };
    this.collected = false;
    this.time = 0;
  }

  update() {
    this.time++;
    this.y = this.baseY + Math.round(2 * Math.sin(this.time / 15));
  }
};

TN.createEntity = function (spec) {
  if (spec.type === '*') return new TN.MapPiece(spec.tx, spec.ty);
  if (spec.type === 'x') return new TN.Thorns(spec.tx, spec.ty);
  if (spec.type === 'b') return new TN.Bat(spec.tx, spec.ty);
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
