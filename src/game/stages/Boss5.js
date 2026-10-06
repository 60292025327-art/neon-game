/**
 * Boss5 — GIGA CHARGER（強化版）
 * フェーズ0: チャージ→全方向24発
 * フェーズ1: チャージ→全方向32発+高速扇形
 * フェーズ2: チャージ→全方向40発 + 常時自機狙い3WAY連射
 */
import { Boss } from '../Boss.js';
import { LOGICAL_W } from '../../core/Renderer.js';

export class Boss5 extends Boss {
  constructor(bulletPool, audio) {
    super({
      name: 'GIGA CHARGER', hp: 5200, radius: 46,
      expValue: 0, scoreValue: 0,
      color: '#fa0', glowColor: '#c70',
    });
    this._bulletPool  = bulletPool;
    this._audio       = audio;
    this._charging    = false;
    this._chargeTimer = 0;
    this._chargeMax   = 1.5;
    this._wayTimer    = 0;
  }

  _updateBehavior(delta, player) {
    this._moveHorizontal(delta, 1.5);

    if (this._attackTimer <= 0) {
      const interval    = this.phase === 2 ? 1.8 : this.phase === 1 ? 2.8 : 4.0;
      this._attackTimer = interval;
      this._charging    = true;
      this._chargeTimer = this._chargeMax;
    }

    if (this._charging) {
      this._chargeTimer -= delta;
      if (this._chargeTimer <= 0) {
        this._charging = false;
        this._fireGigaBlast(player);
      }
    }

    // フェーズ2: 常時3WAY自機狙い
    if (this.phase >= 2) {
      this._wayTimer -= delta;
      if (this._wayTimer <= 0) {
        this._wayTimer = 0.4;
        this._fire3Way(player);
      }
    }
  }

  _fireGigaBlast(player) {
    const count = this.phase === 2 ? 40 : this.phase === 1 ? 32 : 24;
    const spd   = this.phase >= 1 ? 300 : 230;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i;
      this._bulletPool.spawn(this.x, this.y,
        Math.cos(angle) * spd, Math.sin(angle) * spd,
        16, 6, '#fa0', 12);
    }
    // フェーズ1以降: 高速扇形追加
    if (this.phase >= 1 && player) {
      const base = Math.atan2(player.y - this.y, player.x - this.x);
      for (let i = -2; i <= 2; i++) {
        const angle = base + i * 0.28;
        this._bulletPool.spawn(this.x, this.y,
          Math.cos(angle) * 380, Math.sin(angle) * 380,
          18, 5, '#ff0', 11);
      }
    }
  }

  _fire3Way(player) {
    if (!player) return;
    const base = Math.atan2(player.y - this.y, player.x - this.x);
    for (let i = -1; i <= 1; i++) {
      const angle = base + i * 0.2;
      this._bulletPool.spawn(this.x, this.y,
        Math.cos(angle) * 300, Math.sin(angle) * 300,
        14, 5, '#fa4', 9);
    }
  }

  _renderBody(ctx, x, y, r) {
    const glow = this._charging ? this._chargeMax - this._chargeTimer : 0;
    ctx.shadowColor = '#c70';
    ctx.shadowBlur  = 20 + glow * 35;
    ctx.fillStyle   = `hsl(${40 - glow * 40}, 100%, ${50 + glow * 30}%)`;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 / 5) * i - Math.PI / 2 + this._animTimer * 0.6;
      const rr = i % 2 === 0 ? r : r * 0.45;
      const px = x + rr * Math.cos(angle), py = y + rr * Math.sin(angle);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
    if (this._charging) {
      ctx.globalAlpha = glow * 0.65;
      ctx.strokeStyle = '#ff0'; ctx.lineWidth = 4; ctx.shadowBlur = 28;
      ctx.beginPath(); ctx.arc(x, y, r * (1 + glow * 0.35), 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = '#fff'; ctx.shadowBlur = 15;
    ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
  }
}
