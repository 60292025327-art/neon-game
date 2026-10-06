/**
 * Boss4 — TIME WATCHER（強化版）
 * フェーズ0: スパイラルバースト
 * フェーズ1: スパイラル + 自機狙い高速弾
 * フェーズ2: スパイラル + 3方向自機狙い + 逆回転バースト同時発射
 */
import { Boss } from '../Boss.js';

export class Boss4 extends Boss {
  constructor(bulletPool, audio) {
    super({
      name: 'TIME WATCHER', hp: 4800, radius: 40,
      expValue: 0, scoreValue: 0,
      color: '#0f8', glowColor: '#0c6',
    });
    this._bulletPool  = bulletPool;
    this._audio       = audio;
    this._spiralAngle = 0;
    this._aimTimer    = 0;
  }

  _updateBehavior(delta, player) {
    this._moveHorizontal(delta, 2.5);

    this._spiralAngle += delta * (this.phase + 1) * 2.2;

    if (this._attackTimer <= 0) {
      const interval    = this.phase === 2 ? 1.0 : this.phase === 1 ? 1.8 : 2.5;
      this._attackTimer = interval;
      this._fireSpiralBurst();
      if (this.phase >= 2) this._fireSpiralBurst(true);  // 逆回転
    }

    // フェーズ1以降: 自機狙い弾を別タイマーで連射
    if (this.phase >= 1) {
      this._aimTimer -= delta;
      if (this._aimTimer <= 0) {
        this._aimTimer = this.phase === 2 ? 0.5 : 0.8;
        this._fireAimed(player);
      }
    }
  }

  _fireSpiralBurst(reverse = false) {
    const count = this.phase === 2 ? 24 : this.phase === 1 ? 18 : 14;
    const spd   = this.phase === 2 ? 280 : this.phase === 1 ? 240 : 180;
    const offset = reverse ? Math.PI / count : 0;
    for (let i = 0; i < count; i++) {
      const angle = this._spiralAngle + (Math.PI * 2 / count) * i + offset;
      this._bulletPool.spawn(this.x, this.y,
        Math.cos(angle) * spd, Math.sin(angle) * spd,
        13, 5, reverse ? '#0cf' : '#0f8', 9);
    }
  }

  _fireAimed(player) {
    if (!player) return;
    const spread = this.phase === 2 ? 3 : 1;
    const spd    = this.phase === 2 ? 340 : 280;
    const base   = Math.atan2(player.y - this.y, player.x - this.x);
    const count  = this.phase === 2 ? 3 : 1;
    for (let i = 0; i < count; i++) {
      const angle = base + (i - Math.floor(count / 2)) * 0.22;
      this._bulletPool.spawn(this.x, this.y,
        Math.cos(angle) * spd, Math.sin(angle) * spd,
        16, 5, '#ff0', 9);
    }
  }

  _renderBody(ctx, x, y, r) {
    ctx.shadowColor = '#0c6'; ctx.shadowBlur = 18;
    for (let ring = 0; ring < 2; ring++) {
      const rr  = r * (ring === 0 ? 1 : 0.6);
      const rot = this._animTimer * (ring === 0 ? 1.5 : -2.5);
      ctx.strokeStyle = ring === 0 ? '#0f8' : '#4fc'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < (ring === 0 ? 12 : 8); i++) {
        const a = (Math.PI * 2 / (ring === 0 ? 12 : 8)) * i + rot;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * (rr - 7), y + Math.sin(a) * (rr - 7));
        ctx.lineTo(x + Math.cos(a) * rr,        y + Math.sin(a) * rr);
        ctx.stroke();
      }
    }
    ctx.fillStyle = '#0f8'; ctx.shadowBlur = 15;
    ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.shadowBlur = 5;
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
  }
}
