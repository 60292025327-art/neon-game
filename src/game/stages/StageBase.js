/**
 * StageBase — ステージデータのファクトリ関数
 * 各 Stage?.js はこのフォーマットに準拠したオブジェクトをエクスポートする
 *
 * @typedef {{
 *   id: number,
 *   name: string,
 *   scrollSpeed: number,
 *   bossExpBonus: number,
 *   bossScoreBonus: number,
 *   waves: WaveDef[],
 * }} StageData
 *
 * @typedef {{
 *   triggerScrollY: number,
 *   isBoss?: boolean,
 *   bossType?: string,
 *   enemies?: EnemyDef[],
 * }} WaveDef
 *
 * @typedef {{
 *   type: string,   ENEMY_TYPES のキー
 *   x: number,
 *   y: number,
 *   pattern: string,
 *   speed?: number,
 *   shoot?: boolean,
 * }} EnemyDef
 */
