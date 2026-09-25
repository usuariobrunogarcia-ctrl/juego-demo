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
  }

  update(input, level) {
    const P = TN.PHYSICS;

    const dir = (input.isDown('right') ? 1 : 0) - (input.isDown('left') ? 1 : 0);
    this.vx = dir * P.walkSpeed;
    if (dir !== 0) this.facing = dir;

    if (this.onGround && input.wasPressed('jump')) {
      this.vy = -P.jumpSpeed;
    }
    this.vy = Math.min(this.vy + P.gravity, P.maxFall);

    this.moveX(level);
    this.moveY(level);
  }

  // Movimiento separado por ejes: primero X, luego Y.
  moveX(level) {
    const T = TN.TILE;
    this.x += this.vx;
    if (!level.overlapsSolid(this.x, this.y, this.w, this.h)) return;
    if (this.vx > 0) {
      this.x = Math.floor((this.x + this.w - 0.001) / T) * T - this.w;
    } else if (this.vx < 0) {
      this.x = (Math.floor(this.x / T) + 1) * T;
    }
    this.vx = 0;
  }

  moveY(level) {
    const T = TN.TILE;
    this.y += this.vy;
    this.onGround = false;
    if (!level.overlapsSolid(this.x, this.y, this.w, this.h)) return;
    if (this.vy > 0) {
      this.y = Math.floor((this.y + this.h - 0.001) / T) * T - this.h;
      this.onGround = true;
    } else if (this.vy < 0) {
      this.y = (Math.floor(this.y / T) + 1) * T;
    }
    this.vy = 0;
  }
};
