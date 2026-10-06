/**
 * ScrollBackground — 縦スクロールする3レイヤー星フィールド
 */

import { LOGICAL_W, LOGICAL_H } from '../core/Renderer.js';

/** ステージカラーパレット */
export const STAGE_COLORS = [
  { bg: '#050510', accent: '#00aaff', secondary: '#0044aa' }, // Stage 1
  { bg: '#100505', accent: '#ff4400', secondary: '#aa2200' }, // Stage 2
  { bg: '#080012', accent: '#cc00ff', secondary: '#660099' }, // Stage 3
  { bg: '#001208', accent: '#00ff88', secondary: '#008844' }, // Stage 4
  { bg: '#120800', accent: '#ffaa00', secondary: '#884400' }, // Stage 5
  { bg: '#120000', accent: '#ff0044', secondary: '#880022' }, // Stage 6
];

class StarLayer {
  /**
   * @param {number} count      星の数
   * @param {number} speed      スクロール速度係数（0.2〜1.0）
   * @param {number} minSize    最小サイズ
   * @param {number} maxSize    最大サイズ
   */
  constructor(count, speed, minSize, maxSize) {
    this.speed = speed;
    this.stars = [];
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x:    Math.random() * LOGICAL_W,
        y:    Math.random() * LOGICAL_H,
        size: minSize + Math.random() * (maxSize - minSize),
        brightness: 0.3 + Math.random() * 0.7,
      });
    }
  }

  update(delta, scrollSpeed) {
    const dy = scrollSpeed * this.speed * delta;
    for (const s of this.stars) {
      s.y += dy;
      if (s.y > LOGICAL_H + s.size) {
        s.y = -s.size;
        s.x = Math.random() * LOGICAL_W;
      }
    }
  }

  render(ctx, accentColor) {
    for (const s of this.stars) {
      ctx.save();
      ctx.globalAlpha = s.brightness;
      ctx.shadowColor = accentColor;
      ctx.shadowBlur  = s.size * 2;
      ctx.fillStyle   = accentColor;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

export class ScrollBackground {
  constructor() {
    // 奥・中・前景の3レイヤー（速度・星数・サイズが異なる）
    this._layers = [
      new StarLayer(80,  0.2, 0.5, 1.0),  // 奥（遅い・小さい）
      new StarLayer(40,  0.5, 1.0, 1.8),  // 中
      new StarLayer(20,  1.0, 1.5, 2.5),  // 前景（速い・大きい）
    ];
    this._stageIndex = 0;
  }

  setStage(stageIndex) {
    this._stageIndex = Math.max(0, Math.min(5, stageIndex));
  }

  update(delta, scrollSpeed) {
    for (const layer of this._layers) {
      layer.update(delta, scrollSpeed);
    }
  }

  render(ctx) {
    const palette = STAGE_COLORS[this._stageIndex];

    // 背景塗りつぶし
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

    // 奥レイヤーは secondary カラー
    this._layers[0].render(ctx, palette.secondary);
    // 中・前景は accent カラー
    this._layers[1].render(ctx, palette.accent);
    this._layers[2].render(ctx, palette.accent);
  }
}
