// El explorador. La caja de colisión es más pequeña que el tile para que
// pasar por huecos de un tile sea cómodo.
TN.Player = class {
  constructor(level) {
    this.w = 12;
    this.h = 14;
    this.respawn(level);
  }

  respawn(level) {
    const T = TN.TILE;
    this.x = level.spawn.x * T + (T - this.w) / 2;
    this.y = (level.spawn.y + 1) * T - this.h;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.facing = 1;
    this.shake = 0;
  }

  update(input, level, mode) {
    const P = TN.PHYSICS[mode];
    const dir = (input.isDown('right') ? 1 : 0) - (input.isDown('left') ? 1 : 0);
    if (dir !== 0) this.facing = dir;

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
    }
    // Salto variable (solo 16 bits): soltar el botón corta la subida.
    if (mode === 'snes' && this.vy < P.jumpCut && !input.isDown('jump')) {
      this.vy = P.jumpCut;
    }
    this.vy = Math.min(this.vy + P.gravity, P.maxFall);

    this.moveX(level, mode);
    this.moveY(level, mode);

    if (this.shake > 0) this.shake--;
  }

  // Movimiento separado por ejes: primero X, luego Y.
  moveX(level, mode) {
    const T = TN.TILE;
    this.x += this.vx;
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
    this.y += this.vy;
    this.onGround = false;
    if (!level.overlapsSolid(this.x, this.y, this.w, this.h, mode)) return;
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
