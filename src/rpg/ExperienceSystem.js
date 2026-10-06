/**
 * ExperienceSystem — EXP 管理・振り直しシステム
 */

import { STAT_DEFINITIONS, STAT_KEYS, computeStats } from './StatDefinitions.js';
import { Storage } from '../core/Storage.js';

export class ExperienceSystem {
  constructor() {
    /** @type {import('../core/Storage.js').SaveData} */
    this._save = Storage.load();
  }

  // ──────────────────────────────────────────
  // EXP
  // ──────────────────────────────────────────

  /** 累計獲得 EXP（減らない） */
  get totalExp() {
    return this._save.totalExp;
  }

  /** 現在消費済み EXP */
  get consumedExp() {
    let total = 0;
    for (const key of STAT_KEYS) {
      const lv = this._save.allocations[key] ?? 0;
      total += STAT_DEFINITIONS[key].costPerLevel * lv;
    }
    return total;
  }

  /** 振り分け可能な残 EXP */
  get availableExp() {
    return this._save.totalExp - this.consumedExp;
  }

  /**
   * EXP を加算する（ゲーム中に呼ぶ）
   * @param {number} amount
   */
  addExp(amount) {
    this._save.totalExp += amount;
  }

  // ──────────────────────────────────────────
  // ステータス振り分け
  // ──────────────────────────────────────────

  /**
   * ステータスを1レベル上げる
   * @param {string} statKey
   * @returns {boolean} 成功したか
   */
  allocate(statKey) {
    const def = STAT_DEFINITIONS[statKey];
    if (!def) return false;

    const current = this._save.allocations[statKey] ?? 0;
    if (current >= def.maxLevel) return false;

    const cost = def.costPerLevel;
    if (this.availableExp < cost) return false;

    this._save.allocations[statKey] = current + 1;
    return true;
  }

  /**
   * ステータスを1レベル下げる（EXP 還元）
   * @param {string} statKey
   * @returns {boolean} 成功したか
   */
  deallocate(statKey) {
    const def = STAT_DEFINITIONS[statKey];
    if (!def) return false;

    const current = this._save.allocations[statKey] ?? 0;
    if (current <= 0) return false;

    this._save.allocations[statKey] = current - 1;
    return true;
  }

  /**
   * 全ステータスをリセットし EXP を全額還元する
   */
  resetAll() {
    for (const key of STAT_KEYS) {
      this._save.allocations[key] = 0;
    }
  }

  /**
   * 現在の振り分けから実ゲーム用数値を返す
   * @returns {ComputedStats}
   */
  getComputedStats() {
    return computeStats(this._save.allocations);
  }

  // ──────────────────────────────────────────
  // ステージ解放・能力
  // ──────────────────────────────────────────

  /** @param {number} stageIndex  0 起点 */
  isStageUnlocked(stageIndex) {
    return this._save.unlockedStages[stageIndex] === true;
  }

  unlockStage(stageIndex) {
    if (stageIndex >= 0 && stageIndex < 6) {
      this._save.unlockedStages[stageIndex] = true;
    }
  }

  isAbilityAcquired(bossIndex) {
    return this._save.acquiredAbilities[bossIndex] === true;
  }

  acquireAbility(bossIndex) {
    if (bossIndex >= 0 && bossIndex < 6) {
      this._save.acquiredAbilities[bossIndex] = true;
    }
  }

  get equippedAbility() {
    return this._save.equippedAbility;
  }

  setEquippedAbility(bossIndex) {
    this._save.equippedAbility = bossIndex;
  }

  // ──────────────────────────────────────────
  // スコア
  // ──────────────────────────────────────────

  getHighScore(stageIndex) {
    return this._save.highScores[stageIndex] ?? 0;
  }

  updateHighScore(stageIndex, score) {
    if (score > (this._save.highScores[stageIndex] ?? 0)) {
      this._save.highScores[stageIndex] = score;
    }
  }

  // ──────────────────────────────────────────
  // 永続化
  // ──────────────────────────────────────────

  save() {
    Storage.save(this._save);
  }

  load() {
    this._save = Storage.load();
  }

  /** デバッグ用: セーブデータ全体を返す */
  get saveData() {
    return this._save;
  }
}
