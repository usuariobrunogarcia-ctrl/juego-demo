// Teclado. Traduce teclas físicas a acciones del juego.
TN.KEYMAP = {
  ArrowLeft: ['left'],
  KeyA: ['left'],
  ArrowRight: ['right'],
  KeyD: ['right'],
  ArrowUp: ['jump', 'up'],
  KeyW: ['jump', 'up'],
  ArrowDown: ['down'],
  KeyS: ['down'],
  KeyZ: ['jump', 'confirm'],
  Space: ['jump', 'confirm'],
  Enter: ['confirm'],
  KeyX: ['switch'],
  KeyK: ['switch'],
  ShiftLeft: ['run'],
  ShiftRight: ['run'],
  KeyC: ['run'],
  KeyM: ['mute'],
};

TN.Input = class {
  constructor() {
    this.held = new Set();
    this.pressed = new Set();

    addEventListener('keydown', (e) => {
      const actions = TN.KEYMAP[e.code];
      if (!actions) return;
      e.preventDefault();
      for (const action of actions) {
        if (!e.repeat) this.pressed.add(action);
        this.held.add(action);
      }
    });
    addEventListener('keyup', (e) => {
      const actions = TN.KEYMAP[e.code];
      if (actions) actions.forEach((action) => this.held.delete(action));
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
