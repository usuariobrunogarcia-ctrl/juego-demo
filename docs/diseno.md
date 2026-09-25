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

**Terra Nova** fue un juego de NES de 1989 sobre un explorador que recorría y cartografiaba tierras desconocidas. Años después, un estudio empezó a rehacerlo para SNES como **Terra Nova DX**, pero el estudio cerró y el remaster quedó **inacabado**. Solo una persona siguió trabajando en él: **Alex** (nombre provisional), la última desarrolladora del proyecto.

### El arco

1. **El engaño.** El juego arranca como *Terra Nova (1989)*: título de NES, primer nivel en 8 bits puros y **sin botón de cambio**. Parece un plataformas retro normal.
2. **La ruptura.** Al final del primer nivel, la bandera queda detrás de una pared con la colisión rota. Al atravesarla, el explorador sale del nivel por donde no debería poder ir: la pantalla se corrompe y cae dentro de la **build del remaster**, en una sala de pruebas llena de texturas provisionales.
3. **La intrusión.** Alex descubre al explorador y lo trata como a un **bug**: quiere arreglarlo. Ahí el explorador descubre que puede saltar entre las dos versiones (se desbloquea el botón de cambio).
4. **La tensión.** Alex va parcheando glitches mientras el explorador avanza, pero el explorador los necesita para progresar. Al final del Mundo 1, un parche le cierra el paso y tiene que encontrar otro camino.
5. **El giro (mundos siguientes).** Alex se da cuenta de que las imperfecciones del original eran lo que lo hacía especial.
6. **El final.** El remaster sale con las dos versiones conviviendo, y el botón de cambio es su función estrella.

El tema de fondo es la **nostalgia frente a la modernización**: lo imperfecto también tiene valor.

### Cómo habla Alex

- Con cuadros de diálogo. Se avanza con el botón de salto.
- En 16 bits aparece su retrato y el texto se ve limpio. En 8 bits no hay retrato y el texto sale con la fuente de la NES y **algunas letras corruptas**.
- **Alex nunca da tutoriales**: solo habla de la historia. A jugar se aprende sin palabras (ver sección 8b).
- Diálogos cortos, de 1 a 3 cuadros por aparición.

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
| **Murciélagos** | Vuelan de lado a lado; hacen daño al tocarlos y cuentan para el parpadeo | Plataformas móviles inofensivas: te llevan al subirte |
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

Implementación: todo se sintetiza con Web Audio. En 8 bits hay dos pulsos, un triángulo (bajo y bombo) y ruido (caja y charles), como el chip de la NES. En 16 bits hay melodía con dos osciladores filtrados, acordes de fondo, bajo suave, percusión filtrada y eco (convolución), como el SPC700 de la SNES. Los dos arreglos suenan a la vez y el cambio de modo solo alterna el volumen de cada uno. Los efectos (salto, brazada, cambio, error, daño, fragmento, punto de control y meta) usan el timbre del modo activo. La tecla M silencia.

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
| **Parpadeo de sprites** | Como en la NES, caben 8 sprites de hardware por línea y un objeto de 16 px ocupa 2 (el explorador también). Si una línea se satura, sus objetos parpadean y mientras parpadean no hacen daño: 3 espinas en fila son peligrosas; 4 parpadean cuando te pones a su altura; 5 o más parpadean siempre |
| **Atravesar paredes** (wall clip) | Las paredes con gráficos corruptos tienen la colisión rota: en 8 bits se atraviesan caminando (despacio y temblando) y solo son sólidas por arriba. En 16 bits están arregladas y son sólidas. Dentro de una no se puede cambiar de modo |
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
| **Parallax jugable** | Ramas en la capa de selva, que se desplaza a la mitad de velocidad que el nivel. Solo existen en 16 bits; al caminar sobre ellas la capa avanza con la cámara y te lleva hacia delante (se llega el doble de lejos). En 8 bits se ve su contorno punteado |
| **Mode 7** | Salas y plataformas que rotan y escalan; una pared puede convertirse en suelo |
| **Transparencias** | El agua es translúcida y se puede bucear (brazada con el botón de salto; saltar con la cabeza fuera para salir). Deja pasar por debajo de muros. Buceando no se puede cambiar a 8 bits, porque allí el agua es sólida |
| **Más colores** | Distinguir bloques falsos, ver grietas y pistas en el fondo |
| **Iluminación** | Cono de luz alrededor del jugador en zonas oscuras |
| **Mosaico y ondulación** | Portales, zonas de calor que desplazan plataformas, efectos bajo el agua |
| **Eco** | El reverb del sonido delata salas ocultas cercanas |
| **Enemigos rediseñados** | La fauna se vuelve sólida y sirve de plataforma |

## 8. Objetivos y progresión

- **Objetivo principal:** llegar a la salida de cada nivel.
- **Objetivo secundario:** encontrar los **fragmentos de mapa** escondidos para cartografiar el nivel al 100 %. Muchos solo son accesibles con un glitch o un gimmick concreto.
- El mapa se dibuja en el estilo de la versión activa: tosco y con pocos colores en 8 bits, detallado en 16 bits.
- En el nivel actual hay 6 fragmentos, cada uno ligado a una mecánica: cambiar en el aire, el parpadeo, atravesar paredes, bucear, subir por los murciélagos y saltar desde una rama. El contador (MAPA x/6) está en el HUD y en el mensaje final.

### Estructura de la aventura

El juego avanza de nivel en nivel. Antes de cada uno aparece una tarjeta con su número y nombre, al estilo de la NES. El progreso (nivel alcanzado, fragmentos y acciones aprendidas) se guarda en el navegador.

| Nivel | Nombre | Qué pasa | Mecánicas nuevas |
|---|---|---|---|
| **Prólogo** | *Terra Nova (1989) – 1-1* | Solo 8 bits, sin cambio. Al final, la pared rota lleva fuera del nivel y el juego "se rompe" | Moverse, saltar, fosos, espinas, puntos de control, fragmentos, atravesar paredes |
| **Tutorial** | *Build 0.3 – Sala de pruebas* | Texturas provisionales y cuadrícula de depuración. Alex te descubre. Se desbloquea el cambio | Físicas de 16 bits (correr, salto variable), cambio de versión, bloques exclusivos, regla de cambio seguro |
| **1-1** | *La selva* | Primer nivel "real" del remaster | Cambiar en el aire, murciélagos, parpadeo de sprites |
| **1-2** | *Ruinas del río* | Ruinas inundadas | Agua (sólida / buceo), paredes rotas combinadas con el cambio |
| **1-3** | *Las copas* | Por encima de la selva | Ramas en la capa de fondo, escaleras de murciélagos |
| **1-4** | *El parche* | Alex parchea el parpadeo en pleno nivel: las espinas dejan de parpadear en 8 bits y hay que buscar otra ruta. Final del Mundo 1 | Repaso de todo |

Cada nivel del Mundo 1 tiene **3 fragmentos de mapa**.

### Mundos siguientes

| # | Mundo | Glitch principal | Gimmick principal |
|---|---|---|---|
| 2 | **Cuevas** | Oscuridad total o luz total | Iluminación (cono de luz) |
| 3 | **Costa y cascadas** | Basura en el borde del scroll | Transparencias y corrientes |
| 4 | **Desierto y ruinas** | Ralentización | Ondulación por calor |
| 5 | **Glaciar y montaña** | Salir por arriba de la pantalla | Mode 7 |
| 6 | **El estudio / la build rota** | Todos | Todos |

## 8b. Enseñar sin palabras

- **El diseño enseña:** cada mecánica aparece primero en un lugar seguro, donde fallar no cuesta nada, y solo después en serio.
- **Íconos de tecla, nunca texto:** la primera vez que aparece algo nuevo, flota junto al obstáculo una tecla dibujada en píxeles (por ejemplo, [X]). Desaparece para siempre en cuanto el jugador hace esa acción.
- **Pista si te trabás:** si el jugador recibe daño 3 veces desde el último punto de control, los íconos de esa zona vuelven a aparecer.
- **Sin texto de controles** fuera del juego: la pantalla solo muestra el juego, con escalado entero centrado en la ventana.

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
- Nombre definitivo de Alex y del estudio ficticio (provisional: *Brújula Soft*).
- Habilidades extra de 16 bits (deslizarse por paredes, agarrarse a bordes).
- Sistema de vidas (por ahora, al recibir daño se reaparece en el último punto de control sin límite).

## 11. Plan de desarrollo

**Tecnología:** juego para navegador con HTML5 Canvas y JavaScript, sin librerías ni herramientas de compilación. Se juega abriendo `index.html`.

El juego se construye por etapas. Cada una termina con algo jugable que se puede probar antes de seguir.

| Etapa | Contenido | Estado |
|---|---|---|
| 1 | **Base:** canvas a 256×224 con escalado entero, bucle a 60 fps, teclado, nivel por tiles, explorador que corre y salta con colisiones, cámara con scroll, fosos y meta | ✅ Hecha |
| 2 | **Cambio de versión:** dos versiones del nivel, botón de cambio con la regla de posición libre, indicador y aviso de error, físicas distintas en cada modo | ✅ Hecha |
| 3a | **Sprite del explorador** en 8 bits (paleta NES de 3 colores) y 16 bits (contorno y sombreado), con animaciones de quieto, caminar y saltar | ✅ Hecha |
| 3b | **Tiles** del suelo, ladrillos y bloques exclusivos en los dos estilos | ✅ Hecha |
| 3c | **Fondo con parallax** en 16 bits y **fuente de píxeles** para los textos | ✅ Hecha |
| 4a | **Parpadeo de sprites**, espinas y puntos de control | ✅ Hecha |
| 4b | **Atravesar paredes** | ✅ Hecha |
| 5a | **Parallax jugable:** ramas en la capa del fondo | ✅ Hecha |
| 5b | **Agua:** sólida en 8 bits, transparente y para bucear en 16 bits | ✅ Hecha |
| 6a | **Murciélagos** en ambos modos | ✅ Hecha |
| 6b | **Fragmentos de mapa** y HUD | ✅ Hecha |
| 7 | **Sonido:** música con dos arreglos sincronizados y efectos (Web Audio) | ✅ Hecha |
| 8 | **Nivel de la Selva completo:** secciones que enseñan cada mecánica y un repaso final que las combina, pantalla de título y parpadeo al reaparecer | ✅ Hecha |

### Fase 2: prólogo, tutorial y Mundo 1

| Paso | Contenido | Estado |
|---|---|---|
| F2-1 | **Plan** de la historia, el prólogo, el tutorial y el Mundo 1 | ✅ Hecha |
| F2-2 | **Pantalla y niveles:** escalado entero a la ventana sin texto de controles; varios niveles con tarjeta de presentación; guardado del progreso | ✅ Hecha |
| F2-3 | **Pantalla de título** nueva: la de 1989 al empezar y la de DX, con glitches, tras el prólogo | ✅ Hecha |
| F2-4 | **Íconos de tecla** para enseñar sin palabras | ✅ Hecha |
| F2-5 | **Diálogos** de Alex (retrato en 16 bits, texto corrupto en 8 bits) | Pendiente |
| F2-6 | **Prólogo** en 8 bits y la **ruptura** del juego | Pendiente |
| F2-7 | **Tutorial** en la sala de pruebas | Pendiente |
| F2-8 | **Niveles 1-1, 1-2 y 1-3** | Pendiente |
| F2-9 | **Nivel 1-4 "El parche"** y final del Mundo 1 | Pendiente |
