/**
 * StageSelectScene — ステージ選択・EXP強化・装備変更
 */
import { LOGICAL_W, LOGICAL_H } from '../core/Renderer.js';
import { STAT_DEFINITIONS, STAT_KEYS } from '../rpg/StatDefinitions.js';
import { STAGE_COLORS } from '../game/ScrollBackground.js';

const ABILITY_NAMES = [
  '貫通レーザー', '追尾ミサイル', '全方位バリア',
  'タイムスロー', 'ギガチャージ', '画面爆発',
];

export class StageSelectScene {
  constructor(renderer, input, sm, expSystem, audio) {
    this._renderer   = renderer;
    this._input      = input;
    this._sm         = sm;
    this._exp        = expSystem;
    this._audio      = audio;
    this._selectedStage = 0;
    this._tab        = 'stage'; // 'stage' | 'upgrade' | 'ability'
    this._upgradeIdx = 0;
    this._cursor     = 0;
    this._repeatTimer = 0;
    this._message    = '';
    this._messageTimer = 0;
  }

  onEnter({ openTab } = {}) {
    this._selectedStage = 0;
    this._tab  = openTab ?? 'stage';
    this._cursor = 0;
    // ロード最新状態
    this._exp.load();
  }

  onExit() {
    this._exp.save();
  }

  update(delta) {
    if (this._messageTimer > 0) this._messageTimer -= delta;

    // タブ切り替え（← →）
    if (this._input.isJustPressed('MOVE_LEFT')) {
      const tabs = ['stage', 'upgrade', 'ability'];
      const idx  = tabs.indexOf(this._tab);
      this._tab  = tabs[(idx + 2) % 3];
    }
    if (this._input.isJustPressed('MOVE_RIGHT')) {
      const tabs = ['stage', 'upgrade', 'ability'];
      const idx  = tabs.indexOf(this._tab);
      this._tab  = tabs[(idx + 1) % 3];
    }

    if (this._tab === 'stage')   this._updateStageTab(delta);
    if (this._tab === 'upgrade') this._updateUpgradeTab(delta);
    if (this._tab === 'ability') this._updateAbilityTab(delta);
  }

  _updateStageTab(delta) {
    if (this._input.isJustPressed('MOVE_UP'))   this._selectedStage = Math.max(0, this._selectedStage - 1);
    if (this._input.isJustPressed('MOVE_DOWN')) this._selectedStage = Math.min(5, this._selectedStage + 1);

    if (this._input.isJustPressed('CONFIRM')) {
      if (this._exp.isStageUnlocked(this._selectedStage)) {
        this._exp.save();
        this._sm.transition('game', { stageId: this._selectedStage });
      } else {
        this._showMsg('ステージがロックされています');
      }
    }
  }

  _updateUpgradeTab(delta) {
    if (this._input.isJustPressed('MOVE_UP'))
      this._upgradeIdx = Math.max(0, this._upgradeIdx - 1);
    if (this._input.isJustPressed('MOVE_DOWN'))
      this._upgradeIdx = Math.min(STAT_KEYS.length - 1, this._upgradeIdx + 1);

    const key = STAT_KEYS[this._upgradeIdx];

    // Z / CONFIRM → 割り当て+1
    if (this._input.isJustPressed('CONFIRM') || this._input.isJustPressed('ABILITY')) {
      const ok = this._exp.allocate(key);
      if (ok) { this._audio?.playLevelUp(); this._showMsg(`${STAT_DEFINITIONS[key].label} ▲`); }
      else this._showMsg('EXP 不足 or 上限');
    }
    // X / BOMB → 割り当て-1
    if (this._input.isJustPressed('BOMB')) {
      const ok = this._exp.deallocate(key);
      if (ok) { this._showMsg(`${STAT_DEFINITIONS[key].label} ▼`); }
      else this._showMsg('これ以上下げられません');
    }

    // Start(Escape) → 全リセット
    if (this._input.isJustPressed('PAUSE')) {
      this._exp.resetAll();
      this._showMsg('全リセット！');
    }
  }

  _updateAbilityTab(delta) {
    if (this._input.isJustPressed('MOVE_UP'))
      this._cursor = Math.max(0, this._cursor - 1);
    if (this._input.isJustPressed('MOVE_DOWN'))
      this._cursor = Math.min(5, this._cursor + 1);

    if (this._input.isJustPressed('CONFIRM')) {
      if (this._exp.isAbilityAcquired(this._cursor)) {
        this._exp.setEquippedAbility(this._cursor);
        this._showMsg(`${ABILITY_NAMES[this._cursor]} を装備`);
      } else {
        this._showMsg('未獲得の能力です');
      }
    }
    // 装備解除
    if (this._input.isJustPressed('BOMB')) {
      this._exp.setEquippedAbility(null);
      this._showMsg('能力を外した');
    }
  }

  _showMsg(text) {
    this._message      = text;
    this._messageTimer = 2.0;
  }

  render(ctx) {
    const r  = this._renderer;
    const cx = LOGICAL_W / 2;

    // 背景
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

    // タイトル
    r.drawNeonText('BASE  CAMP', cx, 28, 18, '#0af', 14, 'center');

    // タブ
    const tabs = ['STAGE', 'UPGRADE', 'ABILITY'];
    const tw   = 140;
    tabs.forEach((t, i) => {
      const tx   = 30 + i * tw;
      const active = ['stage','upgrade','ability'][i] === this._tab;
      r.drawNeonRect(tx, 48, tw - 4, 24, active ? '#0af' : '#224', active ? 10 : 3, active);
      r.drawNeonText(t, tx + (tw - 4) / 2, 60, 11, active ? '#fff' : '#448', active ? 10 : 4, 'center');
    });

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 78, LOGICAL_W, LOGICAL_H - 100);
    ctx.clip();

    if (this._tab === 'stage')   this._renderStageTab(ctx, r);
    if (this._tab === 'upgrade') this._renderUpgradeTab(ctx, r);
    if (this._tab === 'ability') this._renderAbilityTab(ctx, r);

    ctx.restore();

    // メッセージ
    if (this._messageTimer > 0) {
      const alpha = Math.min(1, this._messageTimer / 0.5);
      ctx.save();
      ctx.globalAlpha = alpha;
      r.drawNeonText(this._message, cx, LOGICAL_H - 32, 13, '#ff0', 12, 'center');
      ctx.restore();
    }

    // ヒント
    ctx.save();
    ctx.font      = '10px Courier New';
    ctx.fillStyle = '#336';
    ctx.textAlign = 'center';
    ctx.fillText('← → タブ切替  ↑↓ 選択  Z/Enter 決定  SHIFT 解除/リセット  ESC 全リセット(UPGタブ)', cx, LOGICAL_H - 8);
    ctx.restore();
  }

  _renderStageTab(ctx, r) {
    const stats = this._exp.getComputedStats();
    for (let i = 0; i < 6; i++) {
      const unlocked = this._exp.isStageUnlocked(i);
      const selected = i === this._selectedStage;
      const y  = 90 + i * 92;
      const cx = LOGICAL_W / 2;
      const palette = STAGE_COLORS[i];

      r.drawNeonRect(20, y, LOGICAL_W - 40, 80,
        selected ? palette.accent : (unlocked ? '#224' : '#111'),
        selected ? 15 : 4, false
      );

      if (unlocked) {
        r.drawNeonText(`STAGE ${i + 1}`, 50, y + 22, 16, palette.accent, 12, 'left');
        // ハイスコア
        const hs = this._exp.getHighScore(i);
        ctx.save();
        ctx.font = '11px Courier New';
        ctx.fillStyle = '#aaa';
        ctx.textAlign = 'left';
        ctx.fillText(`BEST: ${hs.toLocaleString()}`, 50, y + 44);
        ctx.restore();
        if (selected) {
          r.drawNeonText('[SPACE/Z] プレイ', cx, y + 64, 11, '#ff0', 8, 'center');
        }
      } else {
        ctx.save();
        ctx.font      = '14px Courier New';
        ctx.fillStyle = '#334';
        ctx.textAlign = 'center';
        ctx.fillText(`🔒 STAGE ${i + 1}  — LOCKED —`, cx, y + 40);
        ctx.restore();
      }
    }
  }

  _renderUpgradeTab(ctx, r) {
    const cx = LOGICAL_W / 2;
    // EXP 表示
    r.drawNeonText(`利用可能 EXP: ${this._exp.availableExp}`, cx, 92, 13, '#ff0', 10, 'center');

    STAT_KEYS.forEach((key, i) => {
      const def  = STAT_DEFINITIONS[key];
      const lv   = this._exp.saveData.allocations[key] ?? 0;
      const val  = def.compute(lv);
      const sel  = i === this._upgradeIdx;
      const y    = 110 + i * 82;

      r.drawNeonRect(18, y, LOGICAL_W - 36, 76, sel ? '#0af' : '#1a2', sel ? 10 : 3, false);

      // ラベル
      r.drawNeonText(def.label, 34, y + 16, 12, sel ? '#fff' : '#8af', sel ? 8 : 4, 'left');

      // レベルバー
      r.drawBar(34, y + 28, 260, 8, lv / def.maxLevel, '#0af', '#112', 5);

      ctx.save();
      ctx.font      = '11px Courier New';
      ctx.fillStyle = '#aaa';
      ctx.textAlign = 'left';
      ctx.fillText(`Lv.${lv}/${def.maxLevel}  →  ${val}${def.unit}  (cost ${def.costPerLevel} EXP/Lv)`, 34, y + 50);
      ctx.restore();

      // ボタンヒント
      if (sel) {
        r.drawNeonText('[Z]+  [SHIFT]-', LOGICAL_W - 24, y + 35, 10, '#ff0', 7, 'right');
      }
    });
  }

  _renderAbilityTab(ctx, r) {
    const cx = LOGICAL_W / 2;
    const equipped = this._exp.equippedAbility;

    r.drawNeonText('ボス能力 装備', cx, 92, 13, '#0af', 10, 'center');

    for (let i = 0; i < 6; i++) {
      const acquired = this._exp.isAbilityAcquired(i);
      const isEquip  = equipped === i;
      const sel      = i === this._cursor;
      const y        = 110 + i * 86;

      r.drawNeonRect(18, y, LOGICAL_W - 36, 78,
        isEquip ? '#0f8' : (sel ? '#0af' : (acquired ? '#224' : '#111')),
        (isEquip || sel) ? 12 : 3, false
      );

      const nameColor = acquired ? (isEquip ? '#0f8' : '#0af') : '#334';
      ctx.save();
      ctx.font      = `bold 13px Courier New`;
      ctx.fillStyle = nameColor;
      ctx.textAlign = 'left';
      ctx.fillText(
        acquired ? `${i + 1}. ${ABILITY_NAMES[i]}${isEquip ? '  ◀ 装備中' : ''}` : `${i + 1}. ???  🔒`,
        36, y + 28
      );
      if (acquired) {
        ctx.font      = '11px Courier New';
        ctx.fillStyle = '#668';
        ctx.fillText(`Stage ${i + 1} ボス撃破で獲得`, 36, y + 52);
      }
      ctx.restore();
    }
  }
}
