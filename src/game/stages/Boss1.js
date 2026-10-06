/**
 * Boss1 — LASER CANNON（強化版）
 * フェーズ0: 扇形弾
 * フェーズ1: 扇形弾 + 横方向追加弾
 * フェーズ2: 扇形弾 + 横弾 + 画面縦断連続弾
 */
import { Boss } from '../Boss.js';
import { LOGICAL_W } from '../../core/Renderer.js';

export class Boss1 extends Boss {
  constructor(bulletPool, audio) {
    super({
      name: 'LASER CANNON', hp: 2800, radius: 38,
      expValue: 0, scoreValue: 0,
      color: '#4af', glowColor: '#08f',
    });
    this._bulletPool  = bulletPool;
    this._audio       = audio;
    this._streamTimer = 0;   // 連続弾（Ph2）
  }

  _updateBehavior(delta, player) {
    this._moveHorizontal(delta, 2.0);

    if (this._attackTimer <= 0) {
      const interval = this.phase === 2 ? 1.0 : this.phase === 1 ? 1.8 : 2.5;
      this._attackTimer = interval;
      this._fireFan(player);
      if (this.phase >= 1) this._fireSide(player);
    }

    // フェーズ2: 縦貫通連続弾
    if (this.phase >= 2) {
      this._streamTimer -= delta;
      if (this._streamTimer <= 0) {
        this._streamTimer = 0.18;
        this._fireStream();
      }
    }
  }

  _fireFan(player) {
    if (!player) return;
    const count  = this.phase === 2 ? 9 : this.phase === 1 ? 7 : 5;
    const spread = 0.52;
    const base   = Math.atan2(player.y - this.y, player.x - this.x);
    const spd    = this.phase === 2 ? 320 : this.phase === 1 ? 280 : 220;
    for (let i = 0; i < count; i++) {
      const angle = base + (i - (count - 1) / 2) * spread;
      this._bulletPool.spawn(this.x, this.y + this.radius,
        Math.cos(angle) * spd, Math.sin(angle) * spd, 16, 6, '#4af', 10);
    }
  }

  _fireSide(player) {
    // 左右に広がる水平弾
    const spd = this.phase === 2 ? 300 : 240;
    const dmg = this.phase === 2 ? 18 : 14;
    [-1, 1].forEach(dir => {
      this._bulletPool.spawn(this.x, this.y,
        dir * spd, 60, dmg, 5, '#08f', 8);
    });
  }

  _fireStream() {
    // 自機 X にレーザーストリーム（縦方向連続小弾）
    this._bulletPool.spawn(this.x, this.y + this.radius,
      (Math.random() - 0.5) * 40, 350, 12, 4, '#0ff', 8);
  }

  _renderBody(ctx, x, y, r) {
    ctx.shadowColor = '#08f';
    ctx.shadowBlur  = 22;
    ctx.fillStyle   = '#4af';
    ctx.beginPath();
    ctx.moveTo(x,     y - r);
    ctx.lineTo(x + r, y);
    ctx.lineTo(x,     y + r);
    ctx.lineTo(x - r, y);
    ctx.closePath();
    ctx.fill();

    // 回転リング
    for (let i = 0; i < 4; i++) {
      const a = (Math.PI / 2) * i + this._animTimer * 2;
      const px = x + r * 0.65 * Math.cos(a);
      const py = y + r * 0.65 * Math.sin(a);
      ctx.shadowBlur = 8;
      ctx.fillStyle  = '#fff';
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#fff'; ctx.shadowBlur = 15;
    ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
  }
}
