/**
 * Boss — ボス基底クラス
 * 各 Boss1〜6 はこのクラスを継承する
 */

import { LOGICAL_W, LOGICAL_H } from '../core/Renderer.js';

export class Boss {
  /**
   * @param {object} opts
   * @param {number} opts.hp
   * @param {number} opts.radius
   * @param {number} opts.expValue
   * @param {number} opts.scoreValue
   * @param {string} opts.color
   * @param {string} opts.glowColor
   * @param {string} opts.name
   */
  constructor(opts) {
    this.name       = opts.name ?? 'BOSS';
    this.x          = LOGICAL_W / 2;
    this.y          = -60;
    this.radius     = opts.radius ?? 40;
    this.hp         = opts.hp ?? 1000;
    this.maxHp      = opts.hp ?? 1000;
    this.expValue   = opts.expValue ?? 500;
    this.scoreValue = opts.scoreValue ?? 10000;
    this.color      = opts.color ?? '#f44';
    this.glowColor  = opts.glowColor ?? '#f00';
    this.isActive   = true;

    // フェーズ: 0=100%, 1=60%, 2=30%
    this.phase      = 0;

    // アニメ・タイマー
    this._animTimer  = 0;
    this._attackTimer = 0;
    this._hitFlash   = 0;

    // 入場モーション
    this._entering  = true;
    this._targetY   = 120;

    // フェーズ変化フラグ
    this._phaseChanged = false;
  }

  get hpRatio() { return this.hp / this.maxHp; }

  takeDamage(dmg) {
    this.hp = Math.max(0, this.hp - dmg);
    this._hitFlash = 0.08;
  }

  update(delta, player) {
    if (!this.isActive) return;

    this._animTimer   += delta;
    this._hitFlash     = Math.max(0, this._hitFlash - delta);

    // 入場モーション（Y 方向のスライドイン）
    if (this._entering) {
      this.y += (this._targetY - this.y) * Math.min(1, delta * 3);
      if (Math.abs(this.y - this._targetY) < 1) {
        this.y = this._targetY;
        this._entering = false;
      }
      return;
    }

    // フェーズ判定
    const prevPhase = this.phase;
    if (this.hpRatio < 0.3 && this.phase < 2) {
      this.phase = 2;
    } else if (this.hpRatio < 0.6 && this.phase < 1) {
      this.phase = 1;
    }
    if (this.phase !== prevPhase) {
      this._onPhaseChange(this.phase);
    }

    // サブクラスで実装する行動
    this._attackTimer -= delta;
    this._updateBehavior(delta, player);
  }

  /** サブクラスでオーバーライドする行動更新 */
  _updateBehavior(delta, player) {}

  /** フェーズ変化時フック（サブクラスでオーバーライド） */
  _onPhaseChange(newPhase) {
    // デフォルト演出: 一時的な強いフラッシュ
    this._hitFlash = 0.3;
  }

  /** 左右往復移動ヘルパー */
  _moveHorizontal(delta, speed) {
    this.x += Math.sin(this._animTimer * speed) * 2;
    this.x  = Math.max(this.radius + 20, Math.min(LOGICAL_W - this.radius - 20, this.x));
  }

  render(ctx) {
    if (!this.isActive) return;
    const x = this.x;
    const y = this.y;
    const r = this.radius;

    ctx.save();

    // 被弾フラッシュ
    if (this._hitFlash > 0) {
      ctx.shadowColor = '#fff';
      ctx.shadowBlur  = 30;
      ctx.fillStyle   = 'rgba(255,255,255,0.6)';
      ctx.beginPath();
      ctx.arc(x, y, r + 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // ──── ボス本体 ────
    this._renderBody(ctx, x, y, r);

    ctx.restore();

    // ──── HP バー（画面上部） ────
    this._renderHpBar(ctx);
  }

  /** サブクラスでオーバーライドして独自の見た目を描く */
  _renderBody(ctx, x, y, r) {
    // デフォルト: 大きな六角形
    ctx.shadowColor = this.glowColor;
    ctx.shadowBlur  = 25;
    ctx.fillStyle   = this.color;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i + this._animTimer * 0.8;
      const px = x + r * Math.cos(angle);
      const py = y + r * Math.sin(angle);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // インナーリング
    ctx.shadowBlur  = 15;
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.6, 0, Math.PI * 2);
    ctx.stroke();
  }

  _renderHpBar(ctx) {
    const margin = 16;
    const bw     = LOGICAL_W - margin * 2;
    const bh     = 18;          // 太めに
    const bx     = margin;
    const by     = 36;          // ボス名の下に余白を取る
    const ratio  = Math.max(0, this.hp / this.maxHp);

    // フェーズで色変化（フラッシュアニメ込み）
    const phaseColors = ['#4af', '#fa4', '#f44'];
    const color       = phaseColors[this.phase] ?? '#4af';

    ctx.save();

    // ── ボス名（左上） ──────────────────────────
    ctx.font         = 'bold 13px Courier New';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    ctx.shadowColor  = color;
    ctx.shadowBlur   = 10;
    ctx.fillStyle    = color;
    ctx.fillText(this.name, bx, by - 14);

    // フェーズ表示（右上）
    const phaseLabel = ['', '⚡ PHASE 2', '🔥 PHASE 3'][this.phase] ?? '';
    if (phaseLabel) {
      ctx.font      = 'bold 11px Courier New';
      ctx.textAlign = 'right';
      ctx.shadowColor = this.phase === 2 ? '#f44' : '#fa4';
      ctx.fillStyle   = this.phase === 2 ? '#f44' : '#fa4';
      ctx.fillText(phaseLabel, bx + bw, by - 14);
    }

    // ── バー背景（角丸風） ───────────────────────
    ctx.shadowBlur  = 0;
    ctx.fillStyle   = '#0a0a18';
    ctx.strokeStyle = '#222';
    ctx.lineWidth   = 1;
    _roundRect(ctx, bx, by, bw, bh, 4);
    ctx.fill();
    ctx.stroke();

    // ── HP 前景 ──────────────────────────────────
    if (ratio > 0) {
      // グラデーション
      const grad = ctx.createLinearGradient(bx, by, bx, by + bh);
      grad.addColorStop(0,   _lighten(color, 0.4));
      grad.addColorStop(0.5, color);
      grad.addColorStop(1,   _darken(color, 0.3));

      ctx.shadowColor = color;
      ctx.shadowBlur  = 12;
      ctx.fillStyle   = grad;
      // HP幅に応じてクリップして角丸を維持
      ctx.save();
      _roundRect(ctx, bx, by, bw, bh, 4);
      ctx.clip();
      ctx.fillRect(bx, by, bw * ratio, bh);
      ctx.restore();
    }

    // ── フェーズ区切りマーカー（60% / 30%） ─────
    const markers = [0.6, 0.3];
    for (const m of markers) {
      const mx = bx + bw * m;
      ctx.shadowBlur  = 0;
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth   = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(mx, by - 3);
      ctx.lineTo(mx, by + bh + 3);
      ctx.stroke();
      ctx.setLineDash([]);

      // 三角マーカー（上）
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath();
      ctx.moveTo(mx - 4, by - 5);
      ctx.lineTo(mx + 4, by - 5);
      ctx.lineTo(mx,     by - 1);
      ctx.closePath();
      ctx.fill();
    }

    // ── HP 数値（右端） ──────────────────────────
    const hpText = `${Math.max(0, this.hp).toLocaleString()} / ${this.maxHp.toLocaleString()}`;
    ctx.font         = 'bold 10px Courier New';
    ctx.textAlign    = 'right';
    ctx.textBaseline = 'middle';
    ctx.shadowColor  = color;
    ctx.shadowBlur   = 6;
    ctx.fillStyle    = '#ddd';
    ctx.fillText(hpText, bx + bw - 4, by + bh / 2);

    // ── 外枠（発光） ─────────────────────────────
    ctx.shadowColor  = color;
    ctx.shadowBlur   = 8;
    ctx.strokeStyle  = color;
    ctx.lineWidth    = 1.5;
    _roundRect(ctx, bx, by, bw, bh, 4);
    ctx.stroke();

    ctx.restore();
  }
}

// ──────────────────────────────────────────
// ファイルローカルヘルパー
// ──────────────────────────────────────────

/** 角丸矩形パスを作成する */
function _roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y,     x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/** 16進カラーを明るくする（ratio: 0〜1） */
function _lighten(hex, ratio) {
  const [r, g, b] = _parseHex(hex);
  return `rgb(${_clamp(r + (255 - r) * ratio)},${_clamp(g + (255 - g) * ratio)},${_clamp(b + (255 - b) * ratio)})`;
}

/** 16進カラーを暗くする（ratio: 0〜1） */
function _darken(hex, ratio) {
  const [r, g, b] = _parseHex(hex);
  return `rgb(${_clamp(r * (1 - ratio))},${_clamp(g * (1 - ratio))},${_clamp(b * (1 - ratio))})`;
}

function _parseHex(hex) {
  // '#rgb' または '#rrggbb' に対応
  const h = hex.replace('#', '');
  if (h.length === 3) {
    return [
      parseInt(h[0] + h[0], 16),
      parseInt(h[1] + h[1], 16),
      parseInt(h[2] + h[2], 16),
    ];
  }
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function _clamp(v) { return Math.max(0, Math.min(255, Math.round(v))); }
