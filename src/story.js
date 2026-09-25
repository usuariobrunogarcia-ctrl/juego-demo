// Guion: personajes y diálogos. Alex nunca da tutoriales, solo habla de la historia.

TN.SPEAKERS = {
  alex: { name: 'Alex', portrait: 'alex' },
  unknown: { name: '???', portrait: 'silhouette' },
};

// Retrato de Alex (solo se ve en 16 bits): 24x24.
TN.PORTRAITS = {
  alex: {
    palette: {
      o: '#201828', h: '#503828', H: '#785038', s: '#F0C0A0', S: '#C89078',
      g: '#202030', w: '#D8F0F8', p: '#D83838', P: '#902828', t: '#3868D0', T: '#284898',
    },
    rows: [
    '..........oooo..........',
    '........ooppppoo........',
    '......ooppooooppoo......',
    '.....opphhhhHhhhppo.....',
    '....opphhhhHhhhhHppo....',
    '...opphhhhHhhhhHhhppo...',
    '...ophhhhHhhhhHhhhhpo...',
    '...ophhhHhhhhHhhhhHpo...',
    '..opohhhhhhhssSSSHhopo..',
    '..opPhHsssssssSSShhPpo..',
    '..opPHgggggssggggghPpo..',
    '..opPhgwwwggggwwwghPpo..',
    '..opPhgwowgssgwowgHPpo..',
    '..opPogggggssgggggoPpo..',
    '..opPossssssssSSSSoPpo..',
    '...oo.osssssssSSSo.oo...',
    '......osssSSSoSSSo......',
    '.......ossssssSSo.......',
    '.......ooossssooo.......',
    '.....ootttSSSSTTToo.....',
    '...ootttttttTTTTTTToo...',
    '..otttttttttTTTTTTTTTo..',
    '.ottttttttttTTTTTTTTTTo.',
    '.ottttttttttTTTTTTTTTTo.',
  ],
  },
};

// Cada diálogo es una lista de páginas [hablante, texto].
TN.DIALOGS = {
  tuto_intro: [
    ['unknown', '¿Eh? ¿Hay alguien en la sala de pruebas?'],
    ['alex', 'Un sprite del juego original... dentro de la build nueva. Eso no debería ser posible.'],
    ['alex', 'Quédate quieto. Voy a buscar de dónde saliste para arreglarlo.'],
  ],
  tuto_cambio: [
    ['alex', '¿¡Te pasaste a la versión de 1989!? ¿Cómo hiciste eso?'],
    ['alex', 'Las dos versiones comparten el cartucho... y tú te mueves entre ellas. Genial. Un bug nuevo.'],
  ],
  tuto_salida: [
    ['alex', 'Está bien. No sé qué eres, pero no puedo borrarte sin romper todo el juego.'],
    ['alex', 'Esa salida lleva al nivel 1-1. Ve. Te voy a estar vigilando.'],
  ],
  w1_1: [
    ['alex', 'Nivel 1-1: la selva. La primera zona que rehicimos, antes de que cerrara el estudio.'],
    ['alex', 'Desde entonces sigo aquí sola. Si nadie termina este remaster, Terra Nova se pierde.'],
  ],
  w1_2: [
    ['alex', 'Encontré el origen del bug: una pared de 1989 con la colisión rota. Por ahí te escapaste.'],
    ['alex', 'Y hay más como esa en todo el cartucho. Voy a tener que arreglarlas una por una.'],
  ],
  w1_2_walls: [
    ['alex', '¡Eh! ¡Esa pared la iba a arreglar mañana!'],
  ],
  w1_3: [
    ['alex', 'Las ramas del fondo no deberían tener colisión. Las dejé así para probar el parallax...'],
    ['alex', '...y tú las usas como si fueran un camino. Esto no está en ningún documento de diseño.'],
  ],
  w1_1_bats: [
    ['alex', 'Rediseñé a los murciélagos para que no hicieran daño. Ahora son... ¿plataformas? Bueno, vale.'],
  ],
};
