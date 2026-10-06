/**
 * Boss2 — MISSILE CARRIER（強化版）
 * フェーズ0: ホーミングミサイル
 * フェーズ1: ミサイル + 8方向散弾
 * フェーズ2: ミサイル + 12方向散弾 + 高速直進弾
 */
import { Boss } from '../Boss.js';
import { LOGICAL_W } from '../../core/Renderer.js';

class HomingMissile {
  constructor(x, y, target) {
    this.x = x; this.y = y;
    this.target = target;
    this.vx = 0; this.vy = -120;
    this.speed = 200;
    this.radius = 7;
    this.dmg = 22;
    this.isActive = true;
    this._life = 4.0;
    this.color = '#f84';
  }

  update(delta) {
    this._life -= delta;
    if (this._life <= 0) { this.isActive = false; return; }
    if (this.target) {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const dist = Math.hypot(dx, dy) || 1;
      const tx = (dx / dist) * this.speed;
      const ty = (dy / dist) * this.speed;
      this.vx += (tx - this.vx) * delta * 4;
      this.vy += (ty - this.vy) * delta * 4;
    }
    this.x += this.vx * delta;
    this.y += this.vy * delta;
  }

  render(ctx) {
    if (!this.isActive) return;
    ctx.save();
    ctx.shadowColor = this.color; ctx.shadowBlur = 12;
    ctx.fillStyle = this.color;
    const angle = Math.atan2(this.vy, this.vx) + Math.PI / 2;
    ctx.translate(this.x, this.y); ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, -9); ctx.lineTo(-4, 7); ctx.lineTo(4, 7);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
}

export class Boss2 extends Boss {
  constructor(bulletPool, audio) {
    super({
      name: 'MISSILE CARRIER', hp: 3500, radius: 42,
      expValue: 0, scoreValue: 0,
      color: '#f84', glowColor: '#f40',
    });
    this._bulletPool  = bulletPool;
    this._audio       = audio;
    this._missiles    = [];
    this._rapidTimer  = 0;
  }

  _updateBehavior(delta, player) {
    this._moveHorizontal(delta, 1.8);

    if (this._attackTimer <= 0) {
      const interval = this.phase === 2 ? 1.5 : this.phase === 1 ? 2.2 : 3.0;
      this._attackTimer = interval;
      this._spawnMissiles(player);
      this._fireScatter(player);
    }

    // フェーズ2: 高速直進弾を連射
    if (this.phase >= 2) {
      this._rapidTimer -= delta;
      if (this._rapidTimer <= 0) {
        this._rapidTimer = 0.35;
        this._fireRapid(player);
      }
    }

    for (const m of this._missiles) {
      m.update(delta);
      if (player && m.isActive) {
        const dx = m.x - player.x, dy = m.y - player.y;
        if (dx * dx + dy * dy < (m.radius + player.radius) ** 2) {
          player.takeDamage(m.dmg);
          m.isActive = false;
        }
      }
    }
    this._missiles = this._missiles.filter(m => m.isActive);
  }

  _spawnMissiles(player) {
    const count = this.phase === 2 ? 6 : this.phase === 1 ? 4 : 3;
    for (let i = 0; i < count; i++) {
      const offsetX = (i - Math.floor(count / 2)) * 22;
      this._missiles.push(new HomingMissile(this.x + offsetX, this.y + this.radius, player));
    }
  }

  _fireScatter(player) {
    if (this.phase < 1) return;
    const count = this.phase === 2 ? 12 : 8;
    const spd   = this.phase === 2 ? 260 : 200;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i;
      this._bulletPool.spawn(this.x, this.y,
        Math.cos(angle) * spd, Math.sin(angle) * spd,
        12, 5, '#f84', 9);
    }
  }

  _fireRapid(player) {
    if (!player) return;
    const dx = player.x - this.x, dy = player.y - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    this._bulletPool.spawn(this.x, this.y + this.radius,
      (dx / dist) * 380, (dy / dist) * 380,
      15, 4, '#ff8', 7);
  }

  update(delta, player) { super.update(delta, player); }
  render(ctx) {
    for (const m of this._missiles) m.render(ctx);
    super.render(ctx);
  }

  _renderBody(ctx, x, y, r) {
    ctx.shadowColor = '#f40'; ctx.shadowBlur = 22;
    ctx.fillStyle   = '#f84';
    ctx.beginPath();
    ctx.moveTo(x - r * 0.7, y - r); ctx.lineTo(x + r * 0.7, y - r);
    ctx.lineTo(x + r, y + r * 0.5); ctx.lineTo(x - r, y + r * 0.5);
    ctx.closePath(); ctx.fill();
    for (let i = -1; i <= 1; i++) {
      ctx.fillStyle = '#c63';
      ctx.fillRect(x + i * r * 0.55 - 4, y + r * 0.2, 8, 20);
    }
    ctx.shadowBlur = 15; ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(x, y - 5, 8, 0, Math.PI * 2); ctx.fill();
  }
}
