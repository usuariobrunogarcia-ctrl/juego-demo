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
    ghost: '#FCFCFC',
    pole: '#B8F818',
    flag: '#00A800',
  },
  snes: {
    // Degradado de cielo: un efecto típico de SNES (HDMA) imposible en NES.
    sky: ['#2850B8', '#3868D0', '#4880E0', '#5898E8', '#70B0F0', '#88C8F8', '#A8D8F8'],
    black: '#101018',
    white: '#F8F8F8',
    ghost: '#F8F8F8',
    pole: '#D8D8D8',
    flag: '#D83838',
  },
};

// Físicas de cada modo (en píxeles por fotograma, a 60 fps).
TN.PHYSICS = {
  // 8 bits: arranque y frenada rápidos, salto de altura fija y poco control en el aire.
  nes: {
    gravity: 0.25,
    maxFall: 4,
    walkSpeed: 1.5,
    accel: 0.15,
    friction: 0.25,
    airAccel: 0.05,
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

// Buceo (solo 16 bits).
TN.WATER = {
  gravity: 0.08,
  maxFall: 1,
  speed: 1,
  accel: 0.06,
  strokeSpeed: 2.2, // impulso de cada brazada (botón de salto)
  exitSpeed: 4.2, // salto para salir cuando la cabeza ya está fuera
};

// Ayudas invisibles (en fotogramas): se puede saltar poco después de salirse de
// un borde, y un salto pulsado justo antes de aterrizar se recuerda.
TN.COYOTE_FRAMES = 6;
TN.JUMP_BUFFER_FRAMES = 6;

// Fotogramas que tiembla el explorador si intenta cambiar donde no es seguro.
TN.SWITCH_ERROR_FRAMES = 14;
