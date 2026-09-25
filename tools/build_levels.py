#!/usr/bin/env python3
"""Genera src/levels.js a partir de las definiciones de nivel de este archivo.

Uso: python3 tools/build_levels.py

Cada nivel se construye por secciones sobre una cuadrícula de 14 filas.
Caracteres: ver la leyenda al principio de src/level.js.
"""
import json
import os

H = 14


class Grid:
    def __init__(self, width):
        self.w = width
        self.g = [['.'] * width for _ in range(H)]
        self.hints = []
        self.dialogs = []
        self.labels = []
        self.fill(0, width - 1, 12, 13, '#')

    def put(self, c, r, ch):
        self.g[r][c] = ch

    def fill(self, c0, c1, r0, r1, ch):
        for c in range(c0, c1 + 1):
            for r in range(r0, r1 + 1):
                self.g[r][c] = ch

    def stairs(self, c0, heights, ch='#'):
        """Columnas de suelo con las alturas dadas (en tiles) a partir de c0."""
        for i, h in enumerate(heights):
            if h > 0:
                self.fill(c0 + i, c0 + i, 12 - h, 11, ch)

    def hint(self, c, r, keys, learn):
        """Ícono de tecla flotando en (c, r) hasta que el jugador aprenda 'learn'."""
        self.hints.append({'tx': c, 'ty': r, 'keys': keys, 'learn': learn})

    def dialog(self, c, id, event=None):
        """Diálogo que empieza cuando el jugador pasa por la columna c.
        event: acción del juego que ocurre al terminar el diálogo (p. ej. 'patchFlicker')."""
        d = {'tx': c, 'id': id}
        if event:
            d['event'] = event
        self.dialogs.append(d)

    def label(self, c, r, text, kind='debug'):
        """Cartel en (c, r). kind: 'debug' (sala de pruebas) y 'todo' (carteles de Alex)
        solo se ven en 16 bits; 'note' (notas de M. en la ROM) solo en 8 bits.
        El texto puede tener varias líneas separadas por '\\n'."""
        self.labels.append({'tx': c, 'ty': r, 'text': text, 'kind': kind})

    def todo(self, c, r, text):
        """Cartel TODO de Alex (solo 16 bits)."""
        self.label(c, r, text, 'todo')

    def note(self, c, r, text):
        """Nota de M. escondida en la ROM de 1989 (solo 8 bits)."""
        self.label(c, r, text, 'note')

    def rows(self):
        return [''.join(r) for r in self.g]


def build(sections):
    """sections: lista de (ancho, función(grid, offset))."""
    width = sum(w for w, _ in sections)
    g = Grid(width)
    o = 0
    for w, fn in sections:
        fn(g, o)
        o += w
    return g


LEVELS = []


def level(id, code, name, sections, start_mode='nes', switch=True, theme='jungle', **extra):
    g = build(sections)
    LEVELS.append({
        'id': id, 'code': code, 'name': name, 'startMode': start_mode,
        'switchUnlocked': switch, 'theme': theme, **extra, 'rows': g.rows(),
        'hints': g.hints, 'dialogs': g.dialogs, 'labels': g.labels,
    })


# ---------------------------------------------------------------------------
# Prólogo: el 1-1 original de Terra Nova (1989). Solo 8 bits y sin cambio.
# Al meterse en la pared rota del final, el juego "se rompe" (breakOnClip).
# ---------------------------------------------------------------------------

def p_start(g, o):
    g.put(o + 2, 11, 'P')
    g.hint(o + 4, 8, ['←', '→'], 'move')
    g.stairs(o + 10, [2, 2])
    g.hint(o + 8, 7, ['Z'], 'jump')
    g.fill(o + 16, o + 18, 12, 13, '.')
    g.fill(o + 22, o + 25, 8, 8, 'B'); g.put(o + 23, 7, '*')
    g.put(o + 30, 11, 'x')
    g.put(o + 35, 11, 'C')


def p_middle(g, o):
    g.fill(o + 5, o + 6, 11, 11, 'x')
    g.put(o + 14, 9, 'b')
    g.fill(o + 20, o + 22, 12, 13, '.')
    g.put(o + 26, 11, 'C')
    g.stairs(o + 30, [1, 2, 3, 3, 2, 1])
    g.put(o + 32, 5, '*')


def p_end(g, o):
    g.put(o + 1, 11, 'C')
    g.fill(o + 6, o + 10, 11, 11, 'x')      # 5 espinas: parpadean siempre (primer glitch)
    g.put(o + 8, 9, '*')
    g.put(o + 15, 11, 'C')
    g.fill(o + 24, o + 25, 0, 11, 'W')      # la pared rota que lleva a la ruptura
    g.hint(o + 22, 9, ['→'], 'clip')
    g.put(o + 30, 11, 'F')


level('prologo', 'MUNDO 1-1', '', [(40, p_start), (40, p_middle), (40, p_end)],
      start_mode='nes', switch=False, breakOnClip=True)


# ---------------------------------------------------------------------------
# Tutorial: la sala de pruebas de la build del remaster. Empieza en 16 bits.
# ---------------------------------------------------------------------------

def t_run(g, o):
    g.put(o + 3, 11, 'P')
    g.label(o + 2, 4, 'SALA DE PRUEBAS 03')
    g.hint(o + 8, 8, ['C'], 'run')
    g.fill(o + 11, o + 15, 12, 13, '.')        # foso de 5: hay que correr
    g.label(o + 11, 7, 'TODO: FOSO')


def t_switch(g, o):
    g.put(o + 1, 11, 'C')
    g.fill(o + 8, o + 8, 0, 11, 'S')          # muro de 16 bits: cambiar a 8
    g.hint(o + 5, 8, ['X'], 'switch')
    g.dialog(o + 10, 'tuto_cambio')
    g.fill(o + 16, o + 16, 0, 11, 'N')        # muro de 8 bits: volver a 16
    g.label(o + 18, 5, 'TODO: BORRAR ASSETS 1989')


def t_safe(g, o):
    g.put(o + 1, 11, 'C')
    g.fill(o + 5, o + 9, 0, 8, 'B'); g.fill(o + 5, o + 9, 9, 11, 'N')   # túnel solo de 16 bits
    g.fill(o + 11, o + 12, 0, 11, 'S')                                # hay que salir para cambiar
    g.label(o + 4, 3, 'TEST: COLISIONES')


def t_air(g, o):
    g.put(o + 1, 11, 'C')
    g.fill(o + 5, o + 13, 12, 13, '.')
    g.fill(o + 6, o + 7, 10, 10, 'S'); g.fill(o + 9, o + 11, 10, 10, 'N')
    g.label(o + 5, 5, 'TEST: PLATAFORMAS')


def t_exit(g, o):
    g.put(o + 1, 11, 'C')
    g.dialog(o + 8, 'tuto_salida')
    g.label(o + 12, 6, 'SALIDA A 1-1')
    g.put(o + 14, 11, 'F')


level('tutorial', 'BUILD 0.3', 'Sala de pruebas',
      [(20, t_run), (22, t_switch), (18, t_safe), (18, t_air), (20, t_exit)],
      start_mode='snes', theme='debug', introDialog='tuto_intro')


# ---------------------------------------------------------------------------
# Mundo 1-1: La selva. Cambiar en el aire, murciélagos y parpadeo.
# ---------------------------------------------------------------------------

def w11_start(g, o):
    g.put(o + 2, 11, 'P')
    g.dialog(o + 5, 'w1_1')
    g.todo(o + 7, 4, 'TODO: PULIR HOJAS')
    g.fill(o + 12, o + 12, 8, 11, 'S')                 # muro de 16 bits: a 8 bits
    g.fill(o + 18, o + 23, 12, 13, '.'); g.fill(o + 18, o + 23, 12, 12, 'S')   # puente: a 16 bits
    g.fill(o + 30, o + 33, 11, 11, 'x')                # 4 espinas: parpadean a su altura en 8 bits
    g.put(o + 31, 9, '*')


def w11_stones(g, o):
    g.put(o + 1, 11, 'C')
    g.fill(o + 6, o + 15, 12, 13, '.')
    g.fill(o + 7, o + 8, 10, 10, 'N'); g.fill(o + 10, o + 12, 10, 10, 'S')
    g.put(o + 9, 7, '*')


def w11_bats(g, o):
    g.put(o + 1, 11, 'C')
    g.dialog(o + 3, 'w1_1_bats')
    g.todo(o + 4, 3, 'MURCIELAGOS: SIN DAÑO. OK')
    g.put(o + 6, 9, 'b')                               # primer murciélago, sobre suelo seguro
    g.put(o + 9, 9, 'b'); g.put(o + 12, 7, 'b'); g.put(o + 15, 5, 'b')
    g.fill(o + 18, o + 19, 5, 11, 'B'); g.put(o + 19, 4, '*')


def w11_flicker(g, o):
    g.put(o + 2, 11, 'C')
    g.fill(o + 8, o + 13, 11, 11, 'x')                 # 6 espinas
    g.todo(o + 6, 4, 'TODO: BORRAR ESPINAS 1989')
    g.put(o + 10, 8, 'b')


def w11_end(g, o):
    g.put(o + 1, 11, 'C')
    g.stairs(o + 6, [1, 2, 3, 3])
    g.fill(o + 10, o + 12, 12, 13, '.')
    g.put(o + 18, 11, 'F')


level('selva', 'MUNDO 1-1', 'La selva',
      [(38, w11_start), (20, w11_stones), (22, w11_bats), (18, w11_flicker), (22, w11_end)],
      start_mode='snes')


# ---------------------------------------------------------------------------
# Mundo 1-2: Ruinas del río. Agua (sólida en 8 bits, buceo en 16) y paredes rotas.
# ---------------------------------------------------------------------------

def w12_start(g, o):
    g.put(o + 2, 11, 'P')
    g.dialog(o + 4, 'w1_2')
    g.stairs(o + 6, [1, 2, 3])
    g.fill(o + 9, o + 10, 9, 11, '#')
    g.fill(o + 11, o + 22, 9, 12, '~')                # estanque
    g.fill(o + 16, o + 17, 0, 10, 'B')                # muro: se pasa buceando por debajo
    g.put(o + 19, 12, '*')
    g.fill(o + 23, o + 24, 9, 11, '#')
    g.stairs(o + 25, [3, 2, 1])


def w12_ruins(g, o):
    g.put(o + 1, 11, 'C')
    g.fill(o + 6, o + 7, 0, 11, 'W')                  # pared rota: 8 bits
    g.dialog(o + 6, 'w1_2_walls')
    g.todo(o + 1, 4, 'TODO: PARED ROTA (L. 212)')
    g.fill(o + 11, o + 11, 0, 11, 'N')                # muro de 8 bits: 16 bits
    g.fill(o + 15, o + 19, 8, 8, 'W')                 # repisa rota: en 8 bits se sube desde abajo
    g.put(o + 17, 7, '*')


def w12_river(g, o):
    g.put(o + 1, 11, 'C')
    g.stairs(o + 4, [1, 2, 3, 4])
    g.fill(o + 8, o + 8, 8, 11, '#')
    g.fill(o + 9, o + 24, 8, 12, '~')                 # río
    g.todo(o + 9, 3, 'TODO: SHADER DE AGUA')
    g.fill(o + 13, o + 14, 0, 9, 'B')
    g.fill(o + 18, o + 19, 12, 12, 'x')               # espinas bajo el agua
    g.fill(o + 21, o + 22, 0, 9, 'B')
    g.put(o + 17, 10, '*')
    g.fill(o + 25, o + 26, 8, 11, '#')
    g.stairs(o + 27, [3, 2, 1])


def w12_end(g, o):
    g.put(o + 1, 11, 'C')
    g.fill(o + 6, o + 7, 0, 11, 'W')
    g.put(o + 14, 11, 'F')


level('rio', 'MUNDO 1-2', 'Ruinas del rio',
      [(30, w12_start), (26, w12_ruins), (34, w12_river), (20, w12_end)],
      start_mode='snes')


# ---------------------------------------------------------------------------
# Mundo 1-3: Las copas. Ramas de la capa de fondo y murciélagos.
# ---------------------------------------------------------------------------

def w13_start(g, o):
    g.put(o + 2, 11, 'P')
    g.dialog(o + 4, 'w1_3')
    g.todo(o + 6, 4, 'TODO: QUITAR COLISION BG2')
    g.fill(o + 8, o + 19, 12, 13, '.')                # foso de 12
    g.fill(o + 8, o + 12, 12, 12, 'v')                # rama
    g.put(o + 14, 9, '*')


def w13_canopy(g, o):
    g.put(o + 1, 11, 'C')
    g.put(o + 6, 9, 'b'); g.put(o + 9, 7, 'b'); g.put(o + 12, 5, 'b')
    g.fill(o + 15, o + 27, 5, 5, 'B')                 # pasarela alta (16 bits, por los murciélagos)
    g.fill(o + 16, o + 26, 11, 11, 'x')               # 11 espinas abajo (8 bits: parpadean)
    g.put(o + 21, 4, '*')


def w13_double(g, o):
    g.put(o + 1, 11, 'C')
    g.fill(o + 5, o + 22, 12, 13, '.')                # foso de 18
    g.todo(o + 3, 3, 'NO DEJAR NADA ACTIVO')
    g.fill(o + 5, o + 9, 12, 12, 'v')                 # rama...
    g.fill(o + 15, o + 16, 11, 11, 'S')               # ...y plataformas de 16 bits
    g.fill(o + 19, o + 20, 10, 10, 'S')
    g.put(o + 17, 7, '*')


def w13_end(g, o):
    g.put(o + 1, 11, 'C')
    g.put(o + 12, 11, 'F')


level('copas', 'MUNDO 1-3', 'Las copas',
      [(26, w13_start), (30, w13_canopy), (30, w13_double), (18, w13_end)],
      start_mode='snes')


# ---------------------------------------------------------------------------
# Mundo 1-4: El parche. Alex quita el límite de sprites a mitad del nivel:
# las espinas dejan de parpadear en 8 bits y hay que buscar otra ruta.
# ---------------------------------------------------------------------------

def w14_start(g, o):
    g.put(o + 2, 11, 'P')
    g.dialog(o + 4, 'w1_4')
    g.todo(o + 6, 4, 'TODO: LIMITE 8 SPRITES')
    g.fill(o + 10, o + 15, 11, 11, 'x')               # 6 espinas: aún parpadean
    g.put(o + 12, 9, '*')
    g.put(o + 20, 11, 'C')
    g.dialog(o + 24, 'w1_4_patch', event='patchFlicker')


def w14_field(g, o):
    g.put(o + 1, 11, 'C')
    g.fill(o + 4, o + 29, 11, 11, 'x')                # campo de espinas (ya no parpadean)
    for i, c in enumerate(range(o + 5, o + 29, 4)):   # plataformas alternas: 8 bits, 16 bits...
        if i % 2 == 0:
            g.fill(c, c + 1, 10, 10, 'N')
        else:
            g.fill(c, c + 1, 9, 9, 'S')
    g.put(o + 16, 5, '*')


def w14_water(g, o):
    g.put(o + 1, 11, 'C')
    g.stairs(o + 4, [1, 2, 3, 4])
    g.fill(o + 8, o + 8, 8, 11, '#')
    g.fill(o + 9, o + 22, 8, 12, '~')
    g.fill(o + 14, o + 15, 0, 12, 'W')                # pared rota dentro del agua: 8 bits
    g.fill(o + 18, o + 19, 0, 9, 'B')                 # muro: bucear en 16 bits
    g.put(o + 16, 12, '*')
    g.note(o + 7, 1, 'SI ALGUIEN LEE\nESTO: EL MAPA NO\nTERMINA DONDE\nTERMINA EL JUEGO.\n\n      - M., 1989')   # primera nota de M.
    g.fill(o + 23, o + 24, 8, 11, '#')
    g.stairs(o + 25, [3, 2, 1])


def w14_end(g, o):
    g.put(o + 1, 11, 'C')
    g.dialog(o + 8, 'w1_4_end')
    g.todo(o + 4, 4, 'TODO: GRABAR MUNDO 1')
    g.put(o + 16, 11, 'F')


level('parche', 'MUNDO 1-4', 'El parche',
      [(30, w14_start), (34, w14_field), (30, w14_water), (24, w14_end)],
      start_mode='snes', worldEnd=1)


# ---------------------------------------------------------------------------

def main():
    out = ['// Generado por tools/build_levels.py. No editar a mano: editar el script y volver a generarlo.',
           'TN.LEVELS = [']
    for lv in LEVELS:
        rows = lv.pop('rows')
        out.append('  {')
        for k, v in lv.items():
            out.append(f'    {k}: {json.dumps(v, ensure_ascii=False)},')
        out.append('    rows: [')
        out += [f"      '{r}'," for r in rows]
        out.append('    ],')
        out.append('  },')
    out.append('];')
    path = os.path.join(os.path.dirname(__file__), '..', 'src', 'levels.js')
    with open(path, 'w') as f:
        f.write('\n'.join(out) + '\n')
    print('niveles:', ', '.join(f"{l['code']} ({l['id']})" for l in LEVELS))


if __name__ == '__main__':
    main()
