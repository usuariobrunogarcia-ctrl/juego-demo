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

    def dialog(self, c, id):
        """Diálogo que empieza cuando el jugador pasa por la columna c."""
        self.dialogs.append({'tx': c, 'id': id})

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


def level(id, code, name, sections, start_mode='nes', switch=True, theme='jungle'):
    g = build(sections)
    LEVELS.append({
        'id': id, 'code': code, 'name': name, 'startMode': start_mode,
        'switchUnlocked': switch, 'theme': theme, 'rows': g.rows(),
        'hints': g.hints, 'dialogs': g.dialogs,
    })


# ---------------------------------------------------------------------------
# Mundo 1-1: La selva (provisional: el nivel de demostración de la fase 1)
# ---------------------------------------------------------------------------

def s_switch(g, o):
    g.put(o + 2, 11, 'P')
    g.dialog(o + 5, 'selva_intro')
    g.fill(o + 14, o + 14, 8, 11, 'N')
    g.hint(o + 12, 9, ['X'], 'switch')
    g.fill(o + 22, o + 27, 12, 13, '.'); g.fill(o + 22, o + 27, 12, 12, 'S')
    g.fill(o + 32, o + 32, 8, 11, 'S')
    g.fill(o + 38, o + 46, 12, 13, '.'); g.fill(o + 39, o + 40, 10, 10, 'N'); g.fill(o + 42, o + 43, 10, 10, 'S')
    g.put(o + 41, 8, '*')
    g.fill(o + 52, o + 56, 0, 8, 'B'); g.fill(o + 52, o + 56, 9, 11, 'N'); g.fill(o + 58, o + 59, 0, 11, 'S')


def s_flicker(g, o):
    g.put(o + 1, 11, 'C')
    g.fill(o + 5, o + 11, 11, 11, 'x'); g.put(o + 8, 9, '*')
    g.put(o + 22, 11, 'C')
    g.fill(o + 30, o + 32, 11, 11, 'x')
    g.put(o + 44, 11, 'C')
    g.fill(o + 52, o + 55, 11, 11, 'x')


def s_clip(g, o):
    g.put(o + 1, 11, 'C')
    g.fill(o + 6, o + 7, 0, 11, 'W')
    g.fill(o + 14, o + 18, 9, 9, 'W')
    g.fill(o + 22, o + 25, 0, 11, 'W'); g.put(o + 23, 11, '*')


def s_branch(g, o):
    g.put(o + 1, 11, 'C')
    g.fill(o + 5, o + 16, 12, 13, '.')
    g.fill(o + 5, o + 9, 12, 12, 'v')


def s_water(g, o):
    g.put(o + 1, 11, 'C')
    g.stairs(o + 4, [1, 2, 3, 4])
    g.fill(o + 8, o + 8, 8, 11, '#')
    g.fill(o + 9, o + 20, 8, 12, '~')
    g.fill(o + 14, o + 15, 0, 10, 'B'); g.put(o + 15, 12, '*')
    g.fill(o + 21, o + 22, 8, 11, '#')
    g.stairs(o + 23, [3, 2, 1])


def s_bats(g, o):
    g.put(o + 1, 11, 'C')
    g.put(o + 6, 9, 'b'); g.put(o + 9, 7, 'b'); g.put(o + 12, 5, 'b')
    g.fill(o + 15, o + 16, 3, 11, 'B'); g.put(o + 16, 2, '*')


def s_combo(g, o):
    g.put(o + 1, 11, 'C')
    g.fill(o + 4, o + 9, 12, 13, '.'); g.fill(o + 4, o + 9, 12, 12, 'S')
    g.fill(o + 12, o + 13, 0, 11, 'W')
    g.fill(o + 17, o + 21, 11, 11, 'x')
    g.put(o + 25, 11, 'C')
    g.fill(o + 28, o + 39, 12, 13, '.'); g.fill(o + 28, o + 32, 12, 12, 'v')
    g.put(o + 34, 8, '*')


def s_end(g, o):
    g.put(o + 1, 11, 'C')
    g.fill(o + 4, o + 5, 9, 9, 'B')
    g.fill(o + 8, o + 10, 12, 13, '.')
    g.stairs(o + 14, [1, 2, 3, 3])
    g.put(o + 28, 11, 'F')


level('selva', '1-1', 'La selva', [
    (62, s_switch), (62, s_flicker), (30, s_clip), (22, s_branch),
    (30, s_water), (26, s_bats), (44, s_combo), (34, s_end),
])


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
