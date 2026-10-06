/**
 * BarrierAbility — B3: 全方位バリア
 */
export class BarrierAbility {
  constructor(id) {
    this.id        = id;
    this.name      = '全方位バリア';
    this.gaugeCost = 40;
    this.duration  = 3.0;
    this._timer    = 0;
    this.isFinished = false;
  }

  onActivate(gameState, stats) {
    this._timer     = this.duration;
    this.isFinished = false;
    gameState.player.hasBarrier = true;
  }

  onUpdate(delta, gameState) {
    this._timer -= delta;
    if (this._timer <= 0) {
      this.isFinished = true;
    }
  }

  onDeactivate(gameState) {
    if (gameState.player) {
      gameState.player.hasBarrier = false;
    }
  }

  renderEffect(ctx, gameState) {
    // バリアエフェクトは Player.render() 内で hasBarrier フラグを見て描画するため、
    // ここでは追加の外側リングのみ描画
    const p = gameState.player;
    if (!p) return;
    const alpha = 0.3 + Math.sin(Date.now() * 0.01) * 0.2;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = '#0f8';
    ctx.shadowBlur  = 25;
    ctx.strokeStyle = '#0f8';
    ctx.lineWidth   = 3;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 28, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}
