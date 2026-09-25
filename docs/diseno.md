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

### La regla que lo sostiene todo

**En el cartucho no entran las dos versiones.** El remaster se graba *encima* de los datos de 1989: cada nivel que Alex termina borra el original. Si el remaster se completa, *Terra Nova (1989)* desaparece, y el explorador con ella.

- **Amenaza visible:** en 8 bits aparecen zonas ya borradas (vacíos negros) que avanzan mundo a mundo.
- **Espejo temático:** el equipo de 1989 también tuvo que recortar contenido por falta de memoria. Las dos épocas sufren el mismo límite.
- **Por qué Alex puede tocar las reglas de 8 bits:** la versión de 1989 corre dentro de un emulador que forma parte del remaster. Alex no parchea la NES, sino su emulador.

### Dos voces a través del cartucho

- **Alex (hoy):** diálogos, y carteles de TODO que **solo se ven en 16 bits**.
- **M. (1989, nombre provisional):** la diseñadora original, autora del mapa que junta el explorador. Dejó notas escondidas en la ROM que **solo se ven en 8 bits**.

### El arco en 6 mundos

| Acto | Mundo | Glitch / gimmick | Qué pasa en la historia |
|---|---|---|---|
| — | **Prólogo y tutorial** | — | El juego de 1989 se rompe; Alex descubre al "bug". |
| 1. El intruso | **1. La selva** | Parpadeo / parallax jugable | Alex es fría, técnica y burlona. Parchea el parpadeo en el 1-4. **Final:** revela la amenaza ("la selva de 1989 ya está sobrescrita al 60 %"). |
| 1. El intruso | **2. Las cuevas** | Oscuridad o luz total / cono de luz | Aparecen las zonas borradas en 8 bits. El explorador encuentra la primera nota de M. Alex se endurece y borra por delante. **Final:** Alex también encuentra una nota: "¿Quién dejó esto en la ROM?". |
| 2. La duda | **3. La costa** | Basura en el borde del scroll / transparencias y corrientes | Las notas revelan que muchos "errores" fueron decisiones bajo límites durísimos, y que M. recortó un nivel entero. Alex deja entrever que jugó *Terra Nova* de niña. **Giro:** Alex deja de parchear, pero el borrado sigue: dejó en marcha un proceso automático de "compilación final" que no puede frenar. |
| 2. La duda | **4. El desierto** | Ralentización / ondulación por calor | El antagonista pasa a ser **el proceso**: cuando está cerca, el juego se ralentiza. Alex se vuelve aliada y **deshace sus parches** (vuelve el parpadeo). **Mitad del juego:** el explorador es lo único que existe en las dos versiones a la vez; es la clave para salvarlas. |
| 3. La reconciliación | **5. El glaciar** | Salir por arriba de la pantalla / Mode 7 | La memoria se congela. La última nota de M. revela que el nivel recortado de 1989 sigue escondido. Alex entiende que para que entren las dos versiones debe **borrar parte de su propio remaster**. |
| 3. La reconciliación | **6. La build rota** | Todas | El estudio por dentro. Clímax sin combate: una huida mientras el proceso borra el nivel detrás del explorador y Alex sacrifica sus niveles para frenarlo. **Final:** sale *"Terra Nova DX — incluye Terra Nova (1989)"*, con el botón de cambio como función estrella. |
| — | **Epílogo secreto: El fin del mapa** | — | Se desbloquea con **todos los fragmentos de mapa**. Es el nivel recortado de 1989, a medio hacer, con el último mensaje de M. Alex lo termina junto al explorador. |

La evolución de Alex queda repartida: fría → dura → con dudas → aliada → sacrificio. El tema de fondo es la **nostalgia frente a la modernización**: lo imperfecto también tiene valor.

### Cómo habla Alex

- Con cuadros de diálogo. Se avanza con el botón de salto.
- **Español neutro** (tú, sin regionalismos como "vale" o "vos").
- Voz propia: jerga de desarrollo, cita sus commits y números de bug, humor seco. Muestra, no explica: su soledad y su historia se descubren poco a poco.
- En 16 bits aparece su retrato en una caja translúcida. En 8 bits no hay retrato y, cada pocos segundos, un destello breve corrompe algunas letras (el texto siempre se puede leer).
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
| Control en el aire | Poco: se puede corregir la trayectoria despacio | Total |
| Movimiento | Arranque y frenada rápidos, sin correr | Aceleración y frenada suaves, botón de correr |
| Extras | Ninguno | Deslizarse por paredes, agarrarse a bordes (por confirmar) |

Técnica emergente: coger carrerilla en 16 bits y cambiar a 8 bits en el aire; la velocidad extra se conserva y el salto llega más lejos.

En los dos modos hay dos ayudas invisibles: se puede saltar hasta 6 fotogramas después de salirse de un borde, y un salto pulsado hasta 6 fotogramas antes de aterrizar se ejecuta al tocar el suelo.

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
- Cada nivel tiene 3 fragmentos, casi siempre ligados a una mecánica (bucear, subir por murciélagos, atravesar repisas rotas...). El contador está en el HUD, en la tarjeta del nivel y en la pantalla de fin del Mundo 1.

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

Ver el arco en la sección 2: 6 mundos de 4 niveles cada uno, más el prólogo, el tutorial y el epílogo secreto.

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

## 10. Decisiones

**Tomadas:** 6 mundos; amenaza del borrado del cartucho; el antagonista pasa de Alex al proceso de compilación; voz de M. y epílogo secreto; español neutro.

**Pendientes:**
- Nombre del explorador y nombre definitivo del juego.
- Nombres definitivos de Alex, M. y el estudio ficticio (provisional: *Brújula Soft*).
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
| F2-5 | **Diálogos** de Alex (retrato en 16 bits, texto corrupto en 8 bits) | ✅ Hecha |
| F2-6 | **Prólogo** en 8 bits y la **ruptura** del juego | ✅ Hecha |
| F2-7 | **Tutorial** en la sala de pruebas | ✅ Hecha |
| F2-8 | **Niveles 1-1, 1-2 y 1-3** | ✅ Hecha |
| F2-9 | **Nivel 1-4 "El parche"** y final del Mundo 1 | ✅ Hecha |

### Fase 3: replanteo del Mundo 1 y música

Objetivo: que el Mundo 1 encaje con el arco de 6 mundos, que todos los fragmentos sean alcanzables y que la música deje de ser monótona.

| Paso | Contenido | Estado |
|---|---|---|
| F3-1 | **Guion del Mundo 1, versión 2** (ver abajo): reescribir `src/story.js` en español neutro. El tutorial ya no dice que Alex no puede borrarte; el 1-4 termina con la amenaza, no con el giro emocional | ✅ Hecha |
| F3-2 | **Voces del cartucho:** carteles TODO de Alex en los niveles del Mundo 1 (solo 16 bits) y una primera nota de M. escondida en el 1-4 (solo 8 bits) como anticipo | ✅ Hecha |
| F3-3 | **Comentarios de Alex que no frenan el juego:** una línea corta en una franja, sin pausar, que reacciona a lo que hace el jugador (morir varias veces en el mismo sitio, encontrar un fragmento difícil, atravesar una pared rota) | ✅ Hecha |
| F3-4 | **Fragmentos de mapa:** comprobar con `tools/test` que los 15 fragmentos (3 por nivel) se pueden conseguir y que después se puede seguir; moverlos o ajustar el nivel si no. Cada fragmento debe pedir una mecánica concreta | ✅ Hecha |
| F3-5 | **Anticipo en el prólogo:** un fotograma suelto en 16 bits cerca del final y un tile que no encaja, antes de la ruptura | ✅ Hecha |
| F3-6 | **Música nueva** (ver abajo) | ✅ Hecha |

#### Guion del Mundo 1, versión 2 (borrador)

Alex en el Mundo 1: fría, técnica, burlona. Nunca da tutoriales.

- **Tutorial, al entrar:** ??? — "¿Un proceso nuevo en la sala de pruebas? Yo no lancé nada." / Alex — "Sprite 01. El protagonista de 1989. Tu versión debería estar sobrescrita. ¿Qué haces en mi build?" / "No te muevas. Abro el depurador."
- **Tutorial, primer cambio:** "¿Cambiaste de versión en caliente? Eso no está en ninguna especificación." / "Anotado: bug 0412. Prioridad: crítica."
- **Tutorial, salida:** "La salida lleva al 1-1. Adelante. Así veo cómo te rompes."
- **1-1, al empezar:** "Nivel 1-1. Lo rehíce píxel a píxel. Esta vez sin parpadeos, sin ralentizaciones, sin errores."
- **1-1, murciélagos:** "En 1989 los murciélagos te mataban con solo rozarte. En mi versión son decorado sólido. Commit: 'suavizar dificultad'."
- **1-2, al empezar:** "Encontré por dónde saliste: una pared de 1989 con la colisión rota. Hay decenas como esa."
- **1-2, pared rota:** "Esa pared estaba en mi lista. Línea 212. Mañana."
- **1-3, al empezar:** "El parallax no debería tener colisión. Lo dejé activo para una prueba. Nota mental: no dejar nada activo."
- **1-4, al empezar:** "El 1989 corre dentro de mi emulador. El parpadeo es un límite de la NES: ocho sprites por línea." / "El emulador es mío. Y los límites, también."
- **1-4, parche:** "Parche aplicado. Adiós, parpadeo."
- **1-4, final:** "Pasaste igual." / "Da igual. Cada nivel que termino se graba encima del original. La selva de 1989 ya está sobrescrita al 60 %." / "Cuando termine, no quedará versión a la que volver. Tampoco para ti."
- **Nota de M. en el 1-4 (solo 8 bits):** "Si alguien lee esto: el mapa no termina donde termina el juego. — M., 1989"

#### Fragmentos de mapa: reglas

- 3 por nivel del Mundo 1 (15 en total con el prólogo).
- Cada uno pide una mecánica concreta: cambiar en el aire, bucear, atravesar una pared, subir por murciélagos, usar el parpadeo, una repisa rota...
- Nunca pueden dejar al jugador atrapado: después de conseguirlo, siempre hay forma de seguir o de volver a un punto de control.
- Se comprueban con `tools/test/pieces.sh`, que usa el jugador automático (`tools/test/bot.js`) y la búsqueda de saltos (`tools/test/hops.js`).

| Nivel | Fragmentos y mecánica que piden |
|---|---|
| Prólogo | Subir a los ladrillos por el escalón · escalera · saltar entre 5 espinas que parpadean |
| 1-1 | Caminar entre 4 espinas que parpadean · cambiar en el aire entre piedras · escalera de murciélagos |
| 1-2 | Bucear bajo el muro · repisa rota: solo se sube atravesándola desde abajo en 8 bits · bucear en el río |
| 1-3 | Pararse sobre la rama y saltar en vertical · murciélagos hasta la pasarela alta · rama y plataformas de 16 bits |
| 1-4 | Saltar entre espinas antes del parche · saltar alto entre plataformas alternas · pared rota y buceo |

#### Música nueva: plan

Problema: hoy hay una sola canción de 4 compases (unos 7 segundos) que se repite en todo el juego.

- **Formato de canción por patrones**, como en los trackers de la época: patrones de 1 a 2 compases por canal (melodía, contramelodía, bajo, percusión) y una lista de orden, por ejemplo `A A' B A C`. Canciones de 60 a 90 segundos antes de repetirse, con variaciones, puentes y rellenos de percusión.
- **Seguir con dos arreglos sincronizados** (NES y SNES) de la misma canción. En 16 bits se suman contramelodía, acordes y eco.
- **Temas por zona:** título de 1989, título DX, prólogo y selva (tema principal), sala de pruebas (mínimo y "roto"), un arreglo por nivel del Mundo 1 (el 1-2 más acuático, el 1-3 más aéreo, el 1-4 más tenso tras el parche), fin de mundo y la ruptura.
- **Intensidad:** una capa que entra en momentos clave (por ejemplo, tras el parche del 1-4).

**Hecho:** formato por patrones en `src/music.js` y motor en `src/audio.js`. Temas: título (el mismo suena como 1989 en 8 bits y como DX en 16), sala de pruebas (mínimo, con pasos que fallan), selva (prólogo y 1-1, 64 s), río (lento, flauta y burbujas, 73 s), copas (rápido, campanas, en do mayor, 65 s), parche (tenso, bajo en corcheas, 65 s, con capa de intensidad tras el parche), fin del Mundo 1 y ruptura. Se revisan con `tools/test/music.js`.
