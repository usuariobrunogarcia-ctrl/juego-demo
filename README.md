# Terra Nova DX

Plataformas 2D para navegador en homenaje a los juegos de los 80 y 90. Con un botón se cambia entre la versión **8 bits (NES)** y la **16 bits (SNES)** del juego, y cada una tiene sus propias reglas.

## Qué hay en el juego

Un nivel de la Selva que enseña, sección a sección, cada mecánica y termina con un repaso que las combina:

- **Bloques exclusivos** de cada versión (el contorno punteado muestra los de la otra).
- **Glitches de 8 bits:** parpadeo de sprites (los objetos de una línea saturada no hacen daño), paredes con la colisión rota que se atraviesan y agua sólida.
- **Gimmicks de 16 bits:** ramas en la capa de parallax que te llevan, agua transparente para bucear y murciélagos que sirven de plataforma.
- **6 fragmentos de mapa** escondidos, cada uno ligado a una mecánica.

## Cómo jugar

Abre `index.html` en el navegador. No hace falta instalar nada.

| Acción | Teclas |
|---|---|
| Moverse | ← → o A D |
| Saltar | Z, Espacio, ↑ o W |
| Cambiar entre 8 y 16 bits | X o K |
| Correr (solo 16 bits) | Shift o C |
| Activar o silenciar el sonido | M |
| Pantalla completa | F |

## Documentación

- [Documento de diseño y plan de etapas](docs/diseno.md)
- Los niveles se generan con `python3 tools/build_levels.py`, que escribe `src/levels.js`.
