// Renderiza canciones sin tiempo real (OfflineAudioContext) y da su duración,
// el pico y el volumen medio de cada arreglo. Opcionalmente guarda un WAV.
// uso: node music.js [canción] [modo nes|snes] [segundos] [salida.wav] [intensidad 0|1]
// Sin argumentos, revisa todas las canciones en los dos modos (20 s de cada una).
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const PAGE = 'file://' + path.resolve(__dirname, '../../index.html');
const CHROMIUM = fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined;
(async () => {
  const [only, onlyMode, secs = '20', wav, intensity = '0'] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: CHROMIUM });
  const p = await b.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(PAGE); await p.waitForTimeout(200);
  const res = await p.evaluate(async ([only, onlyMode, secs, wantWav, intensity]) => {
    const out = [];
    let wavData = null;
    const names = only ? [only] : Object.keys(TN.MUSIC);
    for (const name of names) {
      for (const mode of onlyMode ? [onlyMode] : TN.MODES) {
        const song = TN.MUSIC[name];
        const rate = 22050;
        const ctx = new OfflineAudioContext(2, rate * secs, rate);
        const s = new TN.Sound();
        s.mode = mode;
        s.init(ctx);
        s.playSong(name);
        s.setIntensity(intensity);
        const stepDur = 60 / song.bpm / 2;
        for (let i = 0, t = 0.05; t < secs - 0.5; i++, t += stepDur) s.playStep(song, i % song.steps.length, t, stepDur);
        const buf = await ctx.startRendering();
        const data = buf.getChannelData(0);
        let peak = 0, sum = 0;
        for (const v of data) { peak = Math.max(peak, Math.abs(v)); sum += v * v; }
        const loop = song.steps.length * stepDur;
        out.push(`${name} ${mode}: bucle ${loop.toFixed(1)} s, ${song.bpm} bpm, pico ${peak.toFixed(2)}, rms ${Math.sqrt(sum / data.length).toFixed(3)}`);
        if (wantWav) {
          // WAV de 16 bits mono.
          const bytes = new DataView(new ArrayBuffer(44 + data.length * 2));
          const str = (o, t) => [...t].forEach((c, i) => bytes.setUint8(o + i, c.charCodeAt(0)));
          str(0, 'RIFF'); bytes.setUint32(4, 36 + data.length * 2, true); str(8, 'WAVEfmt ');
          bytes.setUint32(16, 16, true); bytes.setUint16(20, 1, true); bytes.setUint16(22, 1, true);
          bytes.setUint32(24, rate, true); bytes.setUint32(28, rate * 2, true); bytes.setUint16(32, 2, true);
          bytes.setUint16(34, 16, true); str(36, 'data'); bytes.setUint32(40, data.length * 2, true);
          data.forEach((v, i) => bytes.setInt16(44 + i * 2, Math.max(-1, Math.min(1, v)) * 32767, true));
          wavData = Array.from(new Uint8Array(bytes.buffer));
        }
      }
    }
    return { out, wavData };
  }, [only, onlyMode, +secs, !!wav, +intensity]);
  console.log(res.out.join('\n'));
  if (wav && res.wavData) fs.writeFileSync(wav, Buffer.from(res.wavData));
  if (errs.length) console.log('errores', errs);
  await b.close();
})();
