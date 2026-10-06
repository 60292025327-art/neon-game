/**
 * Storage — localStorage ラッパー
 * SaveData の JSON シリアライズ・デシリアライズ、デフォルト値マージを担う
 */

const SAVE_KEY = 'neon_striker_save';

/** @returns {SaveData} デフォルトのセーブデータ */
function defaultSave() {
  return {
    totalExp: 0,
    allocations: {
      maxHp:        0,
      moveSpeed:    0,
      shotPower:    0,
      shotRate:     0,
      bombCount:    0,
      abilityPower: 0,
      abilityRegen: 0,
    },
    unlockedStages:   [true, false, false, false, false, false],
    acquiredAbilities: [false, false, false, false, false, false],
    equippedAbility:  null,
    highScores:       [0, 0, 0, 0, 0, 0],
  };
}

export class Storage {
  /** セーブデータを localStorage から読み込む（なければデフォルト値を返す） */
  static load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return defaultSave();

      const parsed = JSON.parse(raw);
      // デフォルト値とディープマージ（キー追加時の後方互換）
      return deepMerge(defaultSave(), parsed);
    } catch {
      return defaultSave();
    }
  }

  /** セーブデータを localStorage に書き込む */
  static save(data) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('[Storage] 保存に失敗しました:', e);
    }
  }

  /** セーブデータを削除（デバッグ用） */
  static clear() {
    localStorage.removeItem(SAVE_KEY);
  }
}

/**
 * ディープマージ（base にない新キーは無視、base のキーを優先しつつ
 * saved の値で上書き）
 */
function deepMerge(base, saved) {
  const result = { ...base };
  for (const key of Object.keys(base)) {
    if (!(key in saved)) continue;
    if (
      typeof base[key] === 'object' &&
      base[key] !== null &&
      !Array.isArray(base[key])
    ) {
      result[key] = deepMerge(base[key], saved[key]);
    } else {
      result[key] = saved[key];
    }
  }
  return result;
}
