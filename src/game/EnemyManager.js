/**
 * EnemyManager — 敵の生成・更新・削除管理
 */

import { Enemy, ENEMY_TYPES } from './Enemy.js';

export class EnemyManager {
  /**
   * @param {BulletPool}   enemyBulletPool
   * @param {object}       stageData  Stage1.js などの STAGE_N エクスポート
   */
  constructor(enemyBulletPool, stageData) {
    this._bulletPool  = enemyBulletPool;
    this._stageData   = stageData;
    this._enemies     = [];
    this._nextWave    = 0;  // 次に発火するウェーブのインデックス
    this.boss         = null;
    this.bossDefeated = false;
  }

  /** ゲームシーンの scrollY を渡して、トリガーを超えたウェーブを発火する */
  update(delta, scrollY, player) {
    // 最新の player 参照を保持（shoot コールバックが参照する）
    this._player = player;

    // ウェーブ発火チェック
    while (
      this._nextWave < this._stageData.waves.length &&
      scrollY >= this._stageData.waves[this._nextWave].triggerScrollY
    ) {
      this._spawnWave(this._stageData.waves[this._nextWave]);
      this._nextWave++;
    }

    // 全敵の更新
    for (const e of this._enemies) {
      e.update(delta, player);
    }

    // ボス更新
    if (this.boss && this.boss.isActive) {
      this.boss.update(delta, player);
      if (this.boss.hp <= 0) {
        this.boss.isActive = false;
        this.bossDefeated  = true;
      }
    }
    // 非アクティブな敵を削除
    this._enemies = this._enemies.filter(e => e.isActive);
  }

  _spawnWave(waveData) {
    if (waveData.isBoss) {
      this._bossSpawnCallback?.(waveData.bossType);
      return;
    }
    for (const def of (waveData.enemies ?? [])) {
      // shootFn は常に最新の _player を参照するクロージャ
      const shootFn = def.shoot
        ? (enemy) => this._defaultShoot(enemy, this._player)
        : null;
      const e = new Enemy(def.type, def.x, def.y, def.pattern, def.speed ?? 100, shootFn);
      this._enemies.push(e);
    }
  }

  /** ボス生成コールバックを登録する（GameScene から呼ぶ） */
  onBossSpawn(cb) {
    this._bossSpawnCallback = cb;
  }

  _defaultShoot(enemy, player) {
    if (!player) return;
    const dx   = player.x - enemy.x;
    const dy   = player.y - enemy.y;
    const dist = Math.hypot(dx, dy) || 1;

    // 敵タイプ別パラメータ
    const def = ENEMY_TYPES[enemy.type] ?? {
      bulletSpeed: 240, bulletDmg: 12, bulletRadius: 5, bulletColor: '#f84',
    };
    const spd = def.bulletSpeed ?? 240;

    this._bulletPool.spawn(
      enemy.x, enemy.y,
      (dx / dist) * spd,
      (dy / dist) * spd,
      def.bulletDmg    ?? 12,
      def.bulletRadius ?? 5,
      def.bulletColor  ?? '#f84',
      10
    );
  }

  /** アクティブな敵リスト（衝突判定用） */
  getEnemies() {
    const list = [...this._enemies];
    if (this.boss && this.boss.isActive) list.push(this.boss);
    return list;
  }

  render(ctx) {
    for (const e of this._enemies) e.render(ctx);
    if (this.boss && this.boss.isActive) this.boss.render(ctx);
  }

  reset() {
    this._enemies     = [];
    this._nextWave    = 0;
    this.boss         = null;
    this.bossDefeated = false;
  }
}
