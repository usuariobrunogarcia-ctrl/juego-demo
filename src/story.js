// Guion: personajes y diálogos. Alex nunca da tutoriales, solo habla de la historia.

TN.SPEAKERS = {
  alex: { name: 'Alex', portrait: 'alex' },
  unknown: { name: '???', portrait: 'alex' },
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
  selva_intro: [
    ['alex', 'Registro de pruebas, día 212. Sigo sola en el estudio.'],
    ['alex', 'Si nadie termina este remaster, Terra Nova desaparece para siempre.'],
  ],
};
