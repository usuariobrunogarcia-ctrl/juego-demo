// Constantes globales del juego. Todo cuelga del espacio de nombres TN (Terra Nova).
const TN = {};

// Resolución nativa de NES/SNES. El canvas se escala por factores enteros.
TN.WIDTH = 256;
TN.HEIGHT = 224;
TN.TILE = 16;

TN.MODES = ['nes', 'snes'];
TN.MODE_LABEL = { nes: '8 BITS', snes: '16 BITS' };

// Colores de cada modo. Los de 8 bits salen de la paleta real de la NES;
// los de 16 bits tienen más tonos intermedios, como en la SNES.
// (Provisionales: el arte definitivo llega en la etapa 3.)
TN.THEMES = {
  nes: {
    sky: ['#5C94FC'],
    black: '#000000',
    white: '#FCFCFC',
    groundDark: '#503000',
    ground: '#C84C0C',
    groundLight: '#FC9838',
    grass: '#00A800',
    grassLight: '#B8F818',
    brick: '#C84C0C',
    mortar: '#000000',
    onlyBlock: '#7C7C7C',
    onlyBlockLight: '#BCBCBC',
    onlyBlockDark: '#000000',
    ghost: '#FCFCFC',
    khaki: '#AC7C00',
    khakiDark: '#AC7C00',
    skin: '#FCA044',
    hat: '#503000',
    pole: '#B8F818',
    flag: '#00A800',
  },
  snes: {
    // Degradado de cielo: un efecto típico de SNES (HDMA) imposible en NES.
    sky: ['#2850B8', '#3868D0', '#4880E0', '#5898E8', '#70B0F0', '#88C8F8', '#A8D8F8'],
    black: '#101018',
    white: '#F8F8F8',
    groundDark: '#58301C',
    ground: '#8C5030',
    groundLight: '#B87848',
    grass: '#389830',
    grassLight: '#78D050',
    brick: '#A85838',
    mortar: '#582818',
    onlyBlock: '#3890C0',
    onlyBlockLight: '#90E0F8',
    onlyBlockDark: '#1C4870',
    ghost: '#F8F8F8',
    khaki: '#C8A060',
    khakiDark: '#8C6830',
    skin: '#F0B888',
    hat: '#6C4020',
    pole: '#D8D8D8',
    flag: '#D83838',
  },
};

// Físicas de cada modo (en píxeles por fotograma, a 60 fps).
TN.PHYSICS = {
  // 8 bits: velocidad constante, salto de altura fija y sin control en el aire.
  nes: {
    gravity: 0.25,
    maxFall: 4,
    walkSpeed: 1.5,
    jumpSpeed: 5.3,
  },
  // 16 bits: inercia, botón de correr, salto variable y control en el aire.
  snes: {
    gravity: 0.25,
    maxFall: 4,
    walkSpeed: 1.5,
    runSpeed: 2.5,
    accel: 0.08,
    airAccel: 0.06,
    friction: 0.12,
    jumpSpeed: 5.3,
    jumpCut: -2, // al soltar el botón de salto, la subida se corta a esta velocidad
  },
};

// Fotogramas que tiembla el explorador si intenta cambiar donde no es seguro.
TN.SWITCH_ERROR_FRAMES = 14;
