/**
 * TimeSlowAbility — B4: タイムスロー
 * EnemyManager / BulletPool の delta に係数 0.5 を乗算する
 */
export class TimeSlowAbility {
  constructor(id) {
    this.id        = id;
    this.name      = 'タイムスロー';
    this.gaugeCost = 45;
    this.duration  = 2.0;
    this._timer    = 0;
    this.isFinished = false;
    /** GameScene からこの値を読んで delta を乗算する */
    this.timeScale = 1.0;
  }

  onActivate(gameState, stats) {
    this._timer     = this.duration;
    this.isFinished = false;
    this.timeScale  = 0.25;
  }

  onUpdate(delta, gameState) {
    this._timer -= delta;  // delta はスロー影響外（実時間）
    if (this._timer <= 0) {
      this.isFinished = true;
    }
  }

  onDeactivate(gameState) {
    this.timeScale = 1.0;
  }

  renderEffect(ctx, gameState) {
    // 画面四隅に青いビネット
    const canvas = ctx.canvas;
    const W = canvas.width / (window.devicePixelRatio || 1);
    const H = canvas.height / (window.devicePixelRatio || 1);

    const grad = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.8);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,100,200,0.35)');

    ctx.save();
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // 「SLOW」テキスト
    ctx.font      = 'bold 14px Courier New';
    ctx.fillStyle = 'rgba(100,200,255,0.7)';
    ctx.textAlign = 'center';
    ctx.fillText('◈ TIME SLOW ◈', W / 2, 40);
    ctx.restore();
  }
}
