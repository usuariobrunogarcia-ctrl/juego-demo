// Música y efectos sintetizados con Web Audio.
// 8 bits imita los canales de la NES: dos pulsos (onda cuadrada), un triángulo
// para el bajo y ruido para la percusión. 16 bits imita la SNES: instrumentos más
// suaves, acordes de fondo y eco. Los dos arreglos suenan siempre sincronizados y
// el cambio de modo solo alterna cuál se oye, así la música nunca se corta.
// Las canciones están en src/music.js.

TN.midiToHz = (n) => 440 * 2 ** ((n - 69) / 12);

TN.Sound = class {
  constructor() {
    this.ctx = null;
    this.mode = 'nes';
    this.muted = false;
    this.song = null;
    this.step = 0;
    this.intensity = 0;
  }

  // Cambia de canción (empieza desde el principio). La capa de intensidad se apaga.
  playSong(name) {
    this.intensity = 0;
    if (this.song && this.song.name === name) return;
    this.song = name ? TN.MUSIC[name] || TN.MUSIC.selva : null;
    this.step = 0;
  }

  // Capa que entra en momentos clave: charles en semicorcheas y arpegios.
  setIntensity(level) {
    this.intensity = level;
  }

  // Los navegadores solo permiten sonar tras una acción del jugador.
  start() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    this.init(new AudioCtx());
    this.nextTime = this.ctx.currentTime + 0.1;
    this.timer = setInterval(() => this.schedule(), 25);
  }

  // Crea el grafo de audio: buses de cada modo, eco y recursos.
  init(ctx) {
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
    this.pulses = { pulse12: this.makePulseWave(0.125), pulse25: this.makePulseWave(0.25), pulse50: this.makePulseWave(0.5) };
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
  tone(dest, { wave = 'square', freq, endFreq, t, dur, vol = 0.3, attack = 0.005, filter, detune = 0, vibrato = 0 }) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    if (wave === 'pulse') osc.setPeriodicWave(this.pulses.pulse25);
    else if (this.pulses[wave]) osc.setPeriodicWave(this.pulses[wave]);
    else osc.type = wave;
    osc.frequency.setValueAtTime(freq, t);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
    osc.detune.value = detune;
    if (vibrato) {
      // Vibrato que entra poco a poco, como en los samples de la SNES.
      const lfo = ctx.createOscillator();
      const depth = ctx.createGain();
      lfo.frequency.value = 5.5;
      depth.gain.setValueAtTime(0, t);
      depth.gain.linearRampToValueAtTime(vibrato, t + Math.min(dur, 0.4));
      lfo.connect(depth);
      depth.connect(osc.detune);
      lfo.start(t);
      lfo.stop(t + dur + 0.02);
    }
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
    // Si la pestaña estuvo en segundo plano, no intentar recuperar el tiempo perdido.
    if (this.nextTime < ctx.currentTime - 0.2) this.nextTime = ctx.currentTime + 0.05;
    while (this.nextTime < ctx.currentTime + 0.12) {
      const song = this.song;
      const stepDur = 60 / (song ? song.bpm : 120) / 2;
      if (song) {
        this.playStep(song, this.step % song.steps.length, this.nextTime, stepDur);
        this.step = (this.step + 1) % song.steps.length;
      }
      this.nextTime += stepDur;
    }
  }

  playStep(song, index, t, stepDur) {
    const st = song.steps[index];
    const inst = song.inst;
    // Canciones "rotas": algunos pasos (siempre los mismos) desafinan o se cortan.
    const h = ((index + 1) * 2654435761) >>> 0;
    const broken = song.glitch > 0 && (h % 1000) / 1000 < song.glitch;
    const detune = broken ? -60 - (h % 5) * 40 : 0;
    this.playNes(st, inst, t, stepDur, detune, broken);
    this.playSnes(st, inst, t, stepDur, detune, broken);
    if (broken && h % 3 === 0) {
      this.hit(this.buses.nes, { t, dur: 0.06, vol: 0.2 });
      this.hit(this.buses.snes, { t, dur: 0.06, vol: 0.15, type: 'bandpass', freq: 3000 });
    }
  }

  // 8 bits: pulso 1 (melodía), pulso 2 (contramelodía o arpegio), triángulo (bajo y bombo), ruido.
  playNes(st, inst, t, stepDur, detune, broken) {
    const nes = this.buses.nes;
    const len = (n) => n.len * stepDur * 0.92;
    if (st.lead) {
      this.tone(nes, { wave: inst.nesLead || 'pulse25', freq: TN.midiToHz(st.lead.note), t, dur: len(st.lead), vol: 0.26, detune });
    }
    if (st.counter) {
      this.tone(nes, { wave: inst.nesCounter || 'pulse12', freq: TN.midiToHz(st.counter.note), t, dur: len(st.counter), vol: 0.13 });
    } else if (this.intensity > 0) {
      // Arpegio rápido del acorde, el truco de la NES para sonar a acordes.
      const notes = st.chord.notes;
      for (let k = 0; k < 2; k++) {
        const n = notes[(st.beat * 2 + k) % notes.length] + 12;
        this.tone(nes, { wave: 'pulse12', freq: TN.midiToHz(n), t: t + k * stepDur / 2, dur: stepDur * 0.45, vol: 0.09 });
      }
    }
    if (st.bass && !broken) {
      this.tone(nes, { wave: 'triangle', freq: TN.midiToHz(st.bass.note), t, dur: st.bass.len * stepDur * 0.9, vol: 0.45 });
    }
    this.drumNes(st.drum, t);
    if (this.intensity > 0 && st.drum !== 'o') {
      this.hit(nes, { t: t + stepDur / 2, dur: 0.02, vol: 0.09, type: 'highpass', freq: 7000 });
    }
  }

  drumNes(d, t) {
    const nes = this.buses.nes;
    if (d === 'k' || d === 'x') this.tone(nes, { wave: 'triangle', freq: 180, endFreq: 50, t, dur: 0.09, vol: 0.6 });
    if (d === 's') this.hit(nes, { t, dur: 0.1, vol: 0.25 });
    if (d === 'h' || d === 'x') this.hit(nes, { t, dur: 0.025, vol: 0.12, type: 'highpass', freq: 6000 });
    if (d === 'o') this.hit(nes, { t, dur: 0.12, vol: 0.1, type: 'highpass', freq: 5000 });
    if (d === 'r') this.hit(nes, { t, dur: 0.03, vol: 0.18, type: 'bandpass', freq: 2500 });
    if (d === 't') this.tone(nes, { wave: 'triangle', freq: 220, endFreq: 90, t, dur: 0.14, vol: 0.5 });
  }

  // 16 bits: instrumentos con filtro, acordes de fondo, bajo suave, percusión filtrada y eco.
  playSnes(st, inst, t, stepDur, detune, broken) {
    const snes = this.buses.snes;
    for (const out of this.snesOut) {
      if (st.lead) this.instrument(out, inst.snesLead || 'brass', st.lead.note, t, st.lead.len * stepDur, 1, detune);
      if (st.counter) this.instrument(out, inst.snesCounter || 'strings', st.counter.note, t, st.counter.len * stepDur, 0.55, 0);
      if (st.barStart) {
        for (const n of st.chord.notes) {
          this.tone(out, { wave: 'triangle', freq: TN.midiToHz(n), t, dur: stepDur * 8, vol: 0.06, attack: 0.15, filter: inst.padFilter || 1500 });
        }
      }
      if (this.intensity > 0) {
        const n = st.chord.notes[st.beat % st.chord.notes.length] + 12;
        this.instrument(out, 'bell', n, t, stepDur, 0.35, 0);
      }
    }
    if (st.bass && !broken) {
      this.tone(snes, { wave: 'sine', freq: TN.midiToHz(st.bass.note), t, dur: st.bass.len * stepDur * 0.95, vol: 0.5, attack: 0.01 });
      this.tone(snes, { wave: 'triangle', freq: TN.midiToHz(st.bass.note), t, dur: st.bass.len * stepDur * 0.6, vol: 0.12, attack: 0.01, filter: 700 });
    }
    this.drumSnes(st.drum, t);
    if (this.intensity > 0) this.hit(snes, { t: t + stepDur / 2, dur: 0.04, vol: 0.07, type: 'highpass', freq: 9000 });
  }

  drumSnes(d, t) {
    const snes = this.buses.snes;
    if (d === 'k' || d === 'x') this.tone(snes, { wave: 'sine', freq: 140, endFreq: 40, t, dur: 0.18, vol: 0.7 });
    if (d === 's') {
      this.hit(snes, { t, dur: 0.16, vol: 0.28, type: 'bandpass', freq: 1800 });
      this.hit(this.reverb, { t, dur: 0.16, vol: 0.2, type: 'bandpass', freq: 1800 });
    }
    if (d === 'h' || d === 'x') this.hit(snes, { t, dur: 0.05, vol: 0.08, type: 'highpass', freq: 8000 });
    if (d === 'o') this.hit(snes, { t, dur: 0.2, vol: 0.07, type: 'highpass', freq: 7000 });
    if (d === 'r') this.hit(snes, { t, dur: 0.04, vol: 0.2, type: 'bandpass', freq: 3200 });
    if (d === 't') {
      this.tone(snes, { wave: 'sine', freq: 200, endFreq: 80, t, dur: 0.22, vol: 0.55 });
      this.tone(this.reverb, { wave: 'sine', freq: 200, endFreq: 80, t, dur: 0.22, vol: 0.3 });
    }
  }

  // Instrumentos de 16 bits (imitan samples de la SNES).
  instrument(out, name, note, t, dur, gain, detune) {
    const freq = TN.midiToHz(note);
    if (name === 'brass') {
      this.tone(out, { wave: 'sawtooth', freq, t, dur: dur * 1.1, vol: 0.14 * gain, attack: 0.02, filter: 2600, detune });
      this.tone(out, { wave: 'square', freq, t, dur: dur * 1.1, vol: 0.06 * gain, attack: 0.02, filter: 1800, detune: detune + 8 });
    } else if (name === 'strings') {
      this.tone(out, { wave: 'sawtooth', freq, t, dur: dur * 1.2, vol: 0.08 * gain, attack: 0.12, filter: 1400, detune: detune - 6, vibrato: 10 });
      this.tone(out, { wave: 'sawtooth', freq, t, dur: dur * 1.2, vol: 0.08 * gain, attack: 0.12, filter: 1400, detune: detune + 6 });
    } else if (name === 'flute') {
      this.tone(out, { wave: 'sine', freq, t, dur: dur * 1.1, vol: 0.22 * gain, attack: 0.05, detune, vibrato: 18 });
      this.tone(out, { wave: 'triangle', freq, t, dur: dur * 1.1, vol: 0.08 * gain, attack: 0.05, filter: 2000, detune });
    } else if (name === 'bell') {
      this.tone(out, { wave: 'sine', freq, t, dur: Math.max(dur, 0.5), vol: 0.18 * gain, attack: 0.003, detune });
      this.tone(out, { wave: 'sine', freq: freq * 3, t, dur: 0.25, vol: 0.05 * gain, attack: 0.003, detune });
    } else if (name === 'organ') {
      this.tone(out, { wave: 'square', freq, t, dur: dur * 0.95, vol: 0.07 * gain, attack: 0.01, filter: 1200, detune });
      this.tone(out, { wave: 'sine', freq: freq * 2, t, dur: dur * 0.95, vol: 0.08 * gain, attack: 0.01, detune });
    }
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
      case 'patch':
        seq([96, 91, 84, 79, 72], 0.05, 0.12);
        break;
      case 'blip':
        for (const out of outs) this.tone(out, { wave: nes ? 'pulse' : 'sine', freq: nes ? 880 : 660, t, dur: 0.03, vol: nes ? 0.08 : 0.12 });
        break;
      case 'win':
        seq([72, 76, 79, 84, 79, 84], 0.11, 0.25);
        break;
    }
  }
};
