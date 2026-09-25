// Jugador automático: simula fotograma a fotograma.
// uso: node bot.js <levelIndex> '<plan JSON>'  plan: [{at: col, do: 'jump'|'switch'|'hold:run'|'release:run'|'wait:N'}]
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const PAGE = 'file://' + path.resolve(__dirname, '../../index.html');
const CHROMIUM = fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined;
(async () => {
  const [idx, planJson, maxFrames = '6000'] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: CHROMIUM });
  const p = await b.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(PAGE); await p.waitForTimeout(200);
  const res = await p.evaluate(([idx, plan, maxFrames]) => {
    game.start = () => {}; // sin bucle real
    game.loadLevel(+idx); game.state = 'play';
    if (plan[0] && plan[0].start !== undefined) {
      game.level.def.dialogs.forEach((d) => { if (!d.event) game.dialogsSeen.add(d.id); });
      const st = plan.shift();
      Object.assign(game.player, { x: st.start * 16 + 2, y: (st.row || 11) * 16 + 2 });
      if (st.mode) game.mode = st.mode;
      game.checkpoint = { x: st.start, y: st.row || 11 };
      game.updateCamera();
    }
    const inp = game.input; inp.held.clear();
    inp.held.add('right');
    const log = [];
    let hurts = 0; let i = 0; const oldHurt = game.hurt.bind(game);
    game.hurt = () => { hurts++; log.push('daño en col ' + (game.player.x / 16).toFixed(1)); oldHurt(); const c = game.player.x / 16; i = plan.findIndex((q) => q.at > c); if (i < 0) i = plan.length; if (hurts > 6) throw new Error('demasiados daños: ' + log.slice(-8).join(' | ')); };
    let wait = 0; let strokes = 0;
    for (let f = 0; f < maxFrames; f++) {
      if (game.state === 'dialog') { inp.pressed.add('confirm'); game.update(); inp.endStep(); continue; }
      if (game.state !== 'play') { log.push('estado ' + game.state + ' en f' + f); break; }
      const col = game.player.x / 16;
      if (wait > 0) wait--;
      while (i < plan.length && col >= plan[i].at && wait === 0) {
        const a = plan[i].do;
        if (a === 'jump' && !game.player.onGround && !(game.player.coyote > 0 && game.player.vy >= 0) && col < plan[i].at + 1.5) break;
        if (a === 'jump') { inp.pressed.add('jump'); inp.held.add('jump'); }
        else if (a === 'switch') inp.pressed.add('switch');
        else if (a.startsWith('strokes:')) strokes = +a.slice(8);
        else if (a.startsWith('hold:')) inp.held.add(a.slice(5));
        else if (a.startsWith('release:')) inp.held.delete(a.slice(8));
        else if (a.startsWith('wait:')) { wait = +a.slice(5); inp.held.delete('right'); plan[i].resume = true; }
        log.push(`f${f} col ${col.toFixed(1)} ${game.mode} suelo=${game.player.onGround}: ${a}`);
        i++;
      }
      if (wait === 1) inp.held.add('right');
      if (strokes > 0 && f % 12 === 0) { inp.pressed.add('jump'); inp.held.add('jump'); strokes--; }
      game.update(); inp.endStep();
      if (!inp.pressed.has('jump') && game.player.vy >= 0 && strokes === 0) inp.held.delete('jump');
    }
    return { log, hurts, col: (game.player.x / 16).toFixed(1), state: game.state, map: game.mapCount, pieces: game.mapPieces.filter((m) => m.collected).map((m) => m.x / 16), mode: game.mode };
  }, [idx, JSON.parse(planJson), +maxFrames]);
  console.log(res.log.join('\n'));
  console.log('RESULTADO', res.state, 'col', res.col, 'daños', res.hurts, 'mapa', res.map, JSON.stringify(res.pieces), 'modo', res.mode);
  if (errs.length) console.log('errors', errs);
  await b.close();
})();
