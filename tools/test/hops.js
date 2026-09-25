// Comprueba que cada salto de una cadena de plataformas móviles sea posible.
// uso: node hops.js <levelIndex> '<json: [{from:{bat:i}|{ground:col}, to:{bat:j}|{top:[c0,c1,row]}}]>'
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const PAGE = 'file://' + path.resolve(__dirname, '../../index.html');
const CHROMIUM = fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined;
(async () => {
  const [idx, hopsJson] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: CHROMIUM });
  const p = await b.newPage();
  await p.goto(PAGE); await p.waitForTimeout(200);
  const res = await p.evaluate(([idx, hops]) => {
    const out = [];
    const inp = game.input;
    for (const hop of hops) {
      let ok = 0, tries = 0, example = null;
      for (let phase = 0; phase < 240; phase += 8) {
        for (const dir of ['right', 'left', 'none']) {
          for (const hold of [8, 16, 24, 40]) {
            tries++;
            game.loadLevel(+idx); game.state = 'play'; game.mode = 'snes';
            game.level.def.dialogs.forEach((d) => game.dialogsSeen.add(d.id));
            for (let k = 0; k < phase; k++) game.bats.forEach((bt) => bt.update());
            const pl = game.player; inp.held.clear(); inp.pressed.clear();
            if (hop.from.bat !== undefined) {
              const bt = game.bats.find((q) => q.baseX / 16 === hop.from.bat);
              Object.assign(pl, { x: bt.x + 2, y: bt.top - 14, vx: 0, vy: 0, onGround: true });
              game.riding = bt;
            } else {
              Object.assign(pl, { x: hop.from.ground * 16 + 2, y: 11 * 16 + 2, vx: 0, vy: 0, onGround: true });
            }
            game.updateCamera();
            let success = false;
            for (let f = 0; f < 150 && game.state === 'play'; f++) {
              if (f === 1) { inp.pressed.add('jump'); inp.held.add('jump'); if (dir !== 'none') inp.held.add(dir); }
              if (f === hold) inp.held.delete(dir);
              if (f === 20) inp.held.delete('jump');
              game.update(); inp.endStep();
              if (f > 3 && pl.onGround) {
                if (hop.to.bat !== undefined && game.riding === game.bats.find((q) => q.baseX / 16 === hop.to.bat)) success = true;
                if (hop.to.top) { const c = (pl.x + 6) / 16; if (c >= hop.to.top[0] && c < hop.to.top[1] + 1 && Math.abs(pl.y + 14 - hop.to.top[2] * 16) < 1) success = true; }
                if (f > 10) break;
              }
            }
            if (success) { ok++; if (!example) example = { phase, dir, hold }; }
          }
        }
      }
      out.push(`${JSON.stringify(hop)} -> ${ok}/${tries} ${example ? JSON.stringify(example) : 'IMPOSIBLE'}`);
    }
    return out.join('\n');
  }, [idx, JSON.parse(hopsJson)]);
  console.log(res);
  await b.close();
})();
