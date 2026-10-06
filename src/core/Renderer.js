/**
 * Renderer — Canvas コンテキスト管理とネオン描画ユーティリティ
 *
 * 論理解像度 480×720 を基準に、devicePixelRatio でスケールして
 * シャープな描画を実現する。
 */

export const LOGICAL_W = 480;
export const LOGICAL_H = 720;

export class Renderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');

    // 画面振動用オフセット
    this._shakeX = 0;
    this._shakeY = 0;
    this._shakeDuration = 0;
    this._shakeIntensity = 0;

    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  _resize() {
    const dpr = window.devicePixelRatio || 1;

    // Canvas の実ピクセルサイズ
    this.canvas.width  = LOGICAL_W * dpr;
    this.canvas.height = LOGICAL_H * dpr;

    // CSS での表示サイズ（論理解像度に合わせる）
    this.canvas.style.width  = `${LOGICAL_W}px`;
    this.canvas.style.height = `${LOGICAL_H}px`;

    // スケール適用（以降 ctx の操作は論理座標で行える）
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /** フレーム開始時に呼ぶ（画面クリア＋振動オフセット適用）
   * @param {number} delta 前フレームからの経過秒
   */
  beginFrame(delta = 0.016) {
    const ctx = this.ctx;

    // 振動更新
    if (this._shakeDuration > 0) {
      this._shakeDuration -= delta;
      // intensity がゼロの場合のゼロ除算を防ぐ
      const ratio = this._shakeIntensity > 0
        ? Math.max(0, this._shakeDuration / this._shakeIntensity)
        : 0;
      const s = this._shakeIntensity * ratio;
      this._shakeX = (Math.random() * 2 - 1) * s;
      this._shakeY = (Math.random() * 2 - 1) * s;
    } else {
      this._shakeDuration = 0;
      this._shakeX = 0;
      this._shakeY = 0;
    }

    ctx.save();
    ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H);
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
    ctx.translate(this._shakeX, this._shakeY);
  }

  /** フレーム終了時に呼ぶ */
  endFrame() {
    this.ctx.restore();
  }

  /**
   * 画面振動を開始する
   * @param {number} intensity  最大ぶれ幅 (px)
   * @param {number} duration   持続時間 (秒)
   */
  shake(intensity, duration) {
    this._shakeIntensity = intensity;
    this._shakeDuration = duration;
  }

  // ──────────────────────────────────────────
  // ネオン描画ユーティリティ
  // ──────────────────────────────────────────

  /**
   * ネオン発光矩形を描く
   * @param {number} x, y, w, h  論理座標
   * @param {string} color        CSS カラー文字列
   * @param {number} [glowSize=12]  shadowBlur サイズ
   * @param {boolean} [fill=false]  塗りつぶすか否か
   */
  drawNeonRect(x, y, w, h, color, glowSize = 12, fill = false) {
    const ctx = this.ctx;
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur  = glowSize;
    if (fill) {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, w, h);
    }
    // 二重発光（より強い輝き）
    ctx.shadowBlur = glowSize * 0.5;
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
  }

  /**
   * ネオン発光円を描く
   */
  drawNeonCircle(x, y, r, color, glowSize = 12, fill = false) {
    const ctx = this.ctx;
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur  = glowSize;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    if (fill) {
      ctx.fillStyle = color;
      ctx.fill();
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    // 白ハイライト
    ctx.shadowBlur = glowSize * 0.4;
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.restore();
  }

  /**
   * ネオン発光ライン
   */
  drawNeonLine(x1, y1, x2, y2, color, lineWidth = 2, glowSize = 10) {
    const ctx = this.ctx;
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur  = glowSize;
    ctx.strokeStyle = color;
    ctx.lineWidth   = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    // 白コア
    ctx.shadowBlur  = glowSize * 0.3;
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth   = lineWidth * 0.3;
    ctx.stroke();
    ctx.restore();
  }

  /**
   * ネオン発光テキスト
   */
  drawNeonText(text, x, y, size, color, glowSize = 16, align = 'center') {
    const ctx = this.ctx;
    ctx.save();
    ctx.font        = `bold ${size}px 'Courier New', monospace`;
    ctx.textAlign   = align;
    ctx.textBaseline = 'middle';
    ctx.shadowColor = color;
    ctx.shadowBlur  = glowSize;
    ctx.fillStyle   = color;
    ctx.fillText(text, x, y);
    // 白コア
    ctx.shadowBlur  = glowSize * 0.3;
    ctx.fillStyle   = 'rgba(255,255,255,0.9)';
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  /**
   * 全画面フラッシュエフェクト
   * @param {string} color  フラッシュ色
   * @param {number} alpha  透明度 0〜1
   */
  drawFlash(color, alpha) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle   = color;
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
    ctx.restore();
  }

  /**
   * HP ゲージなどの進捗バーを描く
   */
  drawBar(x, y, w, h, ratio, colorFill, colorBg = '#111', glowSize = 6) {
    const ctx = this.ctx;
    ctx.save();
    // 背景
    ctx.fillStyle = colorBg;
    ctx.fillRect(x, y, w, h);
    // 前景
    ctx.shadowColor = colorFill;
    ctx.shadowBlur  = glowSize;
    ctx.fillStyle   = colorFill;
    ctx.fillRect(x, y, w * Math.max(0, Math.min(1, ratio)), h);
    // 枠
    ctx.shadowBlur  = 0;
    ctx.strokeStyle = '#333';
    ctx.lineWidth   = 1;
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
  }
}
