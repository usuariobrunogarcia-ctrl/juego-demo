#!/bin/bash
# Comprueba que cada fragmento de mapa se puede conseguir y que después se puede
# seguir. Cada línea debe terminar con el fragmento en la lista y sin daños
# (o con "OK" en los saltos entre murciélagos).
DIR="$(cd "$(dirname "$0")" && pwd)"
export NODE_PATH=$(npm root -g)
run() { echo -n "$1: "; node $DIR/bot.js $2 "$3" ${4:-1500} 2>&1 | grep -o "RESULTADO.*\|demasiados daños: [^|]*" | tail -1; }
hops() { echo -n "$1: "; node $DIR/hops.js $2 "$3" | grep -c IMPOSIBLE | sed 's/^0$/OK/;s/^[1-9].*/IMPOSIBLE/'; }

# Prólogo (solo 8 bits)
run "prólogo 23 (subir por el escalón)" 0 '[{"at":8.3,"do":"jump"},{"at":14.6,"do":"jump"},{"at":18.6,"do":"jump"},{"at":20.0,"do":"jump"},{"at":27.8,"do":"jump"}]' 330
run "prólogo 72 (escalera)" 0 '[{"start":66,"mode":"nes"},{"at":68.7,"do":"jump"},{"at":69.7,"do":"jump"},{"at":70.7,"do":"jump"}]' 400
run "prólogo 88 (parpadeo)" 0 '[{"start":82,"mode":"nes"},{"at":86.8,"do":"jump"}]' 400
# 1-1
run "1-1 32 (espinas que parpadean)" 2 '[{"start":27,"mode":"nes"}]' 140
run "1-1 47 (cambiar en el aire)" 2 '[{"start":40,"mode":"nes"},{"at":42.9,"do":"jump"},{"at":46.4,"do":"jump"},{"at":47.3,"do":"switch"},{"at":50.2,"do":"jump"}]' 400
hops "1-1 77 (escalera de murciélagos)" 2 '[{"from":{"ground":62},"to":{"bat":64}},{"from":{"bat":64},"to":{"bat":67}},{"from":{"bat":67},"to":{"bat":70}},{"from":{"bat":70},"to":{"bat":73}},{"from":{"bat":73},"to":{"top":[76,77,5]}}]'
# 1-2
run "1-2 19 (bucear bajo el muro)" 3 '[{"at":5.2,"do":"jump"},{"at":6.3,"do":"jump"},{"at":7.3,"do":"jump"},{"at":21.5,"do":"strokes:8"}]' 800
run "1-2 47 (repisa rota desde abajo)" 3 '[{"start":43,"mode":"nes"},{"at":46.2,"do":"jump"}]' 400
run "1-2 73 (río)" 3 '[{"start":55,"mode":"snes"},{"at":58.6,"do":"jump"},{"at":59.3,"do":"jump"},{"at":60.4,"do":"jump"},{"at":61.4,"do":"jump"},{"at":62.4,"do":"jump"},{"at":72,"do":"strokes:2"},{"at":79.5,"do":"strokes:8"},{"at":94,"do":"switch"}]' 3000
# 1-3
run "1-3 14 (pararse en la rama y saltar)" 4 '[{"at":13,"do":"wait:30"},{"at":13,"do":"jump"},{"at":16.6,"do":"jump"}]' 400
hops "1-3 47 (murciélagos hasta la pasarela)" 4 '[{"from":{"ground":30},"to":{"bat":32}},{"from":{"bat":32},"to":{"bat":35}},{"from":{"bat":35},"to":{"bat":38}},{"from":{"bat":38},"to":{"top":[41,53,5]}}]'
run "1-3 73 (rama y plataformas de 16 bits)" 4 '[{"start":57,"mode":"snes"},{"at":68.0,"do":"jump"},{"at":71.6,"do":"jump"},{"at":75.6,"do":"jump"}]' 3000
# 1-4
run "1-4 12 (parpadeo antes del parche)" 5 '[{"at":8,"do":"switch"},{"at":11,"do":"jump"}]' 250
run "1-4 46 (plataformas alternas)" 5 '[{"start":31,"mode":"nes"},{"at":33.0,"do":"jump"},{"at":35.8,"do":"jump"},{"at":37.0,"do":"switch"},{"at":39.8,"do":"jump"},{"at":41.0,"do":"switch"},{"at":43.8,"do":"jump"},{"at":45.0,"do":"switch"},{"at":47.8,"do":"jump"},{"at":49.0,"do":"switch"},{"at":51.8,"do":"jump"},{"at":53.0,"do":"switch"},{"at":55.8,"do":"jump"}]'
run "1-4 80 (pared rota y buceo)" 5 '[{"start":64,"mode":"snes"},{"at":66.6,"do":"jump"},{"at":67.3,"do":"jump"},{"at":68.4,"do":"jump"},{"at":69.4,"do":"jump"},{"at":70.4,"do":"jump"},{"at":72.2,"do":"switch"},{"at":80.2,"do":"switch"},{"at":85.5,"do":"strokes:8"}]' 3000
