# Terra Nova DX — Documento de diseño

> Nombre provisional. Documento vivo: se irá actualizando a medida que el diseño avance.

## 1. Resumen

**Terra Nova DX** es un plataformas 2D que rinde homenaje a los juegos de los 80 y 90. Con un solo botón, el jugador cambia al instante entre la versión **8 bits (NES)** y la versión **16 bits (SNES)** del juego.

El cambio no es solo visual: cada versión tiene sus propias reglas. En 8 bits hay **glitches** que permiten avanzar. En 16 bits esos glitches están corregidos, pero aparecen **gimmicks** nuevos que no existían en 8 bits. Los niveles están diseñados para que haya que alternar entre ambos modos continuamente.

- **Género:** plataformas 2D de acción y exploración
- **Pilares:**
  1. **Un botón, dos juegos:** el cambio de versión es la mecánica central y el único "poder" del protagonista.
  2. **Autenticidad técnica:** cada modo respeta las limitaciones reales de su consola.
  3. **Sin combate:** los enemigos se esquivan o se aprovechan, nunca se derrotan.
  4. **Glitches justos:** los fallos siguen reglas claras y predecibles, nunca son aleatorios.

## 2. Historia

**Terra Nova** fue un juego de NES de 1989 sobre un explorador que recorría y cartografiaba tierras desconocidas. Años después, un estudio empezó a rehacerlo para SNES como **Terra Nova DX**, pero el proyecto quedó **inacabado**.

El juego ocurre dentro de esa build a medio hacer. Las dos versiones conviven en el mismo cartucho y el explorador puede saltar de una a otra. Allí donde ambas versiones coinciden, el cambio es posible.

Notas y mensajes de depuración que dejó el equipo del estudio, escondidos por los niveles, van contando por qué el remaster nunca se terminó.

## 3. Personajes

### El explorador (protagonista)

- Héroe del Terra Nova original. Nombre por decidir.
- Su objetivo es explorar y **cartografiar** cada zona.
- No tiene poderes mágicos ni de combate. Su única habilidad especial es **cambiar de versión**.
- Tiene dos diseños: el sprite original de NES (3 colores + transparente) y el rediseño de SNES, más detallado.

### Enemigos: fauna y trampas del juego original

No son monstruos ni criaturas malvadas. Son animales y trampas de ruinas que **repiten su rutina** sin perseguir al jugador.

- **En 8 bits:** hacen daño al tocarlos, pero sufren los fallos de la NES (parpadeo, respawn, colisiones imprecisas).
- **En 16 bits:** fueron rediseñados y se pueden usar como **plataformas**. El jugador se sube encima sin hacerles daño.

| Enemigo | En 8 bits | En 16 bits |
|---|---|---|
| **Murciélagos** en bandada | Parpadean al ser muchos y se pueden atravesar | Vuelan en formación: escalera móvil |
| **Cangrejos** que van y vienen | Hacen daño y en los bordes se meten en la pared | Caparazón grande sobre el que subirse |
| **Rocas rodantes** | Desaparecen al salir de pantalla y reaparecen (respawn) | Física real: plataforma o ariete para romper paredes |
| **Pájaros** | Vuelan en línea recta y salen por arriba de la pantalla | Planean en círculos y elevan al jugador |
| **Trampas de ruinas** (pinchos, dardos) | Estáticas, con colisiones imprecisas | Mecánicas y animadas, con ritmos distintos |

## 4. Mecánica central: el cambio de versión

### Reglas

- El cambio es **libre, instantáneo e ilimitado**, también en pleno salto.
- Solo se puede cambiar si la posición del jugador está **libre en la otra versión** del nivel (no hay un sólido en ese lugar).
- Si el jugador lo intenta donde no es seguro, **no cambia**: suena un pitido de error y el personaje tiembla un instante.
- Un **icono de cartucho en el HUD** indica siempre si el cambio está disponible: verde si se puede, gris con una cruz si no, y rojo al intentarlo sin poder.
- Los bloques que solo existen en la otra versión se dibujan como un **contorno punteado**, así el jugador ve dónde puede y dónde no puede cambiar.
- Al cambiar se **conserva la velocidad**, pero pasan a aplicarse las físicas del nuevo modo.
- Todo cambia a la vez: gráficos, paleta, colisiones, físicas, comportamiento de los enemigos y **música**.

### Físicas por modo

| | 8 bits | 16 bits |
|---|---|---|
| Salto | Altura fija; la trayectoria queda decidida al saltar | La altura depende de cuánto se mantiene el botón |
| Control en el aire | Casi ninguno | Total |
| Movimiento | Velocidad constante, sin inercia | Aceleración, frenada y botón de correr |
| Extras | Ninguno | Deslizarse por paredes, agarrarse a bordes (por confirmar) |

Técnica emergente: coger carrerilla en 16 bits y cambiar a 8 bits en el aire para "fijar" un salto largo.

### Música

Cada canción existe en dos arreglos, uno chiptune (NES) y otro con samples (SNES), **sincronizados**, para que al cambiar la música continúe sin cortes en el otro estilo.

## 5. Referencia técnica: cómo se ven la NES y la SNES

El arte, el sonido y los efectos de cada modo deben **respetar las limitaciones reales** de su consola. Esas limitaciones son a la vez la estética y la fuente de las mecánicas.

| | NES (8 bits) | SNES (16 bits) |
|---|---|---|
| Resolución | 256×240 (visible ~256×224) | 256×224 |
| Paleta | Fija, ~54 colores utilizables, tonos apagados | 32.768 colores (15 bits), hasta 256 en pantalla |
| Tiles | 8×8 | 8×8 / 16×16 |
| Color del fondo | 4 paletas de 3 colores + un color de fondo común. **La paleta se asigna por bloques de 16×16** | 8 paletas de 15 colores |
| Color de los sprites | 4 paletas de 3 colores + transparente | 8 paletas de 15 colores + transparente |
| Capas de fondo | 1 (sin parallax real salvo trucos de barra de estado) | Hasta 4, con scroll independiente |
| Sprites | 64 en total, **máx. 8 por línea** → parpadeo | 128 en total, 32 por línea |
| Efectos | Ninguno por hardware; ralentización con mucha carga | Mode 7, transparencias, mosaico, HDMA (degradados, ondulación), ventanas |
| Sonido | 2 ondas cuadradas, 1 triangular, 1 ruido, 1 DPCM | 8 canales de samples con eco/reverb |

### Reglas de producción

- Se renderiza a **resolución nativa (256×224)** y se escala por factores enteros, sin filtros de suavizado.
- Ambas versiones comparten la misma **rejilla de tiles** y la misma resolución, así que la geometría de los niveles es comparable entre modos.
- **Modo 8 bits:** usar solo la paleta NES; máximo 3 colores + transparente por sprite; paleta de fondo por bloques de 16×16; una sola capa de fondo; parpadeo real con más de 8 sprites por línea.
- **Modo 16 bits:** hasta 15 colores por tile/sprite, varias capas con parallax y efectos propios de la SNES.

## 6. Glitches (8 bits)

Inspirados en glitches reales de juegos de NES. Cada uno funciona con reglas fijas y se enseña primero en un entorno seguro.

| Glitch | Efecto jugable |
|---|---|
| **Parpadeo de sprites** | Con más de 8 objetos en una línea, algunos parpadean; mientras son invisibles no hacen daño |
| **Atravesar paredes** (wall clip) | En ciertas esquinas el jugador se mete en un bloque y sale por el otro lado |
| **Ralentización** | Con muchos objetos en pantalla todo va más lento: "tiempo bala" para pasar zonas de precisión |
| **Salir por arriba de la pantalla** | El techo no tiene colisión: se puede caminar por encima del nivel |
| **Errores de paleta** | Bloques falsos y reales se ven idénticos; enemigos camuflados |
| **Basura en el borde del scroll** | Tiles corruptos en el borde de la pantalla que sirven de plataformas temporales |
| **Agua sólida** | El agua es un bloque sobre el que se puede andar |
| **Respawn** | Los objetos que salen de pantalla desaparecen y vuelven a su posición inicial |
| **Zonas corruptas** | Áreas secretas al estilo del *Minus World*, como niveles bonus |

## 7. Gimmicks (16 bits)

| Gimmick | Efecto jugable |
|---|---|
| **Parallax jugable** | Las capas de fondo tienen colisión: plataformas que solo existen en 16 bits |
| **Mode 7** | Salas y plataformas que rotan y escalan; una pared puede convertirse en suelo |
| **Transparencias** | Agua, cristal y niebla translúcidos que revelan pasadizos; se puede bucear |
| **Más colores** | Distinguir bloques falsos, ver grietas y pistas en el fondo |
| **Iluminación** | Cono de luz alrededor del jugador en zonas oscuras |
| **Mosaico y ondulación** | Portales, zonas de calor que desplazan plataformas, efectos bajo el agua |
| **Eco** | El reverb del sonido delata salas ocultas cercanas |
| **Enemigos rediseñados** | La fauna se vuelve sólida y sirve de plataforma |

## 8. Objetivos y progresión

- **Objetivo principal:** llegar a la salida de cada nivel.
- **Objetivo secundario:** encontrar los **fragmentos de mapa** escondidos para cartografiar el nivel al 100 %. Muchos solo son accesibles con un glitch o un gimmick concreto.
- El mapa se dibuja en el estilo de la versión activa: tosco y con pocos colores en 8 bits, detallado en 16 bits.

### Mundos

Cada mundo presenta un glitch y un gimmick nuevos y los combina con los anteriores.

| # | Mundo | Glitch principal | Gimmick principal |
|---|---|---|---|
| 1 | **Selva** | Parpadeo de sprites | Parallax jugable (lianas en la capa del fondo) |
| 2 | **Cuevas** | Atravesar paredes | Iluminación |
| 3 | **Costa y cascadas** | Agua sólida | Transparencias y buceo |
| 4 | **Desierto y ruinas** | Ralentización | Ondulación por calor |
| 5 | **Glaciar y montaña** | Salir por arriba de la pantalla | Mode 7 |
| 6 | **El estudio / la build rota** | Todos | Todos |

### Estructura de enseñanza de cada mecánica

1. **Presentar** la mecánica en un lugar seguro, sin riesgo.
2. **Practicar** con un reto sencillo.
3. **Combinar** con mecánicas anteriores.
4. **Sorprender** con un giro que obligue a usarla de otra manera.

## 9. Primera versión jugable (MVP)

Objetivo: comprobar que cambiar de modo es divertido.

- [ ] Un nivel de la **Selva**.
- [ ] Explorador que corre y salta, con **físicas distintas** en cada modo.
- [ ] **Botón de cambio** con la regla de posición libre, indicador y feedback de error.
- [ ] Cambio de gráficos, colisiones y música.
- [ ] 2 glitches: **parpadeo de sprites** y **atravesar paredes**.
- [ ] 2 gimmicks: **parallax jugable** y **agua transparente**.
- [ ] Al menos un tipo de enemigo (murciélagos) con su comportamiento en ambos modos.
- [ ] Fragmentos de mapa coleccionables.

## 10. Pendiente de decidir

- Nombre del explorador y nombre definitivo del juego.
- Habilidades extra de 16 bits (deslizarse por paredes, agarrarse a bordes).
- Sistema de vidas, daño y puntos de control.

## 11. Plan de desarrollo

**Tecnología:** juego para navegador con HTML5 Canvas y JavaScript, sin librerías ni herramientas de compilación. Se juega abriendo `index.html`.

El juego se construye por etapas. Cada una termina con algo jugable que se puede probar antes de seguir.

| Etapa | Contenido | Estado |
|---|---|---|
| 1 | **Base:** canvas a 256×224 con escalado entero, bucle a 60 fps, teclado, nivel por tiles, explorador que corre y salta con colisiones, cámara con scroll, fosos y meta | ✅ Hecha |
| 2 | **Cambio de versión:** dos versiones del nivel, botón de cambio con la regla de posición libre, indicador y aviso de error, físicas distintas en cada modo | ✅ Hecha |
| 3a | **Sprite del explorador** en 8 bits (paleta NES de 3 colores) y 16 bits (contorno y sombreado), con animaciones de quieto, caminar y saltar | ✅ Hecha |
| 3b | **Tiles** del suelo, ladrillos y bloques exclusivos en los dos estilos | ✅ Hecha |
| 3c | **Fondo con parallax** en 16 bits y **fuente de píxeles** para los textos | Pendiente |
| 4 | **Glitches de 8 bits:** parpadeo de sprites y atravesar paredes | Pendiente |
| 5 | **Gimmicks de 16 bits:** parallax jugable y agua transparente | Pendiente |
| 6 | **Enemigos y objetivos:** murciélagos en ambos modos, fragmentos de mapa y HUD | Pendiente |
| 7 | **Sonido:** música con dos arreglos sincronizados y efectos (Web Audio) | Pendiente |
| 8 | **Nivel de la Selva completo:** diseño final del nivel del MVP y pulido | Pendiente |
