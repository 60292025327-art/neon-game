/**
 * Boss3 — SHIELD FORTRESS
 * フェーズ0: バリア展開(1.5s) → 突進 → 全方向弾
 * フェーズ1: バリア中に自機狙い連射を追加
 * フェーズ2: 突進速度アップ・全方向弾2連射・攻撃頻度アップ
 */
import { Boss } from '../Boss.js';
import { LOGICAL_W } from '../../core/Renderer.js';

// バリアの状態
const STATE_IDLE    = 'idle';
const STATE_BARRIER = 'barrier';
const STATE_FIRE    = 'fire';

export class Boss3 extends Boss {
  constructor(bulletPool, audio) {
    super({
      name: 'SHIELD FORTRESS', hp: 4000, radius: 44,
      expValue: 0, scoreValue: 0,
      color: '#c0f', glowColor: '#80c',
    });
    this._bulletPool = bulletPool;
    this._audio      = audio;

    this._state       = STATE_IDLE;
    this._stateTimer  = 0;

    this._dashTimer   = 0;
    this._dashVx      = 0;

    this._barShotTimer = 0;   // バリア中の連射タイマー
    this._fired2nd     = false; // フェーズ2の2発目済みフラグ
  }

  _updateBehavior(delta, player) {
    this._moveHorizontal(delta, 1.6);

    switch (this._state) {

      // ── アイドル: 次の攻撃まで待機 ──────────
      case STATE_IDLE:
        if (this._attackTimer <= 0) {
          // バリアフェーズへ移行
          this._state      = STATE_BARRIER;
          this._stateTimer = 1.8;   // バリア持続時間
          this._barShotTimer = 0;
          this._startDash(player);
        }
        break;

      // ── バリア展開中 ──────────────────────────
      case STATE_BARRIER:
        this._stateTimer -= delta;

        // 突進
        if (this._dashTimer > 0) {
          this._dashTimer -= delta;
          this.x += this._dashVx * delta;
          this.x  = Math.max(this.radius + 10,
                    Math.min(LOGICAL_W - this.radius - 10, this.x));
        }

        // フェーズ1以降: バリア中に自機狙い弾を連射
        if (this.phase >= 1 && player) {
          this._barShotTimer -= delta;
          if (this._barShotTimer <= 0) {
            this._barShotTimer = this.phase === 2 ? 0.18 : 0.28;
            this._fireBarrierShot(player);
          }
        }

        // バリア時間終了 → 全方向弾フェーズへ
        if (this._stateTimer <= 0) {
          this._state     = STATE_FIRE;
          this._stateTimer = 0.15;  // 少し間を置いてから発射
          this._fired2nd  = false;
        }
        break;

      // ── 全方向弾発射 ─────────────────────────
      case STATE_FIRE:
        this._stateTimer -= delta;
        if (this._stateTimer <= 0) {
          this._fireOmni();

          // フェーズ2: 0.35秒後にもう1回
          if (this.phase >= 2 && !this._fired2nd) {
            this._fired2nd = true;
            this._stateTimer = 0.35;  // 再度 FIRE ステートで待機
          } else {
            // アイドルへ戻る
            const interval = this.phase === 2 ? 1.0 : this.phase === 1 ? 1.6 : 2.2;
            this._attackTimer = interval;
            this._state       = STATE_IDLE;
          }
        }
        break;
    }
  }

  get barrierActive() {
    return this._state === STATE_BARRIER;
  }

  _startDash(player) {
    if (!player) return;
    const speed     = this.phase === 2 ? 440 : this.phase === 1 ? 310 : 220;
    const dx        = player.x - this.x;
    this._dashVx    = (Math.sign(dx) || 1) * speed;
    this._dashTimer = 0.4;
  }

  _fireBarrierShot(player) {
    const dx   = player.x - this.x;
    const dy   = player.y - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    this._bulletPool.spawn(
      this.x, this.y,
      (dx / dist) * 220, (dy / dist) * 220,
      11, 4, '#0f8', 7
    );
  }

  _fireOmni() {
    const count = this.phase === 2 ? 22 : this.phase === 1 ? 17 : 12;
    const spd   = this.phase === 2 ? 250 : this.phase === 1 ? 210 : 165;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i;
      this._bulletPool.spawn(
        this.x, this.y,
        Math.cos(angle) * spd, Math.sin(angle) * spd,
        15, 6, '#c0f', 11
      );
    }
  }

  _renderBody(ctx, x, y, r) {
    // ── バリアリング ─────────────────────────────
    if (this.barrierActive) {
      // バリアの残り時間で透明度をアニメ
      const pulse = 0.55 + Math.sin(Date.now() * 0.012) * 0.3;

      // 外側グロー
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.shadowColor = '#0f8';
      ctx.shadowBlur  = 40;
      ctx.strokeStyle = '#0f8';
      ctx.lineWidth   = 5;
      ctx.beginPath();
      ctx.arc(x, y, r + 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 内側リング（白）
      ctx.save();
      ctx.globalAlpha = pulse * 0.5;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth   = 2;
      ctx.beginPath();
      ctx.arc(x, y, r + 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // バリア中テキスト
      ctx.save();
      ctx.globalAlpha  = pulse;
      ctx.font         = 'bold 10px Courier New';
      ctx.fillStyle    = '#0f8';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor  = '#0f8';
      ctx.shadowBlur   = 8;
      ctx.fillText('BARRIER', x, y - r - 28);
      ctx.restore();
    }

    // ── ボス本体 ─────────────────────────────────
    ctx.shadowColor = '#80c';
    ctx.shadowBlur  = 22;
    ctx.fillStyle   = this.barrierActive ? '#e0ff' : '#c0f';
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI / 4) * i + this._animTimer * 0.9;
      const rr    = i % 2 === 0 ? r : r * 0.58;
      const px    = x + rr * Math.cos(angle);
      const py    = y + rr * Math.sin(angle);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // コア
    ctx.fillStyle  = '#fff';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.fill();
  }
}
