#!/bin/bash
# Recorridos automáticos de todos los niveles.
DIR="$(cd "$(dirname "$0")" && pwd)"
B="node $DIR/bot.js"
run() { echo -n "$1: "; NODE_PATH=$(npm root -g) $B $2 "$3" ${4:-3000} 2>&1 | grep -o "RESULTADO.*\|demasiados daños: [^|]*|[^|]*|[^|]*" | tail -1; }
run "prólogo" 0 '[{"at":8.3,"do":"jump"},{"at":14.6,"do":"jump"},{"at":18.6,"do":"jump"},{"at":20.0,"do":"jump"},{"at":27.8,"do":"jump"},{"at":43.6,"do":"jump"},{"at":58.6,"do":"jump"},{"at":68.7,"do":"jump"},{"at":69.7,"do":"jump"},{"at":70.7,"do":"jump"}]'
run "tutorial" 1 '[{"at":7,"do":"hold:run"},{"at":9.6,"do":"jump"},{"at":17,"do":"release:run"},{"at":26.5,"do":"switch"},{"at":34.5,"do":"switch"},{"at":52.2,"do":"switch"},{"at":62,"do":"switch"},{"at":63.9,"do":"jump"},{"at":67.45,"do":"jump"},{"at":68.2,"do":"switch"},{"at":71.3,"do":"jump"}]'
run "1-1 a" 2 '[{"at":10,"do":"switch"},{"at":15,"do":"switch"},{"at":27,"do":"switch"},{"at":42.9,"do":"jump"},{"at":46.4,"do":"jump"},{"at":47.3,"do":"switch"},{"at":50.2,"do":"jump"}]'
run "1-1 b" 2 '[{"start":80,"mode":"nes"},{"at":98,"do":"switch"},{"at":103.0,"do":"jump"},{"at":104.4,"do":"jump"},{"at":105.4,"do":"jump"},{"at":107.3,"do":"jump"}]'
run "1-2 a" 3 '[{"at":5.2,"do":"jump"},{"at":6.3,"do":"jump"},{"at":7.3,"do":"jump"},{"at":21.5,"do":"strokes:8"},{"at":33,"do":"switch"},{"at":39,"do":"switch"},{"at":44,"do":"switch"}]' 1500
run "1-2 b" 3 '[{"start":55,"mode":"snes"},{"at":58.6,"do":"jump"},{"at":59.3,"do":"jump"},{"at":60.4,"do":"jump"},{"at":61.4,"do":"jump"},{"at":62.4,"do":"jump"},{"at":72,"do":"strokes:2"},{"at":79.5,"do":"strokes:8"},{"at":94,"do":"switch"}]'
run "1-3 a" 4 '[{"at":16.6,"do":"jump"},{"at":29,"do":"switch"}]' 1400
run "1-3 b" 4 '[{"start":57,"mode":"snes"},{"at":68.0,"do":"jump"},{"at":71.6,"do":"jump"},{"at":75.6,"do":"jump"}]'
run "1-4 a" 5 '[{"at":8,"do":"switch"}]' 900
run "1-4 b" 5 '[{"start":31,"mode":"nes"},{"at":33.0,"do":"jump"},{"at":35.8,"do":"jump"},{"at":37.0,"do":"switch"},{"at":39.8,"do":"jump"},{"at":41.0,"do":"switch"},{"at":43.8,"do":"jump"},{"at":45.0,"do":"switch"},{"at":47.8,"do":"jump"},{"at":49.0,"do":"switch"},{"at":51.8,"do":"jump"},{"at":53.0,"do":"switch"},{"at":55.8,"do":"jump"}]' 1500
run "1-4 c" 5 '[{"start":64,"mode":"snes"},{"at":66.6,"do":"jump"},{"at":67.3,"do":"jump"},{"at":68.4,"do":"jump"},{"at":69.4,"do":"jump"},{"at":70.4,"do":"jump"},{"at":72.2,"do":"switch"},{"at":80.2,"do":"switch"},{"at":85.5,"do":"strokes:8"}]'
