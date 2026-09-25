# Terra Nova DX

Plataformas 2D para navegador en homenaje a los juegos de los 80 y 90. Con un botón se cambia entre la versión **8 bits (NES)** y la **16 bits (SNES)** del juego, y cada una tiene sus propias reglas.

## Qué hay en el juego

La aventura completa hasta el final del Mundo 1:

1. **Prólogo – Terra Nova (1989):** parece un juego de NES normal, sin botón de cambio. Al final, una pared rota rompe el juego.
2. **Tutorial – Build 0.3:** la sala de pruebas del remaster a medio hacer. Alex, la última desarrolladora, te descubre, y se desbloquea el cambio entre 8 y 16 bits.
3. **Mundo 1:** *La selva*, *Ruinas del río*, *Las copas* y *El parche*, donde Alex elimina el parpadeo de sprites en pleno nivel.

Se enseña sin palabras (íconos de tecla la primera vez que aparece algo nuevo) y el progreso se guarda en el navegador.

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
