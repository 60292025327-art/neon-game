/**
 * MegaBlastAbility — B6: 画面爆発
 * 全敵・全弾を消去し大ダメージを与える
 */
import { LOGICAL_W, LOGICAL_H } from '../../core/Renderer.js';

export class MegaBlastAbility {
  constructor(id) {
    this.id        = id;
    this.name      = '画面爆発';
    this.gaugeCost = 100;
    this.duration  = 1.2;
    this._timer    = 0;
    this.isFinished = false;
  }

  onActivate(gameState, stats) {
    this._timer     = this.duration;
    this.isFinished = false;
    this._power = stats.abilityPower;

    // 全敵弾を削除
    gameState.enemyBullets.clear();

    // 全敵にダメージ（即死レベル）
    const dmg = Math.ceil(9999 * this._power);
    for (const e of gameState.enemies) {
      if (!e.isActive) continue;
      e.takeDamage(dmg);
      gameState.particles.emit(e.x, e.y, {
        count: 20, speed: 120, spread: Math.PI * 2,
        colors: ['#f44', '#f84', '#ff0', '#fff'],
        radius: 4, radiusVar: 2, lifetime: 0.8,
      });
      if (!e.isActive && e.maxHp < 1200) {
        gameState.expSystem.addExp(e.expValue);
        gameState.state.score += e.scoreValue;
      }
    }

    // 画面振動
    gameState.renderer?.shake(12, 0.6);
  }

  onUpdate(delta, gameState) {
    this._timer -= delta;
    if (this._timer <= 0) this.isFinished = true;
  }

  onDeactivate(gameState) {}

  renderEffect(ctx, gameState) {
    const progress = 1 - this._timer / this.duration;
    const alpha    = Math.max(0, (1 - progress) * 0.9);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle   = '#fff';
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
    ctx.restore();
  }
}
