/**
 * LaserAbility — B1: 貫通レーザー
 */
import { LOGICAL_W, LOGICAL_H } from '../../core/Renderer.js';

export class LaserAbility {
  constructor(id) {
    this.id        = id;
    this.name      = '貫通レーザー';
    this.gaugeCost = 60;
    this.duration  = 1.5;
    this._timer    = 0;
    this.isFinished = false;
    this._damage   = 0;
    this._damageTimer = 0;
  }

  onActivate(gameState, stats) {
    this._timer       = this.duration;
    this._damageTimer = 0;
    this.isFinished   = false;
    this._power = stats.abilityPower;
    this._x = gameState.player.x;
  }

  onUpdate(delta, gameState) {
    this._timer -= delta;
    if (this._timer <= 0) { this.isFinished = true; return; }

    // 連続ダメージ（0.05秒ごと）
    this._damageTimer -= delta;
    if (this._damageTimer <= 0) {
      this._damageTimer = 0.05;
      const dmg = Math.ceil(15 * this._power);
      for (const e of gameState.enemies) {
        if (!e.isActive) continue;
        // X 座標がレーザー幅内なら当たり
        if (Math.abs(e.x - this._x) < 20 + e.radius) {
          e.takeDamage(dmg);
          if (!e.isActive && e.maxHp < 1200) {
            gameState.particles.emit(e.x, e.y, {
              count: 12, speed: 80, spread: Math.PI * 2,
              colors: ['#0af', '#fff'], radius: 3, lifetime: 0.5,
            });
            gameState.expSystem.addExp(e.expValue);
            gameState.state.score += e.scoreValue;
          }
        }
      }
    }
  }

  onDeactivate(gameState) {}

  renderEffect(ctx, gameState) {
    if (this._timer <= 0) return;
    const alpha = Math.min(1, this._timer / this.duration * 2);
    const x = this._x;

    ctx.save();
    ctx.globalAlpha = alpha;

    // 外側グロー
    ctx.shadowColor = '#0af';
    ctx.shadowBlur  = 30;
    ctx.fillStyle   = 'rgba(0, 170, 255, 0.3)';
    ctx.fillRect(x - 20, 0, 40, LOGICAL_H);

    // コアビーム
    ctx.shadowBlur  = 15;
    ctx.fillStyle   = 'rgba(200, 240, 255, 0.9)';
    ctx.fillRect(x - 4, 0, 8, LOGICAL_H);

    // 白コア
    ctx.shadowBlur  = 5;
    ctx.fillStyle   = '#fff';
    ctx.fillRect(x - 1.5, 0, 3, LOGICAL_H);

    ctx.restore();
  }
}
