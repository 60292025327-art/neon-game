/**
 * Player — 自機エンティティ
 */

import { LOGICAL_W, LOGICAL_H } from '../core/Renderer.js';

export class Player {
  /**
   * @param {BulletPool}    bulletPool
   * @param {ParticleSystem} particles
   * @param {AudioEngine}   audio
   * @param {ComputedStats} stats
   */
  constructor(bulletPool, particles, audio, stats) {
    this._bulletPool = bulletPool;
    this._particles  = particles;
    this._audio      = audio;

    this.x = LOGICAL_W / 2;
    this.y = LOGICAL_H - 80;
    this.radius = 10;

    this.stats = stats;
    this.hp    = stats.maxHp;
    this.maxHp = stats.maxHp;
    this.bombs = stats.bombCount;

    // 射撃クールダウン（フレーム数ではなく秒で管理）
    this._shootTimer = 0;

    // 被弾無敵
    this.invincibleTimer = 0;

    // バリアフラグ（能力3）
    this.hasBarrier = false;

    // 描画用アニメタイマー
    this._animTimer = 0;

    // エンジン炎パーティクルタイマー
    this._thrusterTimer = 0;
  }

  get isInvincible() {
    return this.invincibleTimer > 0;
  }

  /**
   * @param {number} delta
   * @param {InputManager} input
   */
  update(delta, input) {
    this._animTimer    += delta;
    this._thrusterTimer += delta;

    // ──── 移動 ────
    const spd = this.stats.moveSpeed * 60 * delta;
    let dx = 0, dy = 0;
    if (input.isDown('MOVE_LEFT'))  dx -= 1;
    if (input.isDown('MOVE_RIGHT')) dx += 1;
    if (input.isDown('MOVE_UP'))    dy -= 1;
    if (input.isDown('MOVE_DOWN'))  dy += 1;

    // 斜め移動を正規化
    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }
    this.x = Math.max(this.radius, Math.min(LOGICAL_W - this.radius, this.x + dx * spd));
    this.y = Math.max(this.radius, Math.min(LOGICAL_H - this.radius, this.y + dy * spd));

    // ──── 射撃 ────
    this._shootTimer -= delta;
    if (input.isDown('SHOOT') && this._shootTimer <= 0) {
      this._shoot();
      this._shootTimer = this.stats.shotRate / 60;
    }

    // ──── 無敵タイマー ────
    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= delta;
    }

    // ──── エンジン炎パーティクル ────
    if (this._thrusterTimer > 0.04) {
      this._thrusterTimer = 0;
      this._particles.emit(this.x, this.y + 12, {
        count:    3,
        speed:    40,
        spread:   0.5,
        baseAngle: Math.PI / 2,
        colors:   ['#0af', '#08f', '#fff'],
        radius:   2,
        radiusVar: 1,
        lifetime: 0.3,
        lifetimeVar: 0.1,
        gravity:  -10,
      });
    }
  }

  _shoot() {
    const dmg = this.stats.shotPower;
    // メイン弾（中央）
    this._bulletPool.spawn(this.x, this.y - 15, 0, -600, dmg, 4, '#0cf', 10);
    // 横方向の補助弾（レベルが高いと追加）
    if (this.stats.shotPower >= 20) {
      this._bulletPool.spawn(this.x - 10, this.y - 5, 0, -600, Math.ceil(dmg * 0.5), 3, '#08f', 7);
      this._bulletPool.spawn(this.x + 10, this.y - 5, 0, -600, Math.ceil(dmg * 0.5), 3, '#08f', 7);
    }
    this._audio?.playShot();
  }

  /**
   * ダメージを受ける
   * @param {number} dmg
   */
  takeDamage(dmg) {
    if (this.invincibleTimer > 0 || this.hasBarrier) return;
    this.hp -= dmg;
    this.invincibleTimer = 1.5;  // 1.5秒無敵
    this._audio?.playHit();

    // 被弾パーティクル
    this._particles.emit(this.x, this.y, {
      count:    10,
      speed:    60,
      spread:   Math.PI * 2,
      colors:   ['#f44', '#f84', '#ff0'],
      radius:   3,
      lifetime: 0.4,
    });
  }

  /** ボム発動
   * @param {BulletPool}    enemyBullets
   * @param {ParticleSystem} particles
   * @param {Enemy[]}       [enemies]  ボムダメージを与える敵リスト
   */
  activateBomb(enemyBullets, particles, enemies = []) {
    if (this.bombs <= 0) return false;
    this.bombs--;
    this._audio?.playBomb();

    // 全敵弾を消去
    enemyBullets.clear();

    // 全敵にダメージ（ボムは雑魚一掃用）
    for (const e of enemies) {
      if (!e.isActive) continue;
      const isBoss = e.maxHp >= 1200;
      e.takeDamage(isBoss ? 80 : 9999);
      particles.emit(e.x, e.y, {
        count: isBoss ? 8 : 12, speed: 100, spread: Math.PI * 2,
        colors: ['#fff', '#0cf', '#08f'],
        radius: 3, lifetime: 0.5,
      });
    }

    // 全画面パーティクル
    for (let i = 0; i < 5; i++) {
      particles.emit(
        Math.random() * LOGICAL_W,
        Math.random() * LOGICAL_H,
        {
          count:    20,
          speed:    150,
          spread:   Math.PI * 2,
          colors:   ['#fff', '#0cf', '#08f'],
          radius:   4,
          radiusVar: 2,
          lifetime: 0.8,
        }
      );
    }
    // 無敵時間を付与
    this.invincibleTimer = Math.max(this.invincibleTimer, 2.0);
    return true;
  }

  render(ctx) {
    const x = this.x;
    const y = this.y;

    // 被弾無敵中は点滅
    if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer * 10) % 2 === 0) {
      return;
    }

    ctx.save();

    // ──── バリアエフェクト ────
    if (this.hasBarrier) {
      ctx.shadowColor = '#0f8';
      ctx.shadowBlur  = 20;
      ctx.strokeStyle = '#0f8';
      ctx.lineWidth   = 2;
      ctx.globalAlpha = 0.6 + Math.sin(this._animTimer * 8) * 0.3;
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // ──── 機体（三角形ベース） ────
    ctx.shadowColor = '#0af';
    ctx.shadowBlur  = 15;
    ctx.fillStyle   = '#0af';
    ctx.beginPath();
    ctx.moveTo(x,      y - 16);  // 先端
    ctx.lineTo(x - 12, y + 10);  // 左後
    ctx.lineTo(x - 4,  y + 6);   // 左インデント
    ctx.lineTo(x,      y + 10);
    ctx.lineTo(x + 4,  y + 6);   // 右インデント
    ctx.lineTo(x + 12, y + 10);  // 右後
    ctx.closePath();
    ctx.fill();

    // 白ハイライト
    ctx.shadowBlur  = 5;
    ctx.fillStyle   = 'rgba(255,255,255,0.8)';
    ctx.beginPath();
    ctx.moveTo(x,     y - 12);
    ctx.lineTo(x - 5, y + 2);
    ctx.lineTo(x + 5, y + 2);
    ctx.closePath();
    ctx.fill();

    // ──── ウィングライン ────
    ctx.shadowColor = '#08f';
    ctx.shadowBlur  = 8;
    ctx.strokeStyle = '#08f';
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - 4, y + 6);
    ctx.lineTo(x - 18, y + 8);
    ctx.moveTo(x + 4, y + 6);
    ctx.lineTo(x + 18, y + 8);
    ctx.stroke();

    ctx.restore();
  }
}
