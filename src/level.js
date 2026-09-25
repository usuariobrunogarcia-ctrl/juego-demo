// Niveles como texto: cada carácter es un tile de 16x16.
//   .  vacío
//   #  suelo
//   B  ladrillo
//   N  bloque que solo existe en 8 bits (NES)
//   S  bloque que solo existe en 16 bits (SNES)
//   W  pared con colisión rota: en 8 bits se atraviesa y solo es sólida por arriba
//   P  punto de inicio del jugador
//   F  base de la bandera (meta)
//   C  punto de control
//   x  espinas
//   v  rama de la capa de fondo (solo 16 bits); varias seguidas forman una rama larga
TN.LEVEL_1 = [
  '....................................................BBBBB.SS......................................................................WW..............WWWW............................................................',
  '....................................................BBBBB.SS......................................................................WW..............WWWW............................................................',
  '....................................................BBBBB.SS......................................................................WW..............WWWW............................................................',
  '....................................................BBBBB.SS......................................................................WW..............WWWW............................................................',
  '....................................................BBBBB.SS......................................................................WW..............WWWW............................................................',
  '....................................................BBBBB.SS......................................................................WW..............WWWW............................................................',
  '....................................................BBBBB.SS......................................................................WW..............WWWW............................................................',
  '....................................................BBBBB.SS......................................................................WW..............WWWW............................................................',
  '..............N.................S...................BBBBB.SS......................................................................WW..............WWWW............................................................',
  '..............N.................S...................NNNNN.SS......................................................................WW......WWWWW...WWWW..............................BB..........##................',
  '..............N.................S......NN.SS........NNNNN.SS......................................................................WW..............WWWW.........................................###................',
  '..P...........N.................S...................NNNNN.SS...C...xxxxxxx..........C.......xxx...........C.......xxxx.......C....WW..............WWWW.....C.....................C............####..........F.....',
  '######################SSSSSS##########.........################################################################################################################vvvvv.......#############...#######################',
  '######################......##########.........################################################################################################################............#############...#######################',
];

// Tiles sólidos en cada modo.
// Caracteres que son tiles; el resto son objetos o vacío.
TN.TILE_CHARS = new Set(['#', 'B', 'N', 'S', 'W']);
TN.ENTITY_CHARS = new Set(['C', 'x']);

TN.SOLID_TILES = {
  nes: new Set(['#', 'B', 'N']),
  snes: new Set(['#', 'B', 'S', 'W']),
};

// Tiles que solo frenan al caer desde arriba (plataformas de un solo sentido).
TN.ONE_WAY_TILES = {
  nes: new Set(['W']),
  snes: new Set(),
};

TN.Level = class {
  constructor(rows) {
    this.rows = rows;
    this.height = rows.length;
    this.width = rows[0].length;
    this.spawn = { x: 0, y: 0 };
    this.flag = { x: 0, y: 0 };
    this.entities = [];
    this.branches = [];

    rows.forEach((row, ty) => {
      if (row.length !== this.width) throw new Error(`Fila ${ty} con longitud distinta`);
      for (let tx = 0; tx < row.length; tx++) {
        if (row[tx] === 'P') this.spawn = { x: tx, y: ty };
        if (row[tx] === 'F') this.flag = { x: tx, y: ty };
        if (TN.ENTITY_CHARS.has(row[tx])) this.entities.push({ type: row[tx], tx, ty });
      }
      for (const run of row.matchAll(/v+/g)) {
        this.branches.push({ tx: run.index, ty, length: run[0].length });
      }
    });
  }

  get pixelWidth() {
    return this.width * TN.TILE;
  }

  get pixelHeight() {
    return this.height * TN.TILE;
  }

  tileAt(tx, ty) {
    // Los bordes laterales son muros; por arriba y por abajo, vacío.
    if (tx < 0 || tx >= this.width) return '#';
    if (ty < 0 || ty >= this.height) return '.';
    const ch = this.rows[ty][tx];
    return TN.TILE_CHARS.has(ch) ? ch : '.';
  }

  isSolid(tx, ty, mode) {
    return TN.SOLID_TILES[mode].has(this.tileAt(tx, ty));
  }

  // Si al bajar de prevBottom a newBottom se cruza la parte de arriba de un tile de
  // un solo sentido, devuelve la altura de esa superficie; si no, null.
  // Solo cuenta la cara expuesta: dentro de una pared no hay "suelos" intermedios.
  oneWayTop(x, w, prevBottom, newBottom, mode) {
    const T = TN.TILE;
    const x0 = Math.floor(x / T);
    const x1 = Math.floor((x + w - 0.001) / T);
    const y0 = Math.floor(prevBottom / T);
    const y1 = Math.floor((newBottom - 0.001) / T);
    for (let ty = y0; ty <= y1; ty++) {
      const top = ty * T;
      if (top < prevBottom - 0.001 || top >= newBottom) continue;
      for (let tx = x0; tx <= x1; tx++) {
        const tile = this.tileAt(tx, ty);
        if (TN.ONE_WAY_TILES[mode].has(tile) && this.tileAt(tx, ty - 1) !== tile) return top;
      }
    }
    return null;
  }

  overlapsTile(x, y, w, h, tile) {
    const T = TN.TILE;
    for (let ty = Math.floor(y / T); ty <= Math.floor((y + h - 0.001) / T); ty++) {
      for (let tx = Math.floor(x / T); tx <= Math.floor((x + w - 0.001) / T); tx++) {
        if (this.tileAt(tx, ty) === tile) return true;
      }
    }
    return false;
  }

  // ¿Algún tile sólido se solapa con el rectángulo dado (en píxeles)?
  overlapsSolid(x, y, w, h, mode) {
    const T = TN.TILE;
    const eps = 0.001;
    const x0 = Math.floor(x / T);
    const x1 = Math.floor((x + w - eps) / T);
    const y0 = Math.floor(y / T);
    const y1 = Math.floor((y + h - eps) / T);
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        if (this.isSolid(tx, ty, mode)) return true;
      }
    }
    return false;
  }
};
