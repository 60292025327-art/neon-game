/**
 * Boss6 — OMEGA DESTROYER（強化版・最終ボス）
 * フェーズ0: ターゲットバースト(7発) + スパイラル
 * フェーズ1: バースト(12発) + スパイラル + 予告爆発
 * フェーズ2: 全攻撃同時 + 常時ランダム弾幕 + 予告爆発2連
 */
import { Boss } from '../Boss.js';
import { LOGICAL_W, LOGICAL_H } from '../../core/Renderer.js';

export class Boss6 extends Boss {
  constructor(bulletPool, audio, particles) {
    super({
      name: 'OMEGA DESTROYER', hp: 7000, radius: 50,
      expValue: 0, scoreValue: 0,
      color: '#f04', glowColor: '#a00',
    });
    this._bulletPool  = bulletPool;
    this._audio       = audio;
    this._particles   = particles;
    this._warnList    = [];   // [{timer, x}]
    this._spiralAngle = 0;
    this._spiralTimer = 0;
    this._randomTimer = 0;
  }

  _updateBehavior(delta, player) {
    this._moveHorizontal(delta, 2.8);

    this._spiralAngle += delta * (this.phase + 1) * 1.8;

    // メイン攻撃タイマー
    if (this._attackTimer <= 0) {
      const interval    = this.phase === 2 ? 1.6 : this.phase === 1 ? 2.2 : 3.0;
      this._attackTimer = interval;
      this._fireTargetedBurst(player);
    }

    // スパイラル（フェーズ0から）
    this._spiralTimer -= delta;
    if (this._spiralTimer <= 0) {
      this._spiralTimer = this.phase === 2 ? 0.6 : this.phase === 1 ? 0.9 : 1.2;
      this._fireSpiral();
    }

    // フェーズ1: 予告爆発追加
    if (this.phase >= 1) {
      // 攻撃と同タイミングで予告を追加設置
      if (this._attackTimer <= 0.05 && this._attackTimer >= -0.05) {
        const count = this.phase === 2 ? 2 : 1;
        for (let i = 0; i < count; i++) {
          const wx = player ? player.x + (Math.random() - 0.5) * 80 : LOGICAL_W / 2;
          this._warnList.push({ timer: this.phase === 2 ? 0.7 : 1.0, x: wx });
        }
      }
    }

    // フェーズ2: 常時ランダム弾幕
    if (this.phase >= 2) {
      this._randomTimer -= delta;
      if (this._randomTimer <= 0) {
        this._randomTimer = 0.22;
        this._fireRandom();
      }
    }

    // 予告爆発更新
    for (const w of this._warnList) {
      w.timer -= delta;
      if (w.timer <= 0) {
        this._explosionAt(w.x, player);
      }
    }
    this._warnList = this._warnList.filter(w => w.timer > 0);
  }

  _fireTargetedBurst(player) {
    if (!player) return;
    const count  = this.phase === 2 ? 14 : this.phase === 1 ? 10 : 7;
    const spread = 0.55;
    const base   = Math.atan2(player.y - this.y, player.x - this.x);
    const spd    = this.phase >= 1 ? 290 : 240;
    for (let i = 0; i < count; i++) {
      const angle = base + (i - (count - 1) / 2) * spread;
      this._bulletPool.spawn(this.x, this.y + this.radius,
        Math.cos(angle) * spd, Math.sin(angle) * spd,
        16, 6, '#f44', 12);
    }
  }

  _fireSpiral() {
    const count = this.phase === 2 ? 16 : 10;
    const spd   = this.phase >= 1 ? 230 : 180;
    for (let i = 0; i < count; i++) {
      const angle = this._spiralAngle + (Math.PI * 2 / count) * i;
      this._bulletPool.spawn(this.x, this.y,
        Math.cos(angle) * spd, Math.sin(angle) * spd,
        12, 5, '#f80', 9);
    }
  }

  _fireRandom() {
    const angle = Math.random() * Math.PI * 2;
    this._bulletPool.spawn(
      this.x + (Math.random() - 0.5) * 60, this.y,
      Math.cos(angle) * 260, Math.sin(angle) * 260,
      10, 5, '#f44', 8);
  }

  _explosionAt(wx, player) {
    if (this._particles) {
      this._particles.emit(wx, LOGICAL_H * 0.45, {
        count: 36, speed: 220, spread: Math.PI * 2,
        colors: ['#f44', '#f84', '#ff0', '#fff'],
        radius: 5, radiusVar: 3, lifetime: 1.0,
      });
    }
    const count = this.phase === 2 ? 20 : 16;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i;
      this._bulletPool.spawn(wx, LOGICAL_H * 0.4,
        Math.cos(angle) * 280, Math.sin(angle) * 280,
        18, 6, '#f44', 12);
    }
  }

  render(ctx) {
    // 予告マーカー
    for (const w of this._warnList) {
      const alpha = 0.4 + Math.sin(Date.now() * 0.025) * 0.35;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = '#f44'; ctx.shadowBlur = 18;
      ctx.strokeStyle = '#f44'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w.x, 0); ctx.lineTo(w.x, LOGICAL_H);
      ctx.stroke();
      // 警告三角
      ctx.fillStyle = '#f44'; ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(w.x, 50); ctx.lineTo(w.x - 10, 30); ctx.lineTo(w.x + 10, 30);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    super.render(ctx);
  }

  _renderBody(ctx, x, y, r) {
    ctx.shadowColor = '#a00'; ctx.shadowBlur = 28;
    ctx.fillStyle   = '#f04';
    ctx.beginPath();
    const sides = 10;
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 / sides) * i + this._animTimer * 1.2;
      const rr = r * (0.65 + Math.sin(i * 2.3 + this._animTimer * 4) * 0.35);
      const px = x + rr * Math.cos(angle), py = y + rr * Math.sin(angle);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
    // 内側リング
    ctx.shadowBlur = 14; ctx.strokeStyle = 'rgba(255,100,0,0.6)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, r * 0.55, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#ff4'; ctx.shadowBlur = 22;
    ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
  }
}
