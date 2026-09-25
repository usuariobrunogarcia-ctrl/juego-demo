// El explorador. La caja de colisión es más pequeña que el tile para que
// pasar por huecos de un tile sea cómodo.
TN.Player = class {
  constructor(level) {
    this.w = 12;
    this.h = 14;
    this.respawn(level.spawn);
  }

  // Coloca al explorador de pie sobre el tile indicado (en coordenadas de tile).
  respawn(point) {
    const T = TN.TILE;
    this.x = point.x * T + (T - this.w) / 2;
    this.y = (point.y + 1) * T - this.h;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.facing = 1;
    this.shake = 0;
    this.clipping = false;
    this.swimming = false;
    this.animDistance = 0;
  }

  update(input, level, mode) {
    this.event = null; // 'jump' o 'stroke', para los efectos de sonido
    const P = TN.PHYSICS[mode];
    const dir = (input.isDown('right') ? 1 : 0) - (input.isDown('left') ? 1 : 0);
    if (dir !== 0) this.facing = dir;

    this.swimming = mode === 'snes' && level.overlapsTile(this.x, this.y + this.h / 2, this.w, this.h / 2, '~');
    if (this.swimming) {
      this.swim(input, level, mode, dir);
      return;
    }

    if (mode === 'nes') {
      // En 8 bits la velocidad es instantánea en el suelo y, una vez en el aire,
      // la trayectoria queda fijada. Si se entra en el aire con la velocidad de
      // carrera de 16 bits, se conserva: así nace el "salto largo fijado".
      if (this.onGround) this.vx = dir * P.walkSpeed;
    } else {
      const max = input.isDown('run') ? P.runSpeed : P.walkSpeed;
      if (dir !== 0) {
        const accel = this.onGround ? P.accel : P.airAccel;
        this.vx = approach(this.vx, dir * max, accel);
      } else if (this.onGround) {
        this.vx = approach(this.vx, 0, P.friction);
      }
    }

    if (this.onGround && input.wasPressed('jump')) {
      this.vy = -P.jumpSpeed;
      this.event = 'jump';
    }
    // Salto variable (solo 16 bits): soltar el botón corta la subida.
    if (mode === 'snes' && this.vy < P.jumpCut && !input.isDown('jump')) {
      this.vy = P.jumpCut;
    }
    this.vy = Math.min(this.vy + P.gravity, P.maxFall);

    // Glitch de 8 bits: dentro de una pared rota el explorador avanza a trompicones.
    this.clipping = mode === 'nes' && level.overlapsTile(this.x, this.y, this.w, this.h, 'W');

    this.moveX(level, mode);
    this.moveY(level, mode);

    if (this.shake > 0) this.shake--;
    // La animación de caminar avanza según la distancia recorrida.
    this.animDistance = this.onGround ? this.animDistance + Math.abs(this.vx) : 0;
  }

  swim(input, level, mode, dir) {
    const W = TN.WATER;
    this.vx = approach(this.vx, dir * W.speed, W.accel);
    if (input.wasPressed('jump')) {
      const headOut = !level.overlapsTile(this.x, this.y - 4, this.w, 4, '~');
      this.vy = headOut ? -W.exitSpeed : -W.strokeSpeed;
      this.event = 'stroke';
    }
    this.vy = Math.min(this.vy + W.gravity, W.maxFall);
    this.clipping = false;
    this.moveX(level, mode);
    this.moveY(level, mode);
    if (this.shake > 0) this.shake--;
    this.animDistance += Math.abs(this.vx) + Math.abs(this.vy);
  }

  // Nombre del fotograma que toca dibujar en el modo dado.
  frameName(mode) {
    const sprite = TN.SPRITES[mode];
    if (this.swimming) return sprite.walkCycle[Math.floor(this.animDistance / 8) % sprite.walkCycle.length];
    if (!this.onGround) return 'jump';
    if (Math.abs(this.vx) < 0.05) return 'idle';
    const cycle = sprite.walkCycle;
    return cycle[Math.floor(this.animDistance / sprite.stepPixels) % cycle.length];
  }

  // Movimiento separado por ejes: primero X, luego Y.
  moveX(level, mode) {
    const T = TN.TILE;
    this.x += this.clipping ? this.vx * 0.5 : this.vx;
    if (!level.overlapsSolid(this.x, this.y, this.w, this.h, mode)) return;
    if (this.vx > 0) {
      this.x = Math.floor((this.x + this.w - 0.001) / T) * T - this.w;
    } else if (this.vx < 0) {
      this.x = (Math.floor(this.x / T) + 1) * T;
    }
    this.vx = 0;
  }

  moveY(level, mode) {
    const T = TN.TILE;
    const prevBottom = this.y + this.h;
    this.y += this.vy;
    this.onGround = false;
    if (!level.overlapsSolid(this.x, this.y, this.w, this.h, mode)) {
      const top = this.vy > 0 ? level.oneWayTop(this.x, this.w, prevBottom, this.y + this.h, mode) : null;
      if (top !== null) {
        this.y = top - this.h;
        this.vy = 0;
        this.onGround = true;
      }
      return;
    }
    if (this.vy > 0) {
      this.y = Math.floor((this.y + this.h - 0.001) / T) * T - this.h;
      this.onGround = true;
    } else if (this.vy < 0) {
      this.y = (Math.floor(this.y / T) + 1) * T;
    }
    this.vy = 0;
  }
};

function approach(value, target, step) {
  if (value < target) return Math.min(value + step, target);
  return Math.max(value - step, target);
}
