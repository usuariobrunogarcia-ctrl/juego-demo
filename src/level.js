// Niveles como texto: cada carácter es un tile de 16x16.
//   .  vacío
//   #  suelo
//   B  ladrillo
//   N  bloque que solo existe en 8 bits (NES)
//   S  bloque que solo existe en 16 bits (SNES)
//   P  punto de inicio del jugador
//   F  base de la bandera (meta)
TN.LEVEL_1 = [
  '....................................................BBBBB.SS....................................',
  '....................................................BBBBB.SS....................................',
  '....................................................BBBBB.SS....................................',
  '....................................................BBBBB.SS....................................',
  '....................................................BBBBB.SS....................................',
  '....................................................BBBBB.SS....................................',
  '....................................................BBBBB.SS....................................',
  '....................................................BBBBB.SS....................................',
  '..............N.................S...................BBBBB.SS....................................',
  '..............N.................S...................NNNNN.SS......BB..........##................',
  '..............N.................S......NN.SS........NNNNN.SS.................###................',
  '..P...........N.................S...................NNNNN.SS................####..........F.....',
  '######################SSSSSS##########.........#######################...#######################',
  '######################......##########.........#######################...#######################',
];

// Tiles sólidos en cada modo.
TN.SOLID_TILES = {
  nes: new Set(['#', 'B', 'N']),
  snes: new Set(['#', 'B', 'S']),
};

TN.Level = class {
  constructor(rows) {
    this.rows = rows;
    this.height = rows.length;
    this.width = rows[0].length;
    this.spawn = { x: 0, y: 0 };
    this.flag = { x: 0, y: 0 };

    rows.forEach((row, ty) => {
      if (row.length !== this.width) throw new Error(`Fila ${ty} con longitud distinta`);
      for (let tx = 0; tx < row.length; tx++) {
        if (row[tx] === 'P') this.spawn = { x: tx, y: ty };
        if (row[tx] === 'F') this.flag = { x: tx, y: ty };
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
    return ch === 'P' ? '.' : ch;
  }

  isSolid(tx, ty, mode) {
    return TN.SOLID_TILES[mode].has(this.tileAt(tx, ty));
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
