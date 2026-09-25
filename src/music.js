// Canciones por patrones, como en los trackers de la época.
//
// Una canción tiene patrones de uno o más compases (8 corcheas por compás) y una
// lista de orden, por ejemplo 'I A A2 B'. Cada patrón tiene:
//   chords   un acorde por compás ('Am F C G7'); de él salen el bajo, los acordes
//            de fondo (16 bits) y los arpegios de la capa de intensidad
//   lead     melodía
//   counter  contramelodía (segundo pulso en 8 bits, cuerdas o campanas en 16 bits)
//   feel     estilo de bajo y batería, definido en la canción ('main' por defecto)
//   drums, bass  (opcionales) sustituyen a los del estilo solo en este patrón
//
// Notas: 'E5', 'C#4', 'Bb3'; '.' silencio; '-' alarga la nota anterior. La barra
// '|' separa compases y se ignora.
// Batería, un carácter por corchea: k bombo, s caja, h charles, x bombo y charles,
//   o charles abierto, t tom, r aro, '.' nada.
// Bajo, un carácter por corchea: 1 raíz, 3 tercera, 5 quinta, 7 séptima, 8 raíz una
//   octava arriba, '-' alarga, '.' nada.
// Si un estilo tiene 16 caracteres, ocupa dos compases.

TN.NOTE_NAMES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

TN.parseNote = function (token) {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(token);
  if (!m) throw new Error(`Nota no válida: ${token}`);
  const acc = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
  return 12 * (+m[3] + 1) + TN.NOTE_NAMES[m[1]] + acc;
};

// 'Am' → { root: 57, notes: [57, 60, 64], bass: 45 }
TN.parseChord = function (name) {
  const m = /^([A-G])([#b]?)(m?)(7?)$/.exec(name);
  if (!m) throw new Error(`Acorde no válido: ${name}`);
  const pc = (TN.NOTE_NAMES[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + 12) % 12;
  const minor = m[3] === 'm';
  const intervals = { 1: 0, 3: minor ? 3 : 4, 5: 7, 7: m[4] ? 10 : minor ? 10 : 11, 8: 12 };
  let root = 48 + pc;
  if (root < 55) root += 12;
  let bass = 36 + pc;
  if (bass < 40) bass += 12;
  const notes = [root, root + intervals[3], root + intervals[5]];
  if (m[4]) notes.push(root + 10);
  return { name, notes, bass, intervals };
};

// Convierte una línea de notas en una lista de pasos: {note, len} donde empieza
// una nota y null en el resto.
TN.parseLine = function (text, length, transpose, where) {
  const steps = new Array(length).fill(null);
  if (!text) return steps;
  const tokens = text.replace(/\|/g, ' ').trim().split(/\s+/);
  if (tokens.length !== length) throw new Error(`${where}: ${tokens.length} pasos en vez de ${length}`);
  let last = null;
  tokens.forEach((tok, i) => {
    if (tok === '-') {
      if (last) last.len++;
    } else if (tok === '.') {
      last = null;
    } else {
      last = { note: TN.parseNote(tok) + transpose, len: 1 };
      steps[i] = last;
    }
  });
  return steps;
};

// Aplana la canción en una lista de pasos listos para sonar.
TN.compileSong = function (name, song) {
  const steps = [];
  const clean = (s) => (s || '').replace(/[|\s]/g, '');
  for (const id of song.order.trim().split(/\s+/)) {
    const p = song.patterns[id];
    if (!p) throw new Error(`${name}: falta el patrón ${id}`);
    const chords = p.chords.trim().split(/\s+/).map(TN.parseChord);
    const length = chords.length * 8;
    const where = `${name}/${id}`;
    const lead = TN.parseLine(p.lead, length, song.transpose || 0, `${where} lead`);
    const counter = TN.parseLine(p.counter, length, song.transpose || 0, `${where} counter`);
    const feel = song.feels[p.feel || 'main'];
    if (!feel) throw new Error(`${where}: falta el estilo ${p.feel}`);
    const drums = clean(p.drums || feel.drums);
    const bass = clean(p.bass || feel.bass);
    for (let i = 0; i < length; i++) {
      const chord = chords[Math.floor(i / 8)];
      // Duración de la nota del bajo: los '-' que la siguen.
      const b = bass[i % bass.length];
      let bassNote = null;
      if (b >= '1' && b <= '8') {
        let len = 1;
        while (bass[(i + len) % bass.length] === '-' && len < 8) len++;
        bassNote = { note: chord.bass + (chord.intervals[b] || 0), len };
      }
      steps.push({
        lead: lead[i], counter: counter[i], chord, bass: bassNote,
        drum: drums[i % drums.length], barStart: i % 8 === 0, beat: i % 8,
      });
    }
  }
  return { name, bpm: song.bpm, inst: song.inst || {}, glitch: song.glitch || 0, steps };
};

// ---------------------------------------------------------------------------
// Tema principal: la selva (prólogo y 1-1). La menor, unos 64 segundos.
// ---------------------------------------------------------------------------

TN.SONGS = {};

TN.SONGS.selva = {
  bpm: 132,
  inst: { nesLead: 'pulse25', nesCounter: 'pulse12', snesLead: 'brass', snesCounter: 'strings' },
  feels: {
    intro: { drums: 'k.h.k.h.', bass: '1...1...' },
    main: { drums: 'xhshxxsh', bass: '18181818' },
    big: { drums: 'xhshxhso', bass: '18581858' },
    soft: { drums: 'k.h.r.h.', bass: '1-.-5-.-' },
  },
  patterns: {
    I: {
      chords: 'Am G', feel: 'intro',
      lead: '. . . . . . . . | . . . . . B4 C5 D5',
    },
    A: {
      chords: 'Am F C G',
      lead: 'E5 - D5 E5 C5 - A4 - | C5 - D5 E5 F5 - E5 D5 | C5 - B4 C5 G4 - C5 - | D5 - E5 D5 B4 - G4 -',
    },
    A2: {
      chords: 'Am F C E',
      lead: 'E5 - D5 E5 C5 - A4 - | C5 - D5 E5 F5 - A5 - | G5 - E5 C5 D5 - E5 - | D5 - B4 - G#4 - B4 -',
      counter: 'C5 - - - - - - - | A4 - - - - - - - | E4 - - - G4 - - - | E4 - - - - - - -',
    },
    B: {
      chords: 'F G Em Am', feel: 'big',
      lead: 'A5 - - G5 F5 - E5 - | D5 - - E5 G5 - - - | E5 - - D5 B4 - G4 - | A4 - - - C5 - E5 -',
      counter: 'F4 - - - A4 - - - | G4 - - - B4 - - - | G4 - - - - - - - | E4 - - - A4 - - -',
    },
    B2: {
      chords: 'Dm G C E7', feel: 'big',
      lead: 'F5 - E5 D5 A4 - D5 - | B4 - C5 D5 G5 - F5 E5 | E5 - - D5 C5 - G4 - | G#4 - B4 - E5 - D5 -',
      counter: 'A4 - - - F4 - - - | G4 - - - B4 - - - | G4 - - - E4 - - - | E4 - - - G#4 - - -',
    },
    C: {
      chords: 'F C G Am', feel: 'soft',
      lead: 'A4 - - - - - C5 - | G4 - - - - - E4 - | D4 - G4 - B4 - D5 - | C5 - B4 - A4 - E4 -',
      counter: 'C5 - - - - - - - | E4 - - - - - - - | B4 - - - - - - - | E5 - - - - - - -',
    },
    F: {
      chords: 'E', feel: 'main', drums: 'k.s.ttss', bass: '1.1.5.8.',
      lead: 'E4 - - - . B4 C5 D5',
    },
  },
  order: 'I A A2 B B2 C F A A2 B2',
};

TN.compileSongs = function () {
  TN.MUSIC = {};
  for (const [name, song] of Object.entries(TN.SONGS)) TN.MUSIC[name] = TN.compileSong(name, song);
};
TN.compileSongs();
