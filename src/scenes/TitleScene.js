/**
 * TitleScene — タイトル画面
 */
import { ScrollBackground } from '../game/ScrollBackground.js';
import { LOGICAL_W, LOGICAL_H } from '../core/Renderer.js';

export class TitleScene {
  constructor(renderer, input, sm, audio) {
    this._renderer = renderer;
    this._input    = input;
    this._sm       = sm;
    this._audio    = audio;
    this._bg       = new ScrollBackground();
    this._timer    = 0;
    this._blinkTimer = 0;
    this._blinkShow  = true;
    this._stars  = this._makeStars();
  }

  _makeStars() {
    return Array.from({ length: 8 }, (_, i) => ({
      angle: (Math.PI * 2 / 8) * i,
      dist:  80 + Math.random() * 60,
      size:  1 + Math.random() * 2,
      spd:   0.3 + Math.random() * 0.5,
    }));
  }

  onEnter() {
    this._timer = 0;
    this._bg.setStage(0);
    this._audio.resume();
  }

  onExit() {}

  update(delta) {
    this._timer     += delta;
    this._blinkTimer += delta;
    if (this._blinkTimer > 0.6) {
      this._blinkTimer -= 0.6;
      this._blinkShow = !this._blinkShow;
    }
    this._bg.update(delta, 30);

    if (this._input.isJustPressed('CONFIRM')) {
      this._audio.resume();
      this._sm.transition('stageSelect');
    }
  }

  render(ctx) {
    this._bg.render(ctx);

    const cx = LOGICAL_W / 2;
    const r  = this._renderer;

    // ── タイトルロゴ ──
    const pulse = 1 + Math.sin(this._timer * 2) * 0.04;
    ctx.save();
    ctx.translate(cx, 200);
    ctx.scale(pulse, pulse);
    r.drawNeonText('NEON',    0, -28, 52, '#0af', 24, 'center');
    r.drawNeonText('STRIKER', 0,  28, 40, '#08f', 20, 'center');
    ctx.restore();

    // サブタイトル
    r.drawNeonText('— SHOOTING × RPG —', cx, 270, 12, '#4af', 10, 'center');

    // 操作説明
    if (this._blinkShow) {
      r.drawNeonText('PRESS  SPACE  TO  START', cx, 460, 14, '#0ff', 12, 'center');
    }

    // 操作ガイド
    ctx.save();
    ctx.font      = '11px Courier New';
    ctx.fillStyle = '#446';
    ctx.textAlign = 'center';
    ctx.fillText('移動:WASD / 矢印  ショット:SPACE  能力:Z  ボム:SHIFT', cx, 560);
    ctx.restore();

    // 周回する輝点
    ctx.save();
    for (const s of this._stars) {
      s.angle += s.spd * 0.016;
      const sx = cx + Math.cos(s.angle + this._timer * 0.2) * s.dist;
      const sy = 200 + Math.sin(s.angle + this._timer * 0.3) * 50;
      ctx.shadowColor = '#0af';
      ctx.shadowBlur  = 6;
      ctx.fillStyle   = '#0af';
      ctx.beginPath();
      ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // バージョン
    ctx.save();
    ctx.font      = '10px Courier New';
    ctx.fillStyle = '#334';
    ctx.textAlign = 'right';
    ctx.fillText('v1.0.0', LOGICAL_W - 10, LOGICAL_H - 8);
    ctx.restore();
  }
}
