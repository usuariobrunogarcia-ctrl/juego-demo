// Prueba rápida: carga, título, tarjeta, juego, captura. uso: node smoke.js out.png [js a evaluar antes de la captura]
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const PAGE = 'file://' + path.resolve(__dirname, '../../index.html');
const CHROMIUM = fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined;
(async () => {
  const [out, js] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: CHROMIUM });
  const p = await b.newPage({ viewport: { width: 800, height: 600 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(PAGE); await p.waitForTimeout(300);
  if (js) { await p.evaluate(js); await p.waitForTimeout(300); }
  await p.screenshot({ path: out });
  console.log('canvas css', await p.evaluate(() => [canvas.style.width, canvas.style.height, game.state]));
  console.log('errors', errs);
  await b.close();
})();
