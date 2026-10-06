/**
 * GameScene — メインゲームプレイシーン
 */
import { LOGICAL_W, LOGICAL_H } from '../core/Renderer.js';
import { ScrollBackground, STAGE_COLORS } from '../game/ScrollBackground.js';
import { BulletPool }      from '../game/BulletPool.js';
import { ParticleSystem }  from '../game/ParticleSystem.js';
import { CollisionSystem } from '../game/CollisionSystem.js';
import { Player }          from '../game/Player.js';
import { EnemyManager }    from '../game/EnemyManager.js';
import { AbilityManager }  from '../abilities/AbilityManager.js';

// ステージデータ
import { STAGE_1 } from '../game/stages/Stage1.js';
import { STAGE_2 } from '../game/stages/Stage2.js';
import { STAGE_3 } from '../game/stages/Stage3.js';
import { STAGE_4 } from '../game/stages/Stage4.js';
import { STAGE_5 } from '../game/stages/Stage5.js';
import { STAGE_6 } from '../game/stages/Stage6.js';

// ボス
import { Boss1 } from '../game/stages/Boss1.js';
import { Boss2 } from '../game/stages/Boss2.js';
import { Boss3 } from '../game/stages/Boss3.js';
import { Boss4 } from '../game/stages/Boss4.js';
import { Boss5 } from '../game/stages/Boss5.js';
import { Boss6 } from '../game/stages/Boss6.js';

const STAGE_DATA   = [STAGE_1, STAGE_2, STAGE_3, STAGE_4, STAGE_5, STAGE_6];
const BOSS_CLASSES = [Boss1, Boss2, Boss3, Boss4, Boss5, Boss6];

export class GameScene {
  constructor(renderer, input, sm, expSystem, audio) {
    this._renderer    = renderer;
    this._input       = input;
    this._sm          = sm;
    this._exp         = expSystem;
    this._audio       = audio;
    this._stageId     = 0;
    this._initialized = false;

    // サブシステム（_init で再生成）
    this._bg            = new ScrollBackground();
    this._playerBullets = new BulletPool();
    this._enemyBullets  = new BulletPool();
    this._particles     = new ParticleSystem();
    this._collision     = new CollisionSystem();
    this._abilityMgr    = new AbilityManager(audio);

    // ゲーム状態
    this.score          = 0;
    this._scrollY       = 0;
    this._player        = null;
    this._enemyMgr      = null;

    // 終了管理
    this._ended         = false;
    this._endTimer      = 0;
    this._resultData    = null;

    // ボス撃破演出タイマー群
    this._bossExplosions = []; // [{timer, interval, total, done}]

    // フロートテキスト（EXP /スコア表示）
    this._floatTexts    = [];

    // フラッシュ演出
    this._flashTimer    = 0;
    this._flashColor    = '#fff';
    this._flashDuration = 0;

    // ポップアップテキスト（ボス能力獲得など）
    this._popup         = null; // {text, timer, color}

    // ステージ名表示
    this._stageNameTimer = 0;
  }

  // ──────────────────────────────────────────
  // ライフサイクル
  // ──────────────────────────────────────────

  onEnter({ stageId = 0, resume = false } = {}) {
    if (resume && this._initialized) {
      return;
    }
    this._stageId = stageId;
    this._init();
    this._audio.resume();
    this._audio.startBGM(stageId);
  }

  onExit() {
    this._audio.stopBGM();
  }

  _init() {
    this._initialized   = true;
    this._ended         = false;
    this._endTimer      = 0;
    this._resultData    = null;
    this.score          = 0;
    this._scrollY       = 0;
    this._floatTexts    = [];
    this._bossExplosions = [];
    this._flashTimer    = 0;
    this._popup         = null;
    this._stageNameTimer = 3.0; // ステージ名を3秒間表示

    const stats = this._exp.getComputedStats();

    this._bg.setStage(this._stageId);

    // サブシステムを新規生成（前のゲームの状態をリセット）
    this._playerBullets = new BulletPool();
    this._enemyBullets  = new BulletPool();
    this._particles     = new ParticleSystem();

    this._player = new Player(
      this._playerBullets, this._particles, this._audio, stats
    );

    const stageData    = STAGE_DATA[this._stageId];
    this._enemyMgr     = new EnemyManager(this._enemyBullets, stageData);
    this._enemyMgr.onBossSpawn(() => this._spawnBoss());

    this._abilityMgr   = new AbilityManager(this._audio);
    const equipped     = this._exp.equippedAbility;
    if (equipped !== null) {
      this._abilityMgr.setEquipped(equipped);
    }
  }

  _spawnBoss() {
    const BossClass = BOSS_CLASSES[this._stageId];
    if (!BossClass) return;
    this._enemyMgr.boss = new BossClass(
      this._enemyBullets, this._audio, this._particles
    );
    // ボス出現演出
    this._triggerFlash('#fff', 0.4, 0.3);
    this._renderer.shake(8, 0.4);
    this._showPopup(`BOSS APPEARED`, '#f44');
  }

  // ──────────────────────────────────────────
  // 演出ヘルパー
  // ──────────────────────────────────────────

  _triggerFlash(color, alpha, duration) {
    this._flashColor    = color;
    this._flashTimer    = alpha;        // 現在アルファ
    this._flashDuration = duration;     // 1秒あたりフェードアウト量として使う
  }

  _showPopup(text, color = '#ff0') {
    this._popup = { text, color, timer: 2.5 };
  }

  // ──────────────────────────────────────────
  // ゲーム状態オブジェクト（AbilityManager 等に渡す）
  // ──────────────────────────────────────────

  _getGameState() {
    return {
      player:        this._player,
      playerBullets: this._playerBullets,
      enemyBullets:  this._enemyBullets,
      enemies:       this._enemyMgr?.getEnemies() ?? [],
      particles:     this._particles,
      expSystem:     this._exp,
      renderer:      this._renderer,
      state:         this,
    };
  }

  // ──────────────────────────────────────────
  // 更新
  // ──────────────────────────────────────────

  update(delta) {
    if (!this._initialized) return;

    // ESC または X → 即ステージ選択へ戻る
    if (!this._ended) {
      if (this._input.isJustPressed('PAUSE') || this._input.isJustPressed('BACK')) {
        this._sm.transition('stageSelect');
        return;
      }
    }

    // 演出タイマー更新（ended 中も継続）
    this._updateVfx(delta);

    // ── 終了演出中 ──
    if (this._ended) {
      this._endTimer -= delta;
      this._particles.update(delta);

      // ボス撃破後の連続爆発
      this._updateBossExplosions(delta);

      if (this._endTimer <= 0) {
        this._sm.transition('result', this._resultData);
      }
      return;
    }

    // ── タイムスロー係数 ──
    const ab          = this._abilityMgr.activeAbility;
    const ts          = ab?.timeScale ?? 1.0;
    const scaledDelta = delta * ts;

    // ── 背景スクロール ──
    const stageData = STAGE_DATA[this._stageId];
    this._scrollY  += stageData.scrollSpeed * delta;
    this._bg.update(delta, stageData.scrollSpeed);

    // ── プレイヤー操作 ──
    this._player.update(delta, this._input);

    // ボム
    if (this._input.isJustPressed('BOMB')) {
      const ok = this._player.activateBomb(
        this._enemyBullets,
        this._particles,
        this._enemyMgr.getEnemies()
      );
      if (ok) {
        this._triggerFlash('#0cf', 0.35, 0.5);
        this._renderer.shake(8, 0.3);
      }
    }

    // 能力発動
    if (this._input.isJustPressed('ABILITY')) {
      const ok = this._abilityMgr.activate(
        this._getGameState(),
        this._exp.getComputedStats()
      );
      if (ok && this._exp.equippedAbility !== null) {
        this._triggerFlash('#fff', 0.2, 0.3);
      }
    }

    // ── 敵・弾・パーティクル更新 ──
    this._enemyMgr.update(scaledDelta, this._scrollY, this._player);
    this._playerBullets.update(delta);
    this._enemyBullets.update(scaledDelta);
    this._particles.update(delta);

    // ── 能力更新 ──
    this._abilityMgr.update(delta, this._getGameState(), this._exp.getComputedStats());

    // ── 衝突判定 ──
    this._collision.checkAll(
      this._player,
      this._playerBullets,
      this._enemyMgr.getEnemies(),
      this._enemyBullets,
      this._particles,
      this._exp,
      this,
    );

    // ── フロートテキスト ──
    this._floatTexts = this._floatTexts.filter(ft => ft.life > 0);
    for (const ft of this._floatTexts) {
      ft.life -= delta;
      ft.y    -= 45 * delta;
      ft.alpha = Math.min(1, ft.life / 0.4);
    }

    // ── ゲームオーバー判定 ──
    if (this._player.hp <= 0) {
      this._endGame(false);
      return;
    }

    // ── ボス撃破判定 ──
    if (this._enemyMgr.bossDefeated) {
      this._onBossDefeated();
    }
  }

  _updateVfx(delta) {
    // フラッシュフェードアウト
    if (this._flashTimer > 0) {
      this._flashTimer -= delta / (this._flashDuration || 0.3);
      if (this._flashTimer < 0) this._flashTimer = 0;
    }

    // ポップアップ
    if (this._popup) {
      this._popup.timer -= delta;
      if (this._popup.timer <= 0) this._popup = null;
    }

    // ステージ名表示タイマー
    if (this._stageNameTimer > 0) this._stageNameTimer -= delta;
  }

  _updateBossExplosions(delta) {
    for (const ev of this._bossExplosions) {
      if (ev.done) continue;
      ev.timer -= delta;
      if (ev.timer <= 0 && ev.count < ev.total) {
        ev.timer = ev.interval;
        ev.count++;
        const palette = STAGE_COLORS[this._stageId] ?? { accent: '#fff', secondary: '#ff0' };
        this._particles.emit(
          60 + Math.random() * (LOGICAL_W - 120),
          60 + Math.random() * 240,
          {
            count:      32,
            speed:      160,
            spread:     Math.PI * 2,
            colors:     [palette.accent, '#fff', '#ff0', palette.secondary],
            radius:     5,
            radiusVar:  3,
            lifetime:   1.0,
            lifetimeVar: 0.3,
            gravity:    15,
          }
        );
        this._renderer.shake(6, 0.15);
        this._audio?.playEnemyDestroy();
        if (ev.count >= ev.total) ev.done = true;
      }
    }
  }

  /** CollisionSystem の onEnemyKilled から呼ばれる */
  onEnemyKilled(enemy) {
    this._floatTexts.push({
      text:  `+${enemy.expValue}`,
      x:     enemy.x,
      y:     enemy.y - 10,
      life:  0.8,
      alpha: 1,
    });
  }

  _onBossDefeated() {
    this._enemyMgr.bossDefeated = false;
    const stageData = STAGE_DATA[this._stageId];
    const expGained = stageData.bossExpBonus;
    this.score     += stageData.bossScoreBonus;

    // 大爆発演出スケジュール（ゲームループ内タイマー）
    this._bossExplosions.push({ timer: 0, interval: 0.22, total: 8, count: 0, done: false });

    this._renderer.shake(18, 1.2);
    this._triggerFlash('#fff', 0.8, 0.6);
    this._audio?.playBossDestroy();

    // 初回クリアかどうかで表示を変える
    const isFirstClear = !this._exp.isAbilityAcquired(this._stageId);
    this._showPopup(isFirstClear ? 'ABILITY ACQUIRED!' : 'STAGE CLEAR!', isFirstClear ? '#0f8' : '#ff0');

    this._endGame(true, {
      expGained,
      newAbilityId: isFirstClear ? this._stageId : null,
    });
  }

  _endGame(cleared, extra = {}) {
    if (this._ended) return; // 二重起動防止
    this._ended    = true;
    this._endTimer = cleared ? 3.5 : 2.0;
    this._resultData = {
      cleared,
      stageId:      this._stageId,
      score:        this.score,
      expGained:    extra.expGained ?? 0,
      newAbilityId: extra.newAbilityId ?? null,
    };
    if (!cleared) {
      this._renderer.shake(12, 0.6);
      this._triggerFlash('#f00', 0.5, 0.4);
    }
  }

  // ──────────────────────────────────────────
  // 描画
  // ──────────────────────────────────────────

  render(ctx) {
    if (!this._initialized) return;
    const r = this._renderer;

    // Layer 1: 背景
    this._bg.render(ctx);

    // Layer 2: 敵
    this._enemyMgr.render(ctx);

    // Layer 3: 敵弾
    this._enemyBullets.render(ctx);

    // Layer 4: 自機
    this._player.render(ctx);

    // Layer 5: 自機弾
    this._playerBullets.render(ctx);

    // Layer 6: パーティクル
    this._particles.render(ctx);

    // Layer 7: 能力エフェクト
    this._abilityMgr.renderEffect(ctx, this._getGameState());

    // Layer 8: フロートテキスト
    for (const ft of this._floatTexts) {
      ctx.save();
      ctx.globalAlpha = ft.alpha ?? 1;
      r.drawNeonText(ft.text, ft.x, ft.y, 11, '#ff0', 7, 'center');
      ctx.restore();
    }

    // Layer 9: 全画面フラッシュ
    if (this._flashTimer > 0) {
      r.drawFlash(this._flashColor, this._flashTimer);
    }

    // Layer 10: HUD
    this._renderHUD(ctx, r);

    // Layer 11: ステージ名（開幕演出）
    if (this._stageNameTimer > 0) {
      this._renderStageName(ctx, r);
    }

    // Layer 12: ポップアップ
    if (this._popup) {
      this._renderPopup(ctx, r);
    }

    // Layer 13: ゲームオーバー演出
    if (this._ended && !this._resultData?.cleared) {
      const elapsed = 2.0 - this._endTimer;
      const alpha   = Math.min(0.75, elapsed * 0.5);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = '#000';
      ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
      ctx.globalAlpha = 1;
      r.drawNeonText('GAME  OVER', LOGICAL_W / 2, LOGICAL_H / 2, 30, '#f44', 22, 'center');
      ctx.restore();
    }
  }

  _renderHUD(ctx, r) {
    const p  = this._player;
    const cx = LOGICAL_W / 2;

    // ────────────────────────────────────────
    // 画面下部：自機ステータス
    // ────────────────────────────────────────
    const hudY = LOGICAL_H - 48;  // 下部 HUD の基準 Y

    // 自機 HP バー（下部左）
    r.drawBar(10, hudY, 200, 14, p.hp / p.maxHp, '#0f4', '#0a120a', 8);
    ctx.save();
    ctx.font         = 'bold 10px Courier New';
    ctx.fillStyle    = '#8fa';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`HP  ${Math.max(0, p.hp)} / ${p.maxHp}`, 12, hudY + 16);
    ctx.restore();

    // ボム残数（HP バーの右隣）
    ctx.save();
    ctx.font         = '14px Courier New';
    ctx.fillStyle    = '#88f';
    ctx.shadowColor  = '#44f';
    ctx.shadowBlur   = 6;
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'top';
    const bombStr = '◆'.repeat(Math.max(0, p.bombs));
    ctx.fillText(bombStr || '—', 10, hudY + 32);
    ctx.restore();

    // ── スコア（右上）──
    r.drawNeonText(this.score.toLocaleString(), LOGICAL_W - 10, 18, 14, '#0af', 8, 'right');

    // ── 操作ヒント（右上） ──
    ctx.save();
    ctx.font         = '9px Courier New';
    ctx.fillStyle    = '#334';
    ctx.textAlign    = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText('X / ESC : ステージ選択へ戻る', LOGICAL_W - 8, 28);
    ctx.restore();

    // ── 能力ゲージ（下部右）──
    this._abilityMgr.renderGauge(ctx, r);

    // ── ステータスアイコン（タイムスロー / バリア）──
    const ab = this._abilityMgr.activeAbility;
    if (ab?.timeScale && ab.timeScale < 1) {
      ctx.save();
      ctx.font         = 'bold 11px Courier New';
      ctx.fillStyle    = 'rgba(100,200,255,0.9)';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor  = '#0af';
      ctx.shadowBlur   = 8;
      ctx.fillText('◈ TIME SLOW ◈', cx, hudY + 8);
      ctx.restore();
    }
    if (p.hasBarrier) {
      ctx.save();
      ctx.font         = 'bold 11px Courier New';
      ctx.fillStyle    = 'rgba(0,255,140,0.9)';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor  = '#0f8';
      ctx.shadowBlur   = 8;
      ctx.fillText('◈ BARRIER ◈', cx, hudY + 8);
      ctx.restore();
    }
  }

  _renderStageName(ctx, r) {
    const alpha = Math.min(1, this._stageNameTimer) * Math.min(1, (3.0 - this._stageNameTimer) * 2);
    const stageData = STAGE_DATA[this._stageId];
    ctx.save();
    ctx.globalAlpha = alpha;
    r.drawNeonText(stageData.name, LOGICAL_W / 2, LOGICAL_H / 2 - 20, 28, '#fff', 20, 'center');
    ctx.restore();
  }

  _renderPopup(ctx, r) {
    const p      = this._popup;
    const alpha  = Math.min(1, p.timer) * Math.min(1, (2.5 - p.timer) * 3);
    const yOff   = (2.5 - p.timer) * -20;
    ctx.save();
    ctx.globalAlpha = alpha;
    r.drawNeonText(p.text, LOGICAL_W / 2, LOGICAL_H / 2 + yOff, 20, p.color, 16, 'center');
    ctx.restore();
  }
}
