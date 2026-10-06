/**
 * MissileAbility — B2: 自動追尾ミサイル
 * 発射時に最も近い敵をロックオン。
 * ターゲットが消えたら次の敵を自動再ロック。
 */

class Missile {
  /**
   * @param {number} x, y   発射座標
   * @param {object} target 最初のターゲット敵
   * @param {number} power  威力倍率
   */
  constructor(x, y, target, power) {
    this.x = x;
    this.y = y;
    this.target  = target;
    this.speed   = 280;           // 追尾速度 (px/s)
    this.turnRate = 6;            // 向き補正の強さ（大きいほど急旋回）
    this.vx = 0;
    this.vy = -this.speed;        // 最初は上向きに発射
    this.radius = 6;
    this.dmg    = Math.ceil(50 * power);
    this.isActive = true;
    this._life  = 4.0;            // 最大生存時間（秒）
    this._trailTimer = 0;
  }

  /** 毎フレーム呼ぶ。enemies は現在のアクティブな敵リスト */
  update(delta, enemies) {
    this._life -= delta;
    if (this._life <= 0) { this.isActive = false; return; }

    // ターゲットが無効になったら最近傍の敵を再ロック
    if (!this.target || !this.target.isActive || this.target.hp <= 0) {
      this.target = this._findNearest(enemies);
    }

    // ターゲットに向かって速度ベクトルを補正
    if (this.target) {
      const dx   = this.target.x - this.x;
      const dy   = this.target.y - this.y;
      const dist = Math.hypot(dx, dy) || 1;
      // 目標方向の単位ベクトル × speed
      const wantVx = (dx / dist) * this.speed;
      const wantVy = (dy / dist) * this.speed;
      // 現在速度を目標速度へ線形補間（旋回）
      this.vx += (wantVx - this.vx) * Math.min(1, this.turnRate * delta);
      this.vy += (wantVy - this.vy) * Math.min(1, this.turnRate * delta);
    }

    this.x += this.vx * delta;
    this.y += this.vy * delta;
  }

  /** 最も近いアクティブ敵を返す */
  _findNearest(enemies) {
    let best = null;
    let bestDist = Infinity;
    for (const e of enemies) {
      if (!e.isActive || e.hp <= 0) continue;
      const d = Math.hypot(e.x - this.x, e.y - this.y);
      if (d < bestDist) { bestDist = d; best = e; }
    }
    return best;
  }

  render(ctx) {
    if (!this.isActive) return;

    const angle = Math.atan2(this.vy, this.vx);

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(angle + Math.PI / 2);

    // 炎尾
    ctx.shadowColor = '#f80';
    ctx.shadowBlur  = 14;
    ctx.fillStyle   = 'rgba(255,140,0,0.6)';
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.lineTo(-3, 18);
    ctx.lineTo(3, 18);
    ctx.closePath();
    ctx.fill();

    // ミサイル本体
    ctx.shadowColor = '#fa4';
    ctx.shadowBlur  = 10;
    ctx.fillStyle   = '#fa4';
    ctx.beginPath();
    ctx.moveTo(0, -10);   // 先端
    ctx.lineTo(-4, 6);
    ctx.lineTo(4, 6);
    ctx.closePath();
    ctx.fill();

    // 白コア
    ctx.shadowBlur = 4;
    ctx.fillStyle  = 'rgba(255,255,200,0.8)';
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(-2, 2);
    ctx.lineTo(2, 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

export class MissileAbility {
  constructor(id) {
    this.id         = id;
    this.name       = '追尾ミサイル';
    this.gaugeCost  = 50;
    this.duration   = 4.0;
    this._missiles  = [];
    this.isFinished = false;
  }

  onActivate(gameState, stats) {
    this.isFinished = false;
    this._missiles  = [];

    const p       = gameState.player;
    const enemies = gameState.enemies;
    const count   = 3;

    for (let i = 0; i < count; i++) {
      // 各ミサイルに距離順で異なる敵をロックオン
      const sorted = [...enemies]
        .filter(e => e.isActive && e.hp > 0)
        .sort((a, b) =>
          Math.hypot(a.x - p.x, a.y - p.y) -
          Math.hypot(b.x - p.x, b.y - p.y)
        );
      const target  = sorted[i % sorted.length] ?? null;
      const offsetX = (i - 1) * 22;

      this._missiles.push(
        new Missile(p.x + offsetX, p.y - 15, target, stats.abilityPower)
      );
    }
  }

  onUpdate(delta, gameState) {
    const enemies = gameState.enemies;

    for (const m of this._missiles) {
      if (!m.isActive) continue;

      // 移動（敵リストを渡して再ロックも行う）
      m.update(delta, enemies);

      // 敵との衝突判定
      for (const e of enemies) {
        if (!e.isActive || !m.isActive) continue;
        const dx = m.x - e.x;
        const dy = m.y - e.y;
        if (dx * dx + dy * dy < (m.radius + e.radius) ** 2) {
          // 爆発パーティクル
          gameState.particles.emit(m.x, m.y, {
            count:      16,
            speed:      120,
            spread:     Math.PI * 2,
            colors:     ['#fa4', '#ff0', '#f80', '#fff'],
            radius:     4,
            radiusVar:  2,
            lifetime:   0.6,
            lifetimeVar: 0.2,
          });

          e.takeDamage(m.dmg);
          if (!e.isActive && e.maxHp < 1200) {
            gameState.expSystem.addExp(e.expValue);
            gameState.state.score += e.scoreValue;
          }
          m.isActive = false;
          break;
        }
      }
    }

    this._missiles = this._missiles.filter(m => m.isActive);
    if (this._missiles.length === 0) this.isFinished = true;
  }

  onDeactivate(gameState) {
    this._missiles = [];
  }

  renderEffect(ctx, gameState) {
    for (const m of this._missiles) m.render(ctx);
  }
}
