// Progreso guardado en el navegador. Si el almacenamiento no está disponible
// (modo privado, bloqueado...), el juego funciona igual pero no recuerda nada.
TN.SAVE_KEY = 'terra-nova-dx';

TN.Save = class {
  constructor() {
    this.data = { unlocked: 0, pieces: {}, learned: [] };
    try {
      const raw = localStorage.getItem(TN.SAVE_KEY);
      if (raw) Object.assign(this.data, JSON.parse(raw));
    } catch (e) {
      // Sin guardado.
    }
  }

  write() {
    try {
      localStorage.setItem(TN.SAVE_KEY, JSON.stringify(this.data));
    } catch (e) {
      // Sin guardado.
    }
  }

  get hasProgress() {
    return this.data.unlocked > 0;
  }

  unlock(index) {
    this.data.unlocked = Math.max(this.data.unlocked, index);
    this.write();
  }

  // Guarda qué fragmentos de un nivel se han encontrado alguna vez.
  addPieces(levelId, indices) {
    const known = new Set(this.data.pieces[levelId] || []);
    indices.forEach((i) => known.add(i));
    this.data.pieces[levelId] = [...known];
    this.write();
  }

  hasLearned(action) {
    return this.data.learned.includes(action);
  }

  learn(action) {
    if (this.hasLearned(action)) return;
    this.data.learned.push(action);
    this.write();
  }

  reset() {
    this.data = { unlocked: 0, pieces: {}, learned: [] };
    this.write();
  }
};
