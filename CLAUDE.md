# Terra Nova DX — guía para continuar el proyecto

Plataformas 2D para navegador, homenaje a los juegos de los 80 y 90. Con un botón se cambia entre la versión **8 bits (NES)** y **16 bits (SNES)** del juego; cada una tiene sus propias reglas (glitches en 8 bits, gimmicks en 16 bits). La historia: el remaster inacabado de un juego de 1989 se está grabando encima del original, y Alex, la última desarrolladora, lo va parcheando.

**Antes de trabajar, leer `docs/diseno.md`.** Tiene el diseño completo, el arco narrativo de 6 mundos (sección 2) y el plan por pasos (sección 11). **El siguiente trabajo es la Fase 3** (replanteo del Mundo 1, fragmentos de mapa y música).

## Cómo se trabaja en este proyecto

- **Por pasos chicos.** Cada paso termina jugable, se prueba, se marca como hecho en la tabla de `docs/diseno.md`, se hace commit y se sube. El usuario tiene créditos limitados: si se corta a mitad de un paso, lo último subido debe funcionar.
- **Idioma:** todo en español. Textos del juego en **español neutro** (tú, sin regionalismos). Comentarios del código en español.
- **Sin dependencias ni compilación:** HTML5 Canvas y JavaScript con `<script>` clásicos (no módulos), para que funcione abriendo `index.html` con doble clic. Todo cuelga del objeto global `TN`.
- **Autenticidad técnica:** resolución 256×224; en 8 bits, sprites de 3 colores + transparente y tiles con una paleta de la NES (el código lo valida); en 16 bits, hasta 15 colores. Los textos usan la fuente de píxeles propia (`src/font.js`); si falta un carácter, se agrega el glifo.
- **Enseñar sin palabras:** Alex nunca da tutoriales. Lo nuevo se enseña con el diseño del nivel y con íconos de tecla (`g.hint` en el generador de niveles).

## Mapa del código

| Archivo | Qué hace |
|---|---|
| `index.html` | Carga los scripts en orden, escalado entero, pantalla completa (F) |
| `src/config.js` | Constantes, colores por modo, físicas de cada modo, agua, ayudas (tiempo de gracia, memoria de salto) |
| `src/input.js` | Teclado → acciones (una tecla puede dar varias) |
| `src/level.js` | Leyenda de caracteres del nivel, colisiones por modo |
| `src/levels.js` | **Generado** por `tools/build_levels.py`. No editar a mano |
| `src/save.js` | Progreso en `localStorage` (nivel alcanzado, fragmentos, acciones aprendidas, ruptura) |
| `src/sprites.js`, `src/tiles.js`, `src/entities.js` | Arte en texto (cada carácter es un píxel) y objetos: espinas, murciélagos, fragmentos, puntos de control, ramas, parpadeo de sprites |
| `src/backgrounds.js`, `src/font.js` | Fondos con parallax y fuente 5×7 |
| `src/audio.js` | Música y efectos con Web Audio (dos arreglos sincronizados) |
| `src/player.js` | Físicas del explorador en cada modo, buceo |
| `src/game.js` | Bucle, estados, niveles, colisiones con objetos, dibujado |
| `src/screens.js` | Título (1989 y DX), final del Mundo 1 |
| `src/hints.js` | Íconos de tecla |
| `src/story.js`, `src/dialog.js` | Guion, retrato de Alex y cuadros de diálogo |
| `src/glitch.js` | La ruptura del juego al final del prólogo |

## Niveles

Se editan en `tools/build_levels.py` y se generan con:

```
python3 tools/build_levels.py
```

Cada nivel se arma por secciones sobre una cuadrícula de 14 filas; la leyenda de caracteres está al principio de `src/level.js`. Helpers: `g.fill`, `g.put`, `g.stairs`, `g.hint` (ícono de tecla), `g.dialog` (diálogo al pasar por una columna, con `event` opcional), `g.label` (cartel de la sala de pruebas), `g.todo` (cartel TODO de Alex, solo 16 bits), `g.note` (nota de M., solo 8 bits; admite varias líneas con `\n`).

Orden actual: prólogo (0), tutorial (1), 1-1 (2), 1-2 (3), 1-3 (4), 1-4 (5).

## Pruebas

Requieren Playwright (en el entorno en la nube está instalado de forma global):

```
NODE_PATH=$(npm root -g) node tools/test/smoke.js captura.png "código JS opcional"   # captura y errores
NODE_PATH=$(npm root -g) node tools/test/bot.js <nivel> '<plan JSON>' [fotogramas]    # jugador automático
NODE_PATH=$(npm root -g) node tools/test/hops.js <nivel> '<saltos JSON>'              # saltos entre murciélagos
tools/test/regress.sh                                                                   # recorrido de todos los niveles
```

- `bot.js` simula fotograma a fotograma manteniendo la derecha. El plan es una lista de acciones por columna: `{"at": col, "do": "jump" | "switch" | "hold:run" | "release:run" | "strokes:N"}`. El primer elemento puede ser `{"start": col, "mode": "nes"|"snes"}` para empezar a mitad del nivel.
- En `regress.sh`, que un tramo termine con daño a veces es esperado: algunos tramos acaban a propósito ante un obstáculo que no se puede pasar en ese modo. Comparar con la salida anterior.
- Después de cambiar físicas o niveles, correr `tools/test/regress.sh`.
