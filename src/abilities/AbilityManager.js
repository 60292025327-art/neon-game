/**
 * AbilityManager — ボス能力ゲージ管理・発動制御
 */

import { LOGICAL_W } from '../core/Renderer.js';
import { LaserAbility }     from './abilities/LaserAbility.js';
import { MissileAbility }   from './abilities/MissileAbility.js';
import { BarrierAbility }   from './abilities/BarrierAbility.js';
import { TimeSlowAbility }  from './abilities/TimeSlowAbility.js';
import { GigaChargeAbility } from './abilities/GigaChargeAbility.js';
import { MegaBlastAbility } from './abilities/MegaBlastAbility.js';

const ABILITY_CLASSES = [
  LaserAbility,
  MissileAbility,
  BarrierAbility,
  TimeSlowAbility,
  GigaChargeAbility,
  MegaBlastAbility,
];

export class AbilityManager {
  constructor(audio) {
    this._audio = audio;
    this.gauge  = 0;     // 0.0 〜 100.0
    this._equippedId  = null;
    this._activeAbility = null;

    // 全能力インスタンスを事前生成
    this._abilities = ABILITY_CLASSES.map((Cls, i) => new Cls(i));
  }

  setEquipped(bossId) {
    this._equippedId = bossId;
    this._activeAbility = null;
  }

  /** 毎フレーム呼ぶ */
  update(delta, gameState, stats) {
    // ゲージ自動回復
    if (this._equippedId !== null) {
      this.gauge = Math.min(100, this.gauge + stats.abilityRegen * delta);
    }

    // 発動中の能力を更新
    if (this._activeAbility) {
      this._activeAbility.onUpdate(delta, gameState);
      if (this._activeAbility.isFinished) {
        this._activeAbility.onDeactivate(gameState);
        this._activeAbility = null;
      }
    }
  }

  /** Z/J キー押下時に呼ぶ */
  activate(gameState, stats) {
    if (this._equippedId === null) return false;
    const ability = this._abilities[this._equippedId];
    if (!ability) return false;
    if (this.gauge < ability.gaugeCost) return false;
    if (this._activeAbility) return false;  // 既に発動中

    this.gauge -= ability.gaugeCost;
    this._activeAbility = ability;
    ability.onActivate(gameState, stats);
    this._audio?.playAbility(this._equippedId);
    return true;
  }

  get isActive() {
    return this._activeAbility !== null;
  }

  get activeAbility() {
    return this._activeAbility;
  }

  renderEffect(ctx, gameState) {
    this._activeAbility?.renderEffect(ctx, gameState);
  }

  /** ゲージ UI を HUD に描画する */
  renderGauge(ctx, renderer) {
    if (this._equippedId === null) return;

    const x = LOGICAL_W - 200;  // 右下に配置
    const y = 672;
    const w = 180;
    const h = 12;

    renderer.drawBar(x, y, w, h, this.gauge / 100, '#0f8', '#0a1a0a', 8);

    const ability = this._abilities[this._equippedId];
    const canUse  = this.gauge >= ability.gaugeCost;

    ctx.save();
    ctx.font         = 'bold 10px Courier New';
    ctx.fillStyle    = canUse ? '#0f8' : '#446';
    ctx.shadowColor  = canUse ? '#0f8' : 'transparent';
    ctx.shadowBlur   = canUse ? 6 : 0;
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`[Z] ${ability.name}`, x, y - 1);
    // ゲージ数値
    ctx.textAlign = 'right';
    ctx.fillStyle = '#888';
    ctx.shadowBlur = 0;
    ctx.fillText(`${Math.floor(this.gauge)}%`, x + w, y - 1);
    ctx.restore();
  }
}
