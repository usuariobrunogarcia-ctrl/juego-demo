// Teclado. Traduce teclas físicas a acciones del juego.
TN.KEYMAP = {
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  ArrowUp: 'jump',
  KeyW: 'jump',
  KeyZ: 'jump',
  Space: 'jump',
};

TN.Input = class {
  constructor() {
    this.held = new Set();
    this.pressed = new Set();

    addEventListener('keydown', (e) => {
      const action = TN.KEYMAP[e.code];
      if (!action) return;
      e.preventDefault();
      if (!e.repeat) this.pressed.add(action);
      this.held.add(action);
    });
    addEventListener('keyup', (e) => {
      const action = TN.KEYMAP[e.code];
      if (action) this.held.delete(action);
    });
    addEventListener('blur', () => this.held.clear());
  }

  isDown(action) {
    return this.held.has(action);
  }

  // Verdadero solo en el primer paso de simulación tras pulsar la tecla.
  wasPressed(action) {
    return this.pressed.has(action);
  }

  endStep() {
    this.pressed.clear();
  }
};
