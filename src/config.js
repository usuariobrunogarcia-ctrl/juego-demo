// Constantes globales del juego. Todo cuelga del espacio de nombres TN (Terra Nova).
const TN = {};

// Resolución nativa de NES/SNES. El canvas se escala por factores enteros.
TN.WIDTH = 256;
TN.HEIGHT = 224;
TN.TILE = 16;

// Colores tomados de la paleta real de la NES.
TN.COLORS = {
  sky: '#5C94FC',
  black: '#000000',
  white: '#FCFCFC',
  groundDark: '#503000',
  ground: '#C84C0C',
  groundLight: '#FC9838',
  grass: '#00A800',
  grassLight: '#B8F818',
  brick: '#C84C0C',
  mortar: '#000000',
  khaki: '#AC7C00',
  skin: '#FCA044',
  hat: '#503000',
  pole: '#B8F818',
  flag: '#00A800',
};

// Físicas (en píxeles por fotograma, a 60 fps).
// En la etapa 2 habrá un juego de valores distinto para cada modo (8 y 16 bits).
TN.PHYSICS = {
  gravity: 0.25,
  maxFall: 4,
  walkSpeed: 1.5,
  jumpSpeed: 5.3,
};
