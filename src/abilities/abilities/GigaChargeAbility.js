/**
 * GigaChargeAbility — B5: ギガチャージ
 * 1.5秒チャージ後、360度全方向に弾幕を発射する
 */
import { LOGICAL_W, LOGICAL_H } from '../../core/Renderer.js';

export class GigaChargeAbility {
  constructor(id) {
    this.id        = id;
    this.name      = 'ギガチャージ';
    this.gaugeCost = 70;
    this.duration  = 4.0;
    this._timer    = 0;
    this._chargeTime = 1.5;
    this._charged  = false;
    this.isFinished = false;
    this._chargeAnim = 0;
  }

  onActivate(gameState, stats) {
    this._timer    = this.duration;
    this._charged  = false;
    this.isFinished = false;
    this._chargeAnim = 0;
    this._power = stats.abilityPower;
    this._playerBulletPool = gameState.playerBullets;
  }

  onUpdate(delta, gameState) {
    this._timer -= delta;
    this._chargeAnim += delta;

    if (this._timer <= 0) {
      this.isFinished = true;
      return;
    }

    // チャージ完了 → 弾幕発射
    if (!this._charged && this._timer <= this.duration - this._chargeTime) {
      this._charged = true;
      this._fireSpread(gameState);
    }
  }

  _fireSpread(gameState) {
    const p = gameState.player;
    if (!p) return;
    const count = 24;
    const dmg   = Math.ceil(25 * this._power);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i;
      const spd   = 300;
      this._playerBulletPool.spawn(
        p.x, p.y,
        Math.cos(angle) * spd,
        Math.sin(angle) * spd,
        dmg, 5, '#fa0', 12, false
      );
    }
  }

  onDeactivate(gameState) {}

  renderEffect(ctx, gameState) {
    const p = gameState.player;
    if (!p) return;

    if (!this._charged) {
      // チャージ中: プレイヤー周囲に収束するオーラ
      const progress = this._chargeAnim / this._chargeTime;
      const r = 50 - progress * 30;
      ctx.save();
      ctx.globalAlpha = progress * 0.8;
      ctx.shadowColor = '#fa0';
      ctx.shadowBlur  = 30;
      ctx.strokeStyle = '#fa0';
      ctx.lineWidth   = 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.font      = 'bold 14px Courier New';
      ctx.fillStyle = '#fa0';
      ctx.textAlign = 'center';
      ctx.fillText('CHARGING...', p.x, p.y - 30);
      ctx.restore();
    } else {
      // 発射後: フラッシュ
      const alpha = (this._timer / this.duration) * 0.5;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = '#fa0';
      ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
      ctx.restore();
    }
  }
}
