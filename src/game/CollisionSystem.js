/**
 * CollisionSystem — 円同士の衝突判定
 */

export function isColliding(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const r  = a.radius + b.radius;
  return dx * dx + dy * dy < r * r;
}

export class CollisionSystem {
  checkAll(player, playerBullets, enemies, enemyBullets, particles, expSystem, state) {
    const pActive = playerBullets.getActive();
    const eActive = enemyBullets.getActive();

    // ── 自機弾 → 敵 ──────────────────────────────────────
    for (const bullet of pActive) {
      for (const enemy of enemies) {
        if (!enemy.isActive) continue;
        if (!isColliding(bullet, enemy)) continue;

        // バリア中のボスには弾が当たらない（弾を消費して弾く）
        if (enemy.barrierActive) {
          if (!bullet.isPiercing) bullet.deactivate();
          continue;
        }

        const waAlive = enemy.isActive;
        enemy.takeDamage(bullet.dmg);
        if (!bullet.isPiercing) bullet.deactivate();

        // takeDamage 後に isActive が false になっていれば撃破
        if (waAlive && !enemy.isActive) {
          this._onEnemyKilled(enemy, particles, expSystem, state);
        }
      }
    }

    // ── 敵弾 → 自機 ──────────────────────────────────────
    if (!player.isInvincible && !player.hasBarrier) {
      for (const bullet of eActive) {
        if (isColliding(bullet, player)) {
          bullet.deactivate();
          player.takeDamage(bullet.dmg);
        }
      }
    }

    // ── 敵体 → 自機（接触）────────────────────────────────
    if (!player.isInvincible) {
      for (const enemy of enemies) {
        if (!enemy.isActive) continue;
        if (!isColliding(enemy, player)) continue;

        if (player.hasBarrier) {
          const wasAlive = enemy.isActive;
          enemy.takeDamage(10);
          if (wasAlive && !enemy.isActive) {
            this._onEnemyKilled(enemy, particles, expSystem, state);
          }
        } else {
          player.takeDamage(20);
        }
      }
    }
  }

  /** 雑魚敵撃破時の共通処理（ボスは EnemyManager 側で処理） */
  _onEnemyKilled(enemy, particles, expSystem, state) {
    // ボスは EnemyManager.update で bossDefeated を立てるので除外
    if (enemy.maxHp >= 1200) return;

    particles.emit(enemy.x, enemy.y, {
      count:       14,
      speed:       95,
      spread:      Math.PI * 2,
      colors:      [enemy.color ?? '#f84', '#ff6', '#f40'],
      radius:      3,
      radiusVar:   2,
      lifetime:    0.6,
      lifetimeVar: 0.2,
      gravity:     20,
    });
    expSystem.addExp(enemy.expValue);
    state.score += enemy.scoreValue;
    state.onEnemyKilled?.(enemy);
  }
}
