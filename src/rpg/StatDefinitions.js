/**
 * StatDefinitions — ステータス定義定数
 * costPerLevel: 1レベル上げるのに必要な EXP
 * maxLevel:     最大レベル
 * compute(lv):  レベルから実数値を計算する関数
 */

export const STAT_DEFINITIONS = {
  maxHp: {
    label:        '最大HP',
    costPerLevel: 100,
    maxLevel:     10,
    unit:         'HP',
    compute:      (lv) => 100 + lv * 20,
  },
  moveSpeed: {
    label:        '移動速度',
    costPerLevel: 80,
    maxLevel:     10,
    unit:         '',
    compute:      (lv) => 3.0 + lv * 0.5,
  },
  shotPower: {
    label:        'ショット威力',
    costPerLevel: 120,
    maxLevel:     10,
    unit:         'dmg',
    compute:      (lv) => 10 + lv * 5,
  },
  shotRate: {
    label:        '連射速度',
    costPerLevel: 100,
    maxLevel:     10,
    unit:         'f',
    // フレーム間隔（小さいほど速い）最小2フレーム
    compute:      (lv) => Math.max(2, 12 - lv),
  },
  bombCount: {
    label:        'ボム所持数',
    costPerLevel: 150,
    maxLevel:     10,
    unit:         '個',
    compute:      (lv) => 2 + lv,
  },
  abilityPower: {
    label:        '能力威力',
    costPerLevel: 120,
    maxLevel:     10,
    unit:         '%',
    compute:      (lv) => 1.0 + lv * 0.1,
  },
  abilityRegen: {
    label:        'ゲージ回復速度',
    costPerLevel: 80,
    maxLevel:     10,
    unit:         '%/s',
    compute:      (lv) => 5 + lv * 0.5,
  },
};

/** ステータスキーの配列（UIでの表示順） */
export const STAT_KEYS = Object.keys(STAT_DEFINITIONS);

/**
 * allocations から実ゲーム用数値オブジェクトを計算して返す
 * @param {Record<string, number>} allocations
 * @returns {ComputedStats}
 */
export function computeStats(allocations) {
  const stats = {};
  for (const [key, def] of Object.entries(STAT_DEFINITIONS)) {
    stats[key] = def.compute(allocations[key] ?? 0);
  }
  return stats;
}
