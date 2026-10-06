/**
 * PauseScene — ポーズオーバーレイ
 * ESC で開く。↑↓ で選択、Z/Space/Enter で決定。
 */
import { LOGICAL_W, LOGICAL_H } from '../core/Renderer.js';

const MENU_ITEMS = [
  { label: '再開する',           color: '#0af', action: 'resume'  },
  { label: 'ステージ選択へ戻る', color: '#fa4', action: 'select'  },
];

export class PauseScene {
  constructor(renderer, input, sm) {
    this._renderer  = renderer;
    this._input     = input;
    this._sm        = sm;
    this._cursor    = 0;
    this._animTimer = 0;
  }

  onEnter() {
    this._cursor    = 0;
    this._animTimer = 0;
  }

  onExit() {}

  update(delta) {
    this._animTimer += delta;

    // ESC で即再開
    if (this._input.isJustPressed('PAUSE')) {
      this._execute('resume');
      return;
    }

    // X キーで即ステージ選択
    if (this._input.isJustPressed('BACK')) {
      this._execute('select');
      return;
    }

    // カーソル移動
    if (this._input.isJustPressed('MOVE_UP'))
      this._cursor = (this._cursor - 1 + MENU_ITEMS.length) % MENU_ITEMS.length;
    if (this._input.isJustPressed('MOVE_DOWN'))
      this._cursor = (this._cursor + 1) % MENU_ITEMS.length;

    // 決定
    if (this._input.isJustPressed('CONFIRM')) {
      this._execute(MENU_ITEMS[this._cursor].action);
    }
  }

  _execute(action) {
    if (action === 'resume') {
      this._sm.closeOverlay();          // オーバーレイを閉じるだけ
    } else if (action === 'select') {
      this._sm.transition('stageSelect');  // 通常遷移（GameScene を破棄）
    }
  }

  render(ctx) {
    const r   = this._renderer;
    const cx  = LOGICAL_W / 2;
    const cy  = LOGICAL_H / 2;
    const t   = this._animTimer;

    // ── 半透明暗転 ──────────────────────────────
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 16, 0.82)';
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
    ctx.restore();

    // ── スキャンライン演出 ──────────────────────
    ctx.save();
    ctx.globalAlpha = 0.04;
    ctx.fillStyle   = '#0af';
    for (let y = 0; y < LOGICAL_H; y += 4) {
      ctx.fillRect(0, y, LOGICAL_W, 2);
    }
    ctx.restore();

    // ── パネル枠（縦を広げる） ───────────────────
    const pw = 300;
    const ph = 260;
    const px = cx - pw / 2;
    const py = cy - ph / 2 - 10;

    ctx.save();
    ctx.fillStyle = 'rgba(0,10,30,0.92)';
    _roundRect(ctx, px, py, pw, ph);
    ctx.fill();
    ctx.restore();

    r.drawNeonRect(px, py, pw, ph, '#0af', 10, false);

    // ── PAUSED タイトル ─────────────────────────
    const pulse = 1 + Math.sin(t * 3) * 0.015;
    ctx.save();
    ctx.translate(cx, py + 36);
    ctx.scale(pulse, pulse);
    r.drawNeonText('— PAUSED —', 0, 0, 20, '#0af', 18, 'center');
    ctx.restore();

    // 区切り線
    r.drawNeonLine(px + 20, py + 62, px + pw - 20, py + 62, '#0af', 1, 6);

    // ── ① 再開ボタン（小さめ・シンプル） ──────
    {
      const sel  = this._cursor === 0;
      const bx   = px + 20;
      const by   = py + 78;
      const bw   = pw - 40;
      const bh   = 44;
      const col  = '#0af';

      ctx.save();
      ctx.fillStyle   = sel ? 'rgba(0,170,255,0.15)' : 'rgba(0,170,255,0.05)';
      ctx.shadowColor = col;
      ctx.shadowBlur  = sel ? 10 : 4;
      _roundRect(ctx, bx, by, bw, bh);
      ctx.fill();
      ctx.strokeStyle = col;
      ctx.lineWidth   = sel ? 1.5 : 0.8;
      _roundRect(ctx, bx, by, bw, bh);
      ctx.stroke();
      ctx.restore();

      r.drawNeonText(
        sel ? '▶  再開する' : '   再開する',
        cx, by + bh / 2,
        sel ? 15 : 13,
        sel ? col : '#446',
        sel ? 12 : 3,
        'center'
      );
    }

    // ── ② ステージ選択へ戻るボタン（大・目立つ） ──
    {
      const sel  = this._cursor === 1;
      const bx   = px + 20;
      const by   = py + 138;
      const bw   = pw - 40;
      const bh   = 68;   // 大きめ
      const col  = '#fa4';

      // 選択中は発光アニメ
      const glowPulse = sel ? 12 + Math.sin(t * 6) * 6 : 4;

      ctx.save();
      ctx.fillStyle   = sel ? 'rgba(255,170,0,0.18)' : 'rgba(255,170,0,0.07)';
      ctx.shadowColor = col;
      ctx.shadowBlur  = glowPulse;
      _roundRect(ctx, bx, by, bw, bh, 10);
      ctx.fill();
      ctx.strokeStyle = col;
      ctx.lineWidth   = sel ? 2 : 1;
      _roundRect(ctx, bx, by, bw, bh, 10);
      ctx.stroke();
      ctx.restore();

      // アイコン（家マーク）
      ctx.save();
      ctx.font         = '18px Courier New';
      ctx.fillStyle    = sel ? col : '#664';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor  = col;
      ctx.shadowBlur   = sel ? 10 : 0;
      ctx.fillText('⌂', cx - 68, by + bh / 2);
      ctx.restore();

      // メインラベル
      r.drawNeonText(
        'ステージ選択へ戻る',
        cx + 10, by + bh / 2 - 8,
        sel ? 17 : 15,
        sel ? col : '#664',
        sel ? 14 : 4,
        'center'
      );

      // サブラベル（小さく）
      ctx.save();
      ctx.font         = '10px Courier New';
      ctx.fillStyle    = sel ? 'rgba(255,170,0,0.8)' : '#443';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('強化・能力装備はここから', cx + 10, by + bh / 2 + 14);
      ctx.restore();
    }

    // ── 操作ヒント ──────────────────────────────
    ctx.save();
    ctx.font         = '10px Courier New';
    ctx.fillStyle    = '#335';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('↑↓ 選択  Z/Space 決定  ESC 再開  X 選択へ', cx, py + ph - 14);
    ctx.restore();
  }
}

/** 角丸矩形パスヘルパー */
function _roundRect(ctx, x, y, w, h, r = 8) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y,     x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x,     y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y,  x + r, y);
  ctx.closePath();
}
