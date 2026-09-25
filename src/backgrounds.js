// Fondos. En NES solo hay una capa de fondo, así que las nubes se mueven a la
// misma velocidad que el suelo. En SNES hay varias capas con scroll propio:
// nubes, colinas lejanas y selva cercana se desplazan cada una a su ritmo (parallax).

// Máscara de nube: unión de círculos, en píxeles enteros.
TN.cloudMask = function (w, h, circles) {
  const mask = [];
  for (let y = 0; y < h; y++) {
    mask.push([]);
    for (let x = 0; x < w; x++) {
      mask[y].push(circles.some(([cx, cy, r]) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r));
    }
  }
  return mask;
};

TN.renderCloud = function (colors) {
  const w = 40;
  const h = 20;
  const mask = TN.cloudMask(w, h, [[10, 13, 6], [20, 9, 8], [30, 13, 6], [20, 14, 6]]);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const inside = (x, y) => y >= 0 && y < h && x >= 0 && x < w && mask[y][x];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!mask[y][x]) continue;
      const edge = !inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1);
      if (edge && colors.outline) ctx.fillStyle = colors.outline;
      else ctx.fillStyle = y > 13 ? colors.shade : colors.light;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  return canvas;
};

// Capa que se repite en horizontal. heightAt(x) devuelve dónde empieza la silueta.
TN.renderStrip = function (width, paint) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = TN.HEIGHT;
  paint(canvas.getContext('2d'), width);
  return canvas;
};

TN.wave = (x, period, amplitudes) =>
  amplitudes.reduce((sum, [k, a, phase = 0]) => sum + a * Math.sin((2 * Math.PI * k * x) / period + phase), 0);

TN.buildBackgrounds = function () {
  const hills = TN.renderStrip(512, (ctx, w) => {
    for (let x = 0; x < w; x++) {
      const top = Math.round(118 + TN.wave(x, w, [[2, 18], [5, 8, 1]]));
      ctx.fillStyle = '#6898C8';
      ctx.fillRect(x, top, 1, 2);
      ctx.fillStyle = '#4878A8';
      ctx.fillRect(x, top + 2, 1, TN.HEIGHT - top);
    }
  });

  const jungle = TN.renderStrip(256, (ctx, w) => {
    for (let x = 0; x < w; x++) {
      const top = Math.round(146 + TN.wave(x, w, [[3, 10], [7, 5, 2]]));
      // Troncos bajo la copa.
      if (x % 64 >= 20 && x % 64 < 26) {
        ctx.fillStyle = x % 64 === 20 ? '#5C4028' : '#3C2818';
        ctx.fillRect(x, top + 24, 1, TN.HEIGHT);
      }
      ctx.fillStyle = '#48A048';
      ctx.fillRect(x, top, 1, 2);
      ctx.fillStyle = '#2C7840';
      ctx.fillRect(x, top + 2, 1, 10);
      ctx.fillStyle = '#1C5830';
      ctx.fillRect(x, top + 12, 1, 14 + Math.round(TN.wave(x, w, [[11, 3]])));
    }
  });

  return {
    nes: {
      cloud: TN.renderCloud({ outline: '#000000', light: '#FCFCFC', shade: '#A4E4FC' }),
    },
    snes: {
      cloud: TN.renderCloud({ light: '#F8F8F8', shade: '#C8E0F8' }),
      hills,
      jungle,
    },
  };
};

// Posiciones de las nubes en el nivel (en píxeles), pseudoaleatorias pero fijas.
TN.CLOUDS = Array.from({ length: 12 }, (_, i) => ({
  x: i * 176 + ((i * 97) % 60),
  y: 20 + ((i * 53) % 40),
}));
