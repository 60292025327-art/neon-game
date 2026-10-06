/**
 * ParticleSystem — パーティクルのオブジェクトプール管理
 */

const POOL_SIZE = 512;

class Particle {
  constructor() {
    this.isActive = false;
    this.x = 0; this.y = 0;
    this.vx = 0; this.vy = 0;
    this.life = 0;       // 残り寿命（秒）
    this.maxLife = 0;
    this.radius = 3;
    this.color = '#fff';
    this.gravity = 0;
  }

  reset(x, y, vx, vy, life, radius, color, gravity = 0) {
    this.isActive = true;
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.radius = radius;
    this.color = color;
    this.gravity = gravity;
  }
}

export class ParticleSystem {
  constructor() {
    this._pool = Array.from({ length: POOL_SIZE }, () => new Particle());
  }

  /**
   * パーティクルを一括放出する
   * @param {number} x, y  発生座標
   * @param {{
   *   count: number,
   *   speed: number,
   *   spread: number,   // 放射角度範囲 (rad)、Math.PI*2 で全方向
   *   baseAngle: number, // 基準角度 (rad)
   *   colors: string[],
   *   radius: number,
   *   radiusVar: number, // 半径ばらつき
   *   lifetime: number,
   *   lifetimeVar: number,
   *   gravity: number,
   * }} opts
   */
  emit(x, y, opts = {}) {
    const {
      count      = 8,
      speed      = 80,
      spread     = Math.PI * 2,
      baseAngle  = -Math.PI / 2,
      colors     = ['#fff'],
      radius     = 3,
      radiusVar  = 1,
      lifetime   = 0.5,
      lifetimeVar = 0.2,
      gravity    = 30,
    } = opts;

    for (let i = 0; i < count; i++) {
      const angle = baseAngle + (Math.random() - 0.5) * spread;
      const spd   = speed * (0.5 + Math.random() * 0.5);
      const vx    = Math.cos(angle) * spd;
      const vy    = Math.sin(angle) * spd;
      const r     = Math.max(0.5, radius + (Math.random() - 0.5) * radiusVar * 2);
      const life  = lifetime + (Math.random() - 0.5) * lifetimeVar * 2;
      const color = colors[Math.floor(Math.random() * colors.length)];

      for (const p of this._pool) {
        if (!p.isActive) {
          p.reset(x, y, vx, vy, life, r, color, gravity);
          break;
        }
      }
    }
  }

  /** 全パーティクルを消去 */
  clear() {
    for (const p of this._pool) p.isActive = false;
  }

  update(delta) {
    for (const p of this._pool) {
      if (!p.isActive) continue;
      p.life -= delta;
      if (p.life <= 0) {
        p.isActive = false;
        continue;
      }
      p.vx *= (1 - 2 * delta);   // 空気抵抗
      p.vy *= (1 - 2 * delta);
      p.vy += p.gravity * delta;
      p.x  += p.vx * delta;
      p.y  += p.vy * delta;
    }
  }

  render(ctx) {
    for (const p of this._pool) {
      if (!p.isActive) continue;
      const alpha = p.life / p.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = p.color;
      ctx.shadowBlur  = p.radius * 2;
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * alpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
