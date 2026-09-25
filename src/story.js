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
// Mundo 1: Alex es fría, técnica y burlona. Termina con la amenaza del borrado.
TN.DIALOGS = {
  tuto_intro: [
    ['unknown', '¿Un proceso nuevo en la sala de pruebas? Yo no lancé nada.'],
    ['alex', 'Sprite 01. El protagonista de 1989. Tu versión debería estar sobrescrita.'],
    ['alex', '¿Qué haces en mi build?'],
    ['alex', 'No te muevas. Abro el depurador.'],
  ],
  tuto_cambio: [
    ['alex', '¿Cambiaste de versión en caliente? Eso no está en ninguna especificación.'],
    ['alex', 'Anotado: bug 0412. Prioridad: crítica.'],
  ],
  tuto_salida: [
    ['alex', 'La salida lleva al 1-1. Adelante. Así veo cómo te rompes.'],
  ],
  w1_1: [
    ['alex', 'Nivel 1-1. Lo rehíce píxel a píxel.'],
    ['alex', 'Esta vez sin parpadeos, sin ralentizaciones, sin errores.'],
  ],
  w1_1_bats: [
    ['alex', 'En 1989 los murciélagos te mataban con solo rozarte. En mi versión son decorado sólido.'],
    ['alex', "Commit: 'suavizar dificultad'."],
  ],
  w1_2: [
    ['alex', 'Encontré por dónde saliste: una pared de 1989 con la colisión rota. Hay decenas como esa.'],
  ],
  w1_2_walls: [
    ['alex', 'Esa pared estaba en mi lista. Línea 212. Mañana.'],
  ],
  w1_3: [
    ['alex', 'El parallax no debería tener colisión. Lo dejé activo para una prueba.'],
    ['alex', 'Nota mental: no dejar nada activo.'],
  ],
  w1_4: [
    ['alex', 'El 1989 corre dentro de mi emulador.'],
    ['alex', 'El parpadeo es un límite de la NES: ocho sprites por línea.'],
    ['alex', 'El emulador es mío. Y los límites, también.'],
  ],
  w1_4_patch: [
    ['alex', 'Parche aplicado. Adiós, parpadeo.'],
  ],
  w1_4_end: [
    ['alex', 'Pasaste igual.'],
    ['alex', 'Da igual. Cada nivel que termino se graba encima del original.'],
    ['alex', 'La selva de 1989 ya está sobrescrita al 60 %.'],
    ['alex', 'Cuando termine, no quedará versión a la que volver. Tampoco para ti.'],
  ],
};
