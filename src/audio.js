// Música y efectos sintetizados con Web Audio.
// 8 bits imita los canales de la NES: dos pulsos (onda cuadrada), un triángulo
// para el bajo y ruido para la percusión. 16 bits imita la SNES: instrumentos más
// suaves, acordes de fondo y eco. Los dos arreglos suenan siempre sincronizados y
// el cambio de modo solo alterna cuál se oye, así la música nunca se corta.

TN.SONG = {
  bpm: 132,
  // Melodía en corcheas (número MIDI o null = silencio). La menor: Am F C G.
  melody: [
    76, null, 74, 76, 72, null, 69, null,
    72, null, 74, 76, 77, null, 76, 74,
    72, null, 71, 72, 67, null, 72, null,
    74, null, 76, 74, 71, null, 67, null,
  ],
  roots: [45, 41, 48, 43],
  chords: [[57, 60, 64], [53, 57, 60], [55, 60, 64], [55, 59, 62]],
};

TN.midiToHz = (n) => 440 * 2 ** ((n - 69) / 12);

TN.Sound = class {
  constructor() {
    this.ctx = null;
    this.mode = 'nes';
    this.muted = false;
    this.musicOn = true;
  }

  setMusic(on) {
    this.musicOn = on;
  }

  // Los navegadores solo permiten sonar tras una acción del jugador.
  start() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    this.ctx = ctx;

    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.22;
    this.master.connect(ctx.destination);

    this.buses = {};
    for (const mode of TN.MODES) {
      this.buses[mode] = ctx.createGain();
      this.buses[mode].gain.value = mode === this.mode ? 1 : 0;
      this.buses[mode].connect(this.master);
    }
    // Eco de la SNES.
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = this.makeImpulse(1.6);
    const wet = ctx.createGain();
    wet.gain.value = 0.35;
    this.reverb.connect(wet);
    wet.connect(this.buses.snes);

    this.noise = this.makeNoise();
    this.pulse = this.makePulseWave(0.25);

    this.step = 0;
    this.nextTime = ctx.currentTime + 0.1;
    this.timer = setInterval(() => this.schedule(), 25);
  }

  setMode(mode) {
    this.mode = mode;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    for (const m of TN.MODES) this.buses[m].gain.setTargetAtTime(m === mode ? 1 : 0, t, 0.01);
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.ctx) this.master.gain.setTargetAtTime(this.muted ? 0 : 0.22, this.ctx.currentTime, 0.02);
  }

  // ---------- Recursos ----------

  makeNoise() {
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  makeImpulse(seconds) {
    const rate = this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(2, rate * seconds, rate);
    for (let c = 0; c < 2; c++) {
      const data = buffer.getChannelData(c);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 3;
    }
    return buffer;
  }

  // Onda de pulso con ciclo de trabajo variable, como los canales de la NES.
  makePulseWave(duty) {
    const n = 32;
    const real = new Float32Array(n);
    const imag = new Float32Array(n);
    for (let k = 1; k < n; k++) real[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty);
    return this.ctx.createPeriodicWave(real, imag);
  }

  // ---------- Instrumentos ----------

  // Nota genérica: oscilador → (filtro) → envolvente → destino.
  tone(dest, { wave = 'square', freq, endFreq, t, dur, vol = 0.3, attack = 0.005, filter, detune = 0 }) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    if (wave === 'pulse') osc.setPeriodicWave(this.pulse);
    else osc.type = wave;
    osc.frequency.setValueAtTime(freq, t);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
    osc.detune.value = detune;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(vol, t + attack);
    env.gain.exponentialRampToValueAtTime(0.001, t + dur);
    let node = osc;
    if (filter) {
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = filter;
      osc.connect(f);
      node = f;
    }
    node.connect(env);
    env.connect(dest);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  hit(dest, { t, dur, vol, type, freq }) {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const env = ctx.createGain();
    env.gain.setValueAtTime(vol, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + dur);
    let node = src;
    if (type) {
      const f = ctx.createBiquadFilter();
      f.type = type;
      f.frequency.value = freq;
      src.connect(f);
      node = f;
    }
    node.connect(env);
    env.connect(dest);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.02);
  }

  // Envía una voz de 16 bits al bus seco y al eco a la vez.
  get snesOut() {
    return [this.buses.snes, this.reverb];
  }

  // ---------- Secuenciador ----------

  schedule() {
    const ctx = this.ctx;
    const stepDur = 60 / TN.SONG.bpm / 2;
    // Si la pestaña estuvo en segundo plano, no intentar recuperar el tiempo perdido.
    if (this.nextTime < ctx.currentTime - 0.2) this.nextTime = ctx.currentTime + 0.05;
    while (this.nextTime < ctx.currentTime + 0.12) {
      if (this.musicOn) this.playStep(this.step, this.nextTime, stepDur);
      this.nextTime += stepDur;
      this.step = (this.step + 1) % TN.SONG.melody.length;
    }
  }

  playStep(step, t, stepDur) {
    const song = TN.SONG;
    const bar = Math.floor(step / 8);
    const beat = step % 8;
    const note = song.melody[step];
    const root = song.roots[bar];
    const nes = this.buses.nes;

    // --- 8 bits ---
    if (note) this.tone(nes, { wave: 'pulse', freq: TN.midiToHz(note), t, dur: stepDur * 1.6, vol: 0.28 });
    this.tone(nes, { wave: 'triangle', freq: TN.midiToHz(root + (beat % 2 ? 12 : 0)), t, dur: stepDur * 0.9, vol: 0.45 });
    if (beat === 0 || beat === 4) this.tone(nes, { wave: 'triangle', freq: 180, endFreq: 50, t, dur: 0.09, vol: 0.6 });
    if (beat === 2 || beat === 6) this.hit(nes, { t, dur: 0.1, vol: 0.25 });
    else this.hit(nes, { t, dur: 0.025, vol: 0.12, type: 'highpass', freq: 6000 });

    // --- 16 bits ---
    for (const out of this.snesOut) {
      if (note) {
        this.tone(out, { wave: 'sawtooth', freq: TN.midiToHz(note), t, dur: stepDur * 2, vol: 0.14, attack: 0.02, filter: 2600 });
        this.tone(out, { wave: 'square', freq: TN.midiToHz(note), t, dur: stepDur * 2, vol: 0.06, attack: 0.02, filter: 1800, detune: 8 });
      }
      if (beat === 0) {
        for (const c of song.chords[bar]) {
          this.tone(out, { wave: 'triangle', freq: TN.midiToHz(c), t, dur: stepDur * 8, vol: 0.07, attack: 0.15, filter: 1500 });
        }
      }
    }
    const snes = this.buses.snes;
    if (beat % 2 === 0) this.tone(snes, { wave: 'sine', freq: TN.midiToHz(root), t, dur: stepDur * 1.8, vol: 0.5, attack: 0.01 });
    if (beat === 0 || beat === 4) this.tone(snes, { wave: 'sine', freq: 140, endFreq: 40, t, dur: 0.18, vol: 0.7 });
    if (beat === 2 || beat === 6) {
      this.hit(snes, { t, dur: 0.16, vol: 0.28, type: 'bandpass', freq: 1800 });
      this.hit(this.reverb, { t, dur: 0.16, vol: 0.2, type: 'bandpass', freq: 1800 });
    }
    this.hit(snes, { t, dur: 0.05, vol: 0.08, type: 'highpass', freq: 8000 });
  }

  // ---------- Efectos ----------

  sfx(name) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + 0.005;
    const nes = this.mode === 'nes';
    const outs = nes ? [this.buses.nes] : this.snesOut;
    const wave = nes ? 'pulse' : 'triangle';
    const vol = nes ? 0.25 : 0.4;
    const seq = (notes, gap, dur) => notes.forEach((n, i) => {
      for (const out of outs) this.tone(out, { wave, freq: TN.midiToHz(n), t: t + i * gap, dur, vol });
    });

    switch (name) {
      case 'jump':
        for (const out of outs) this.tone(out, { wave, freq: 330, endFreq: 780, t, dur: 0.14, vol });
        break;
      case 'stroke':
        for (const out of outs) this.tone(out, { wave: 'sine', freq: 260, endFreq: 520, t, dur: 0.12, vol: 0.3 });
        break;
      case 'switch':
        // Suena con el timbre del modo al que se llega.
        seq(nes ? [84, 79, 72] : [72, 79, 84], 0.04, 0.08);
        break;
      case 'error':
        for (const out of outs) {
          this.tone(out, { wave: 'square', freq: 110, t, dur: 0.07, vol: 0.2 });
          this.tone(out, { wave: 'square', freq: 104, t: t + 0.09, dur: 0.1, vol: 0.2 });
        }
        break;
      case 'hurt':
        for (const out of outs) this.tone(out, { wave: nes ? 'square' : 'sawtooth', freq: 620, endFreq: 90, t, dur: 0.35, vol: 0.2, filter: nes ? null : 2000 });
        break;
      case 'collect':
        seq([84, 88, 91, 96], 0.06, 0.12);
        break;
      case 'checkpoint':
        seq([79, 84], 0.08, 0.12);
        break;
      case 'crash': {
        // Ruido de cartucho mal conectado: ruido y un tono que se hunde.
        this.hit(this.buses[this.mode], { t, dur: 0.4, vol: 0.4 });
        this.tone(this.buses[this.mode], { wave: 'square', freq: 200 + Math.random() * 600, endFreq: 40, t, dur: 0.35, vol: 0.2 });
        break;
      }
      case 'blip':
        for (const out of outs) this.tone(out, { wave: nes ? 'pulse' : 'sine', freq: nes ? 880 : 660, t, dur: 0.03, vol: nes ? 0.08 : 0.12 });
        break;
      case 'win':
        seq([72, 76, 79, 84, 79, 84], 0.11, 0.25);
        break;
    }
  }
};
