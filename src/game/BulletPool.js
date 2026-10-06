/**
 * BulletPool — 弾のオブジェクトプール
 * 自機弾・敵弾それぞれに1インスタンスずつ生成して使う
 */

import { LOGICAL_W, LOGICAL_H } from '../core/Renderer.js';

const POOL_SIZE = 512;

class Bullet {
  constructor() {
    this.isActive = false;
    this.x = 0; this.y = 0;
    this.vx = 0; this.vy = 0;
    this.dmg = 1;
    this.radius = 4;
    this.color = '#fff';
    this.glowSize = 8;
    // 特殊フラグ
    this.isPiercing = false;  // 貫通弾
  }

  reset(x, y, vx, vy, dmg, radius, color, glowSize = 8, isPiercing = false) {
    this.isActive = true;
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.dmg = dmg;
    this.radius = radius;
    this.color = color;
    this.glowSize = glowSize;
    this.isPiercing = isPiercing;
  }

  deactivate() {
    this.isActive = false;
  }
}

export class BulletPool {
  constructor() {
    this._pool = Array.from({ length: POOL_SIZE }, () => new Bullet());
    this._active = [];  // アクティブ弾への参照キャッシュ（毎フレーム再構築）
  }

  /**
   * 弾を生成する
   * @returns {Bullet|null}  プールが満杯なら null
   */
  spawn(x, y, vx, vy, dmg, radius, color, glowSize = 8, isPiercing = false) {
    for (const b of this._pool) {
      if (!b.isActive) {
        b.reset(x, y, vx, vy, dmg, radius, color, glowSize, isPiercing);
        return b;
      }
    }
    return null;  // プール満杯
  }

  /** 全弾を非アクティブにする */
  clear() {
    for (const b of this._pool) b.isActive = false;
  }

  update(delta) {
    for (const b of this._pool) {
      if (!b.isActive) continue;
      b.x += b.vx * delta;
      b.y += b.vy * delta;
      // 画面外判定（余裕を持たせる）
      if (
        b.x < -20 || b.x > LOGICAL_W + 20 ||
        b.y < -20 || b.y > LOGICAL_H + 20
      ) {
        b.isActive = false;
      }
    }
  }

  render(ctx) {
    for (const b of this._pool) {
      if (!b.isActive) continue;
      ctx.save();
      ctx.shadowColor = b.color;
      ctx.shadowBlur  = b.glowSize;
      ctx.fillStyle   = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
      // 白コア
      ctx.shadowBlur  = b.glowSize * 0.3;
      ctx.fillStyle   = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /** アクティブな弾のイテレータ（衝突判定用） */
  getActive() {
    return this._pool.filter(b => b.isActive);
  }
}
