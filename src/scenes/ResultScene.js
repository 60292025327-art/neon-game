/**
 * ResultScene — リザルト画面
 *
 * クリア時の表示順:
 *   1. 能力開放演出（ABILITY UNLOCKED カード）
 *   2. Z/Space で次へ → スコア・EXP サマリ
 *   3. Z/Space でステージ選択（abilityタブ）へ
 */
import { LOGICAL_W, LOGICAL_H } from '../core/Renderer.js';

// ボス能力の詳細情報
const ABILITY_INFO = [
  {
    name:  '貫通レーザー',
    color: '#4af',
    desc:  '画面を縦断する超高威力レーザーを発射する。\n全ての敵を貫通し連続ダメージを与える。',
    icon:  (ctx, cx, cy, t) => _drawLaserIcon(ctx, cx, cy, t),
  },
  {
    name:  '追尾ミサイル',
    color: '#f84',
    desc:  '自機を3秒間追尾するミサイルを3発発射する。\n敵に命中すると大爆発を起こす。',
    icon:  (ctx, cx, cy, t) => _drawMissileIcon(ctx, cx, cy, t),
  },
  {
    name:  '全方位バリア',
    color: '#0f8',
    desc:  '3秒間の無敵バリアを展開する。\nバリア中に触れた敵にも反射ダメージを与える。',
    icon:  (ctx, cx, cy, t) => _drawBarrierIcon(ctx, cx, cy, t),
  },
  {
    name:  'タイムスロー',
    color: '#0cf',
    desc:  '2秒間、敵と敵弾の動きを25%に減速させる。\n密弾幕を突破するのに有効。',
    icon:  (ctx, cx, cy, t) => _drawSlowIcon(ctx, cx, cy, t),
  },
  {
    name:  'ギガチャージ',
    color: '#fa0',
    desc:  '1.5秒チャージ後、全方向24発の弾幕を\n一斉発射する超強力攻撃。',
    icon:  (ctx, cx, cy, t) => _drawChargeIcon(ctx, cx, cy, t),
  },
  {
    name:  '画面爆発',
    color: '#f44',
    desc:  '画面上の全ての敵と弾を消去し\n壊滅的なダメージを与える最終兵器。',
    icon:  (ctx, cx, cy, t) => _drawBlastIcon(ctx, cx, cy, t),
  },
];

export class ResultScene {
  constructor(renderer, input, sm, expSystem, audio) {
    this._renderer = renderer;
    this._input    = input;
    this._sm       = sm;
    this._exp      = expSystem;
    this._audio    = audio;

    this._timer    = 0;
    this._data     = null;

    // 能力開放フェーズ管理
    // 'ability' → 能力カード表示  'summary' → スコアサマリ
    this._phase    = 'summary';

    // 能力カードのアニメ
    this._cardScale   = 0;
    this._cardShown   = false;
    this._particles   = [];
  }

  onEnter(data) {
    this._data  = data;
    this._timer = 0;
    this._cardScale = 0;
    this._cardShown = false;
    this._particles = [];

    // クリアかつ新能力があれば能力フェーズから開始
    this._phase = (data.cleared && data.newAbilityId !== null)
      ? 'ability'
      : 'summary';

    // EXP 加算・ステージ解放・スコア更新（クリアなら毎回）
    if (data.cleared) {
      this._exp.addExp(data.expGained);
      const nextStage = data.stageId + 1;
      if (nextStage < 6) this._exp.unlockStage(nextStage);
      // 初回クリア時のみ能力を解放
      if (data.newAbilityId !== null) {
        this._exp.acquireAbility(data.newAbilityId);
      }
    }
    this._exp.updateHighScore(data.stageId, data.score);
    this._exp.save();

    // パーティクル初期化
    if (this._phase === 'ability') {
      this._spawnCardParticles(data.newAbilityId);
    }
  }

  onExit() {}

  _spawnCardParticles(abilityId) {
    const info  = ABILITY_INFO[abilityId];
    const color = info?.color ?? '#fff';
    for (let i = 0; i < 40; i++) {
      this._particles.push({
        x:     Math.random() * LOGICAL_W,
        y:     LOGICAL_H + 10,
        vx:    (Math.random() - 0.5) * 120,
        vy:    -(80 + Math.random() * 180),
        life:  1.0 + Math.random() * 1.5,
        maxLife: 1.0 + Math.random() * 1.5,
        r:     2 + Math.random() * 3,
        color,
      });
    }
  }

  update(delta) {
    this._timer += delta;

    // パーティクル更新
    for (const p of this._particles) {
      p.life -= delta;
      p.x    += p.vx * delta;
      p.y    += p.vy * delta;
      p.vy   += 60 * delta;
    }
    this._particles = this._particles.filter(p => p.life > 0);

    // ── 能力開放フェーズ ──
    if (this._phase === 'ability') {
      // カードのスケールイン（最初の 0.5 秒）
      this._cardScale = Math.min(1, this._timer / 0.5);

      // 0.3 秒後に追加パーティクル補充
      if (this._timer > 0.3 && this._timer < 0.35 && this._data.newAbilityId !== null) {
        this._spawnCardParticles(this._data.newAbilityId);
      }

      // 1 秒後から入力受付
      if (this._timer > 1.0 && this._input.isJustPressed('CONFIRM')) {
        this._phase = 'summary';
        this._timer = 0;
      }
      return;
    }

    // ── サマリフェーズ ──
    if (this._timer > 1.0 && this._input.isJustPressed('CONFIRM')) {
      // ステージ選択の ability タブを開いて遷移
      this._sm.transition('stageSelect', {
        openTab: this._data.cleared ? 'ability' : 'stage',
      });
    }
  }

  render(ctx) {
    const data = this._data;
    if (!data) return;
    const r  = this._renderer;
    const cx = LOGICAL_W / 2;

    // 背景
    ctx.fillStyle = '#030310';
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

    // パーティクル
    for (const p of this._particles) {
      const alpha = p.life / p.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = p.color;
      ctx.shadowBlur  = 6;
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (this._phase === 'ability') {
      this._renderAbilityPhase(ctx, r, cx, data);
    } else {
      this._renderSummaryPhase(ctx, r, cx, data);
    }
  }

  // ──────────────────────────────────────────
  // 能力開放フェーズ描画
  // ──────────────────────────────────────────

  _renderAbilityPhase(ctx, r, cx, data) {
    const t     = this._timer;
    const info  = ABILITY_INFO[data.newAbilityId];
    if (!info) return;

    const scale = this._cardScale;
    const cy    = LOGICAL_H / 2;

    // ── 「ABILITY UNLOCKED」ヘッダ ──
    const headerAlpha = Math.min(1, t * 3);
    ctx.save();
    ctx.globalAlpha = headerAlpha;
    r.drawNeonText('ABILITY  UNLOCKED', cx, 80, 22, '#ff0', 18, 'center');
    ctx.restore();

    // ── 能力カード（スケールイン） ──
    ctx.save();
    ctx.translate(cx, cy + 20);
    ctx.scale(scale, scale);

    // カード背景
    const cw = 300, ch = 280;
    ctx.fillStyle = 'rgba(0,8,24,0.95)';
    ctx.shadowColor = info.color;
    ctx.shadowBlur  = 30 * scale;
    _roundRectPath(ctx, -cw / 2, -ch / 2, cw, ch, 12);
    ctx.fill();

    // カード枠（二重）
    ctx.strokeStyle = info.color;
    ctx.lineWidth   = 2;
    ctx.shadowBlur  = 20;
    _roundRectPath(ctx, -cw / 2, -ch / 2, cw, ch, 12);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth   = 1;
    ctx.shadowBlur  = 0;
    _roundRectPath(ctx, -cw / 2 + 4, -ch / 2 + 4, cw - 8, ch - 8, 10);
    ctx.stroke();

    // アイコン描画
    info.icon(ctx, 0, -60, t);

    // 能力名
    ctx.shadowColor = info.color;
    ctx.shadowBlur  = 16;
    ctx.font        = `bold 22px 'Courier New', monospace`;
    ctx.fillStyle   = info.color;
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(info.name, 0, 30);

    // 白コア
    ctx.shadowBlur  = 5;
    ctx.fillStyle   = 'rgba(255,255,255,0.9)';
    ctx.fillText(info.name, 0, 30);

    // 説明文（2行対応）
    ctx.font         = '11px Courier New';
    ctx.fillStyle    = '#aac';
    ctx.shadowBlur   = 0;
    const lines = info.desc.split('\n');
    lines.forEach((line, i) => {
      ctx.fillText(line, 0, 68 + i * 18);
    });

    // ステージバッジ
    const badgeColor = STAGE_COLORS[data.stageId]?.accent ?? '#fff';
    ctx.fillStyle   = `${badgeColor}33`;
    ctx.strokeStyle = badgeColor;
    ctx.lineWidth   = 1;
    ctx.shadowBlur  = 6;
    ctx.shadowColor = badgeColor;
    _roundRectPath(ctx, -50, 108, 100, 22, 6);
    ctx.fill();
    ctx.stroke();
    ctx.font      = 'bold 11px Courier New';
    ctx.fillStyle = badgeColor;
    ctx.shadowBlur = 4;
    ctx.fillText(`STAGE ${data.stageId + 1} BOSS DROP`, 0, 119);

    ctx.restore();

    // ── 次へボタン（1秒後に表示） ──
    if (t > 1.0) {
      const blink = Math.floor(t * 2) % 2 === 0;
      if (blink) {
        r.drawNeonText(
          'Z / SPACE  →  スコア確認へ',
          cx, LOGICAL_H - 40, 12, '#ff0', 10, 'center'
        );
      }
    }
  }

  // ──────────────────────────────────────────
  // スコアサマリフェーズ描画
  // ──────────────────────────────────────────

  _renderSummaryPhase(ctx, r, cx, data) {
    const t       = this._timer;
    const palette = STAGE_COLORS[data.stageId];

    // ── クリア / ゲームオーバー タイトル ──
    if (data.cleared) {
      const pulse = 1 + Math.sin(t * 3) * 0.04;
      ctx.save();
      ctx.translate(cx, 110);
      ctx.scale(pulse, pulse);
      r.drawNeonText('STAGE  CLEAR!', 0, 0, 28, '#0f8', 20, 'center');
      ctx.restore();
    } else {
      r.drawNeonText('GAME  OVER', cx, 110, 28, '#f44', 20, 'center');
    }

    // ステージ名
    r.drawNeonText(
      `STAGE ${data.stageId + 1}`,
      cx, 158, 14, palette.accent, 8, 'center'
    );

    // ── パネル ──
    const panel = { x: 50, y: 185, w: LOGICAL_W - 100, h: 320 };
    ctx.save();
    ctx.fillStyle = 'rgba(0,6,20,0.9)';
    _roundRectPath(ctx, panel.x, panel.y, panel.w, panel.h, 10);
    ctx.fill();
    ctx.restore();
    r.drawNeonRect(panel.x, panel.y, panel.w, panel.h, '#0af', 6, false);

    // ── 行データ ──
    const rows = [
      { label: 'SCORE',      value: data.score.toLocaleString(),                    color: '#0af' },
      { label: 'HIGH SCORE', value: this._exp.getHighScore(data.stageId).toLocaleString(), color: '#08f' },
    ];
    if (data.cleared) {
      rows.push({ label: 'EXP 獲得',  value: `+ ${data.expGained.toLocaleString()}`, color: '#ff0' });
      if (data.newAbilityId !== null) {
        const info = ABILITY_INFO[data.newAbilityId];
        rows.push({ label: '獲得能力', value: info?.name ?? '???',                  color: '#0f8' });
      }
      const nextStage = data.stageId + 1;
      if (nextStage < 6) {
        rows.push({ label: 'UNLOCKED', value: `STAGE ${nextStage + 1}`,             color: '#fa4' });
      }
    }

    rows.forEach((row, i) => {
      const ry = panel.y + 28 + i * 54;

      // ラベル
      ctx.save();
      ctx.font         = '10px Courier New';
      ctx.fillStyle    = '#446';
      ctx.textAlign    = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(row.label, panel.x + 20, ry);
      ctx.restore();

      // 値（スライドイン）
      const slideAlpha = Math.min(1, (t - i * 0.12) * 4);
      if (slideAlpha > 0) {
        ctx.save();
        ctx.globalAlpha = slideAlpha;
        r.drawNeonText(
          row.value,
          panel.x + panel.w - 20,
          ry + 24,
          17, row.color, 10, 'right'
        );
        ctx.restore();
      }
    });

    // ── 続けるボタン ──
    if (t > 1.0) {
      const blink = Math.floor(t * 2) % 2 === 0;
      if (blink) {
        const label = data.cleared
          ? 'Z / SPACE  →  能力を装備しに行く'
          : 'Z / SPACE  →  ステージ選択へ';
        r.drawNeonText(label, cx, LOGICAL_H - 40, 12, '#ff0', 10, 'center');
      }
    }
  }
}

// ──────────────────────────────────────────
// 能力アイコン描画関数
// ──────────────────────────────────────────

function _roundRectPath(ctx, x, y, w, h, r = 8) {
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

function _drawLaserIcon(ctx, cx, cy, t) {
  ctx.save();
  ctx.shadowColor = '#4af';
  ctx.shadowBlur  = 20;
  // 縦レーザー
  ctx.strokeStyle = '#4af';
  ctx.lineWidth   = 4;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 40);
  ctx.lineTo(cx, cy + 40);
  ctx.stroke();
  // コア
  ctx.strokeStyle = '#fff';
  ctx.lineWidth   = 1.5;
  ctx.stroke();
  // 横スパーク
  for (let i = -3; i <= 3; i++) {
    const y = cy + i * 12;
    const w = 6 + Math.sin(t * 8 + i) * 3;
    ctx.beginPath();
    ctx.moveTo(cx - w, y);
    ctx.lineTo(cx + w, y);
    ctx.strokeStyle = 'rgba(100,200,255,0.5)';
    ctx.lineWidth   = 1;
    ctx.stroke();
  }
  ctx.restore();
}

function _drawMissileIcon(ctx, cx, cy, t) {
  ctx.save();
  ctx.shadowColor = '#f84';
  ctx.shadowBlur  = 16;
  for (let i = 0; i < 3; i++) {
    const ox = (i - 1) * 20;
    const oy = Math.sin(t * 4 + i * 2) * 5;
    ctx.fillStyle = '#f84';
    ctx.beginPath();
    ctx.moveTo(cx + ox, cy + oy - 20);
    ctx.lineTo(cx + ox - 5, cy + oy + 10);
    ctx.lineTo(cx + ox + 5, cy + oy + 10);
    ctx.closePath();
    ctx.fill();
    // 炎
    ctx.fillStyle = 'rgba(255,200,0,0.7)';
    ctx.beginPath();
    ctx.arc(cx + ox, cy + oy + 14, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function _drawBarrierIcon(ctx, cx, cy, t) {
  ctx.save();
  ctx.shadowColor = '#0f8';
  ctx.shadowBlur  = 20;
  for (let ring = 0; ring < 2; ring++) {
    const r = 28 + ring * 8;
    ctx.strokeStyle = ring === 0 ? '#0f8' : 'rgba(0,255,136,0.4)';
    ctx.lineWidth   = ring === 0 ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  // 回転する六角形
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(t * 1.5);
  ctx.strokeStyle = 'rgba(0,255,136,0.6)';
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a  = (Math.PI / 3) * i;
    const px = Math.cos(a) * 18;
    const py = Math.sin(a) * 18;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}

function _drawSlowIcon(ctx, cx, cy, t) {
  ctx.save();
  ctx.shadowColor = '#0cf';
  ctx.shadowBlur  = 18;
  // 時計
  ctx.strokeStyle = '#0cf';
  ctx.lineWidth   = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 28, 0, Math.PI * 2);
  ctx.stroke();
  // 針（ゆっくり動く）
  const angle = t * 0.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(angle - Math.PI / 2) * 20, cy + Math.sin(angle - Math.PI / 2) * 20);
  ctx.stroke();
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(angle * 0.5) * 14, cy + Math.sin(angle * 0.5) * 14);
  ctx.stroke();
  // 中心
  ctx.fillStyle = '#0cf';
  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function _drawChargeIcon(ctx, cx, cy, t) {
  ctx.save();
  ctx.shadowColor = '#fa0';
  ctx.shadowBlur  = 22;
  const charge = (Math.sin(t * 3) + 1) / 2;
  // 収束リング
  for (let i = 0; i < 3; i++) {
    const r = 30 - i * 6 - charge * 6;
    ctx.strokeStyle = `rgba(255,${160 + i * 30},0,${0.3 + i * 0.25})`;
    ctx.lineWidth   = 2 - i * 0.4;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  // 中心コア
  const coreR = 6 + charge * 8;
  ctx.fillStyle = '#fa0';
  ctx.beginPath();
  ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(cx, cy, coreR * 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function _drawBlastIcon(ctx, cx, cy, t) {
  ctx.save();
  ctx.shadowColor = '#f44';
  ctx.shadowBlur  = 25;
  const count = 8;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 / count) * i + t * 0.8;
    const len   = 22 + Math.sin(t * 5 + i) * 6;
    ctx.strokeStyle = i % 2 === 0 ? '#f44' : '#f84';
    ctx.lineWidth   = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * 8, cy + Math.sin(angle) * 8);
    ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
    ctx.stroke();
  }
  ctx.fillStyle = '#ff4';
  ctx.beginPath();
  ctx.arc(cx, cy, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ステージカラー参照用（ResultScene 内で直接定義）
const STAGE_COLORS = [
  { accent: '#00aaff' }, { accent: '#ff4400' }, { accent: '#cc00ff' },
  { accent: '#00ff88' }, { accent: '#ffaa00' }, { accent: '#ff0044' },
];
