/**
 * Enemy — 敵基底クラス
 */

import { LOGICAL_W, LOGICAL_H } from '../core/Renderer.js';

/** 敵タイプ定義 */
export const ENEMY_TYPES = {
  SMALL: {
    hp: 40, radius: 10, expValue: 10, scoreValue: 100,
    color: '#f84', glowColor: '#f40',
    shootInterval: 2.2,   // 射撃間隔（秒）
    bulletSpeed: 220,
    bulletDmg: 10, bulletRadius: 5, bulletColor: '#f84',
  },
  MEDIUM: {
    hp: 120, radius: 15, expValue: 25, scoreValue: 300,
    color: '#f4f', glowColor: '#c0c',
    shootInterval: 1.6,
    bulletSpeed: 260,
    bulletDmg: 14, bulletRadius: 6, bulletColor: '#f4f',
  },
  LARGE: {
    hp: 320, radius: 22, expValue: 50, scoreValue: 700,
    color: '#ff4', glowColor: '#aa0',
    shootInterval: 1.2,
    bulletSpeed: 240,
    bulletDmg: 18, bulletRadius: 7, bulletColor: '#ff4',
  },
  ELITE: {
    hp: 600, radius: 18, expValue: 100, scoreValue: 1500,
    color: '#4ff', glowColor: '#0cc',
    shootInterval: 0.9,
    bulletSpeed: 300,
    bulletDmg: 20, bulletRadius: 6, bulletColor: '#4ff',
  },
};

/** 移動パターン関数コレクション（t: 経過秒, x0/y0: 初期座標） */
export const MOVE_PATTERNS = {
  straight_down: (t, x0, y0, speed) => ({
    x: x0,
    y: y0 + t * speed,
  }),
  zigzag: (t, x0, y0, speed) => ({
    x: x0 + Math.sin(t * 4) * 80,   // 振れ幅・周期を強化
    y: y0 + t * speed,
  }),
  sine_wave: (t, x0, y0, speed) => ({
    x: x0 + Math.sin(t * 2.5) * 100,
    y: y0 + t * speed * 0.85,
  }),
  curve_left: (t, x0, y0, speed) => ({
    x: x0 - t * 55,
    y: y0 + t * speed,
  }),
  curve_right: (t, x0, y0, speed) => ({
    x: x0 + t * 55,
    y: y0 + t * speed,
  }),
  dive_bomb: (t, x0, y0, speed, player) => {
    if (t < 0.4) {
      // 少し上に出てから急降下
      return { x: x0, y: y0 + t * speed * 0.2 };
    }
    const angle = player ? Math.atan2(player.y - y0, player.x - x0) : Math.PI / 2;
    return {
      x: x0 + Math.cos(angle) * (t - 0.4) * speed * 2.4,
      y: y0 + Math.sin(angle) * (t - 0.4) * speed * 2.4,
    };
  },
};

export class Enemy {
  /**
   * @param {string}   type     ENEMY_TYPES のキー
   * @param {number}   x, y     初期座標
   * @param {string}   pattern  MOVE_PATTERNS のキー
   * @param {number}   [speed]  移動速度 (px/s)
   * @param {function} [shootFn] 射撃コールバック
   */
  constructor(type, x, y, pattern, speed = 100, shootFn = null) {
    const def = ENEMY_TYPES[type] ?? ENEMY_TYPES.SMALL;
    this.type       = type;
    this.x          = x;
    this.y          = y;
    this._startX    = x;
    this._startY    = y;
    this.radius     = def.radius;
    this.hp         = def.hp;
    this.maxHp      = def.hp;
    this.expValue   = def.expValue;
    this.scoreValue = def.scoreValue;
    this.color      = def.color;
    this.glowColor  = def.glowColor;
    this.isActive   = true;

    this._pattern   = MOVE_PATTERNS[pattern] ?? MOVE_PATTERNS.straight_down;
    this._speed     = speed;
    this._shootFn   = shootFn;
    this._t         = 0;
    this._shootTimer = 0;
    this._shootInterval = def.shootInterval ?? 2.0;

    // 被弾フラッシュ
    this._hitFlash = 0;

    // アニメタイマー
    this._animTimer = 0;
  }

  takeDamage(dmg) {
    this.hp -= dmg;
    this._hitFlash = 0.1;
    // hp が 0 以下になったら即座に非アクティブ化（複数箇所からの重複処理を防止）
    if (this.hp <= 0) {
      this.hp = 0;
      this.isActive = false;
    }
  }

  update(delta, player) {
    if (!this.isActive) return;
    this._t         += delta;
    this._animTimer += delta;
    this._hitFlash   = Math.max(0, this._hitFlash - delta);

    const pos = this._pattern(this._t, this._startX, this._startY, this._speed, player);
    this.x = pos.x;
    this.y = pos.y;

    // 画面外に出たら非アクティブ
    if (this.y > LOGICAL_H + 50 || this.x < -60 || this.x > LOGICAL_W + 60) {
      this.isActive = false;
    }

    // 射撃
    if (this._shootFn) {
      this._shootTimer -= delta;
      if (this._shootTimer <= 0) {
        this._shootFn(this);
        this._shootTimer = this._shootInterval;
      }
    }
  }

  render(ctx) {
    if (!this.isActive) return;
    const x = this.x;
    const y = this.y;
    const r = this.radius;

    ctx.save();

    // 被弾フラッシュ
    if (this._hitFlash > 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(x, y, r + 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowColor = this.glowColor;
    ctx.shadowBlur  = 12;

    // 六角形ベースのシルエット
    ctx.fillStyle = this.color;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6 + this._animTimer * 1.5;
      const px = x + r * Math.cos(angle);
      const py = y + r * Math.sin(angle);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // コア（白い輝き）
    ctx.shadowBlur = 6;
    ctx.fillStyle  = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.arc(x, y, r * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // HP ゲージ（LARGE / ELITE のみ）
    if (this.type === 'LARGE' || this.type === 'ELITE') {
      const bw = r * 2;
      const bh = 3;
      const bx = x - r;
      const by = y + r + 4;
      ctx.shadowBlur = 0;
      ctx.fillStyle  = '#333';
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle  = this.color;
      ctx.fillRect(bx, by, bw * (this.hp / this.maxHp), bh);
    }

    ctx.restore();
  }
}
