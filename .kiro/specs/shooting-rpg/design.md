# 技術設計書 — 縦スクロールシューティング＋RPG成長要素ゲーム

## 1. アーキテクチャ概要

```
index.html
└── src/
    ├── main.js              # エントリーポイント・起動処理
    ├── core/
    │   ├── GameLoop.js      # requestAnimationFrame ループ管理
    │   ├── StateMachine.js  # ゲーム全体の状態遷移管理
    │   ├── InputManager.js  # キー入力の一元管理
    │   ├── Renderer.js      # Canvas コンテキスト・描画ユーティリティ
    │   └── Storage.js       # localStorage ラッパー
    ├── scenes/
    │   ├── TitleScene.js    # タイトル画面
    │   ├── StageSelectScene.js  # ステージ選択・強化画面
    │   ├── GameScene.js     # メインゲームプレイ
    │   ├── PauseScene.js    # ポーズ画面（オーバーレイ）
    │   └── ResultScene.js   # リザルト画面
    ├── game/
    │   ├── Player.js        # 自機エンティティ
    │   ├── EnemyManager.js  # 敵の生成・更新・削除管理
    │   ├── Enemy.js         # 敵基底クラス
    │   ├── Boss.js          # ボス基底クラス
    │   ├── BulletPool.js    # 弾プール（自機弾・敵弾共用）
    │   ├── ParticleSystem.js # パーティクル管理
    │   ├── ScrollBackground.js # 背景スクロール
    │   ├── CollisionSystem.js  # 衝突判定
    │   └── stages/
    │       ├── Stage1.js … Stage6.js  # ステージ固有データ＆ウェーブ定義
    ├── abilities/
    │   ├── AbilityManager.js    # ボス能力の発動・ゲージ管理
    │   └── abilities/
    │       ├── LaserAbility.js      # B1: 貫通レーザー
    │       ├── MissileAbility.js    # B2: 追尾ミサイル
    │       ├── BarrierAbility.js    # B3: 全方位バリア
    │       ├── TimeSlowAbility.js   # B4: タイムスロー
    │       ├── GigaChargeAbility.js # B5: ギガチャージ
    │       └── MegaBlastAbility.js  # B6: 画面爆発
    ├── rpg/
    │   ├── ExperienceSystem.js  # EXP 管理・振り直しシステム
    │   └── StatDefinitions.js   # ステータス定義定数
    └── audio/
        ├── AudioEngine.js       # Web Audio API ラッパー
        └── SoundEffects.js      # SE 生成プリセット
```

### 採用技術・制約
- **言語:** Vanilla JavaScript ES2022+（モジュール構成、TypeScript は将来移行可）
- **描画:** HTML5 Canvas 2D Context（`shadowBlur` でネオン発光表現）
- **音声:** Web Audio API（外部ファイルなし、手続き生成のみ）
- **永続化:** `localStorage`（JSON シリアライズ）
- **ビルド:** ES Modules + `<script type="module">` で import/export を使用（バンドル不要）
- **解像度:** 論理サイズ 480×720 px、`devicePixelRatio` 対応でシャープ描画

---

## 2. ゲームループ設計

### 2.1 GameLoop

```
GameLoop
  ├─ start()          requestAnimationFrame を開始
  ├─ stop()           ループを停止
  ├─ _tick(timestamp)
  │   ├─ delta 計算（最大 50ms でキャップ）
  │   ├─ StateMachine.update(delta)
  │   ├─ StateMachine.render(ctx)
  │   └─ requestAnimationFrame(_tick) で再帰
  └─ fps             直近1秒の実測 FPS（デバッグ表示用）
```

- `delta` は秒単位（例: 1/60 = 0.01667s）で統一し、フレームレート非依存の移動量計算に使用する。
- ポーズ中は `delta = 0` を `update` に渡すことで、描画のみ継続しオブジェクトを静止させる。

### 2.2 状態遷移（StateMachine）

```
┌─────────┐  START  ┌─────────────┐  PLAY   ┌───────────┐
│  TITLE  │────────▶│ STAGE_SELECT│────────▶│   GAME    │
└─────────┘         └─────────────┘         └─────┬─────┘
                           ▲  BACK                │
                           │               PAUSE  │  CLEAR/GAMEOVER
                           │           ┌──────────┤
                           │           ▼          ▼
                           │       ┌───────┐  ┌────────┐
                           └───────│RESULT │  │ PAUSE  │
                                   └───────┘  └────────┘
```

**Sceneインターフェース（各シーンが実装）:**
```js
interface Scene {
  onEnter(params?)  // 遷移時初期化
  onExit()          // 遷移時クリーンアップ
  update(delta)     // ロジック更新
  render(ctx)       // 描画
}
```

---

## 3. 入力管理（InputManager）

```js
// 保持するマップ
pressedKeys: Set<string>   // 現在押されているキー
justPressed: Set<string>   // このフレームで押されたキー
justReleased: Set<string>  // このフレームで離されたキー

// フレーム末尾で呼ぶ
flush()  // justPressed / justReleased をクリア
```

**アクション → キーのマッピング定数:**
```js
const ACTION_MAP = {
  MOVE_UP:    ['ArrowUp',    'KeyW'],
  MOVE_DOWN:  ['ArrowDown',  'KeyS'],
  MOVE_LEFT:  ['ArrowLeft',  'KeyA'],
  MOVE_RIGHT: ['ArrowRight', 'KeyD'],
  SHOOT:      ['Space'],
  ABILITY:    ['KeyZ', 'KeyJ'],
  BOMB:       ['ShiftLeft', 'ShiftRight'],
  PAUSE:      ['Escape'],
}
```

---

## 4. エンティティ設計

### 4.1 Player

```js
class Player {
  // 状態
  x, y            // 論理座標
  hp, maxHp
  bombs           // 残ボム数
  invincibleTimer // 被弾後無敵時間
  shootCooldown   // 連射クールダウン

  // ステータス参照（ExperienceSystem から計算済み値を受け取る）
  stats: ComputedStats

  update(delta, input)
  shoot()         // BulletPool に自機弾を追加
  takeDamage(dmg)
  activateBomb()
  render(ctx)
}
```

### 4.2 Enemy / Boss

```js
class Enemy {
  x, y, hp, maxHp
  type: EnemyType    // SMALL / MEDIUM / LARGE / ELITE
  expValue: number   // 撃破時 EXP
  scoreValue: number
  movementPattern   // Function(t) -> {dx, dy}
  shootPattern      // BulletPool へ弾を追加するコールバック
  update(delta)
  takeDamage(dmg)
  render(ctx)
}

class Boss extends Enemy {
  phase: number       // 体力割合で相変化（100% / 60% / 30%）
  specialAbility      // ボス固有能力インスタンス
  abilityTimer        // 発動タイミング管理
  phaseChange()       // 演出＋行動パターン変更
}
```

### 4.3 BulletPool

- **オブジェクトプール** で弾を事前確保（最大 512 発）し、GC プレッシャーを抑える。
- 自機弾と敵弾を別プールとして管理。
- 弾プロパティ: `x, y, vx, vy, dmg, radius, color, isActive`

---

## 5. EXP＆振り直しシステム設計（ExperienceSystem）

### 5.1 データモデル

```js
// localStorage に保存するオブジェクト
interface SaveData {
  totalExp: number               // 累計獲得 EXP（減らない）
  allocations: Record<StatKey, number>  // 各ステータスへの割り当てレベル
  unlockedStages: boolean[]      // [false, false, false, false, false, false]（インデックス0=S1）
  acquiredAbilities: boolean[]   // [false, false, false, false, false, false]
  equippedAbility: number | null // ボスID (0〜5) または null
  highScores: number[]           // [0, 0, 0, 0, 0, 0]
}
```

### 5.2 ステータス定義（StatDefinitions）

```js
const STAT_DEFINITIONS = {
  maxHp:        { label: '最大HP',         costPerLevel: 100, maxLevel: 10,
                  compute: (lv) => 100 + lv * 20 },
  moveSpeed:    { label: '移動速度',        costPerLevel: 80,  maxLevel: 10,
                  compute: (lv) => 3.0 + lv * 0.5 },
  shotPower:    { label: 'ショット威力',    costPerLevel: 120, maxLevel: 10,
                  compute: (lv) => 10 + lv * 5 },
  shotRate:     { label: '連射速度',        costPerLevel: 100, maxLevel: 10,
                  compute: (lv) => Math.max(2, 12 - lv) },   // フレーム間隔
  bombCount:    { label: 'ボム所持数',      costPerLevel: 150, maxLevel: 10,
                  compute: (lv) => 2 + lv },
  abilityPower: { label: '能力威力',        costPerLevel: 120, maxLevel: 10,
                  compute: (lv) => 1.0 + lv * 0.1 },
  abilityRegen: { label: 'ゲージ回復速度', costPerLevel: 80,  maxLevel: 10,
                  compute: (lv) => 5 + lv * 0.5 },          // %/秒
}
```

### 5.3 主要メソッド

```js
class ExperienceSystem {
  // EXP の加算（ゲーム中に呼ぶ）
  addExp(amount: number): void

  // 利用可能 EXP（cumulative - 消費済み）
  get availableExp(): number

  // ステータス1レベル上げ（消費可能かチェック込み）
  allocate(statKey: StatKey): boolean

  // ステータス1レベル下げ（EXP 還元）
  deallocate(statKey: StatKey): boolean

  // 全ステータスをリセット（EXP 全額還元）
  resetAll(): void

  // 現在のステータスから実ゲーム用数値を返す
  getComputedStats(): ComputedStats

  // localStorage へ永続化
  save(): void

  // localStorage から復元
  load(): void
}
```

**消費済み EXP の計算:**
```
consumedExp = Σ (statKey → STAT_DEFINITIONS[key].costPerLevel * allocations[key])
availableExp = totalExp - consumedExp
```

---

## 6. ボス能力システム設計（AbilityManager）

### 6.1 能力ゲージ

```
AbilityManager {
  gauge: number       // 0.0 〜 100.0
  isActive: boolean   // 発動中フラグ
  activeDuration: number  // 発動中の残り時間

  update(delta, stats)
    → gauge += stats.abilityRegen * delta  // 自動回復
    → 発動中は activeDuration をデクリメント

  activate(abilityId, stats)
    → gauge >= 能力コスト なら発動
    → gauge を消費し、能力エフェクト開始

  render(ctx)  // ゲージUI描画
}
```

### 6.2 能力インターフェース

```js
interface Ability {
  id: number
  name: string
  gaugeCost: number        // 発動に必要なゲージ量
  duration: number         // 持続時間（秒）

  onActivate(gameState, stats): void   // 発動時処理
  onUpdate(delta, gameState): void     // 持続中の毎フレーム処理
  onDeactivate(gameState): void        // 終了時処理
  renderEffect(ctx, gameState): void  // 発動中の専用エフェクト描画
}
```

### 6.3 各能力の実装概要

| 能力 | gaugeCost | duration | 主な実装ポイント |
|------|-----------|----------|-----------------|
| 貫通レーザー | 60 | 1.5s | y=0〜720 の細い矩形、当たった全敵に連続ダメージ |
| 追尾ミサイル | 50 | 3.0s | 3発の Missile エンティティ、毎フレーム自機方向へ角度補正 |
| 全方位バリア | 40 | 3.0s | Player に `barrier=true` セット、被弾無効＋接触敵ダメージ |
| タイムスロー | 45 | 2.0s | EnemyManager/BulletPool の update に渡す delta に係数 0.5 を乗算 |
| ギガチャージ | 70 | チャージ1.5s+発射 | チャージ中は自機固定、発射時 360°に弾幕 |
| 画面爆発 | 100 | 瞬間 | 全敵 HP をゼロに、全弾を削除、フラッシュ演出 |

---

## 7. パーティクルシステム設計

```js
class Particle {
  x, y, vx, vy
  life, maxLife   // 0.0〜1.0 の正規化ライフ
  radius, color
  alpha           // life に連動してフェードアウト
}

class ParticleSystem {
  pool: Particle[]    // 最大 512 個プール
  emit(x, y, options: {
    count, speed, spread, colors, radius, lifetime
  })
  update(delta)
  render(ctx)
}
```

**発生パターン:**
- 雑魚敵撃破: 8〜12 個、0.4s、オレンジ〜赤グラデーション
- ボス撃破: 64 個、1.2s、ステージカラーに対応した多色
- ボム発動: 全画面放射、白〜水色、0.8s

---

## 8. 衝突判定設計

全エンティティの当たり判定は **円** で統一（シンプルさ優先）。

```
isColliding(a, b): boolean
  → dx = a.x - b.x
  → dy = a.y - b.y
  → dx*dx + dy*dy < (a.radius + b.radius)^2
```

**判定の組み合わせ（毎フレーム）:**

| 判定 | 対象A | 対象B | 結果 |
|------|-------|-------|------|
| 自機弾 → 敵 | PlayerBullet | Enemy/Boss | 敵ダメージ、弾削除 |
| 敵弾 → 自機 | EnemyBullet | Player | 自機ダメージ、弾削除 |
| 敵体 → 自機 | Enemy/Boss | Player | 自機ダメージ（接触） |
| バリア → 敵 | Player(barrier) | Enemy | 敵ダメージ（バリア発動中のみ） |

**最適化:** 広域フェーズとして Canvas 論理座標で Y 軸のソート＋バンドフィルタを適用し、判定ペア数を削減する。

---

## 9. 背景スクロール設計

```js
class ScrollBackground {
  layers: StarLayer[]   // 奥・中・前景の3レイヤー
  scrollY: number       // 累積スクロール量

  update(delta, stageSpeed)  // scrollY += stageSpeed * delta
  render(ctx, stageColor)    // 各レイヤーの輝点を stageColor 系でネオン描画
}

class StarLayer {
  stars: { x, y, size, speed }[]  // 各レイヤーで視差速度が異なる
}
```

ステージカラーパレット例:
| ステージ | 背景色 | アクセント |
|----------|--------|-----------|
| 1 | `#0a0a1a` (濃紺) | `#00aaff` (水色ネオン) |
| 2 | `#0a0a0a` (黒) | `#ff4400` (オレンジ) |
| 3 | `#0a001a` (濃紫) | `#cc00ff` (紫) |
| 4 | `#001a0a` (濃緑) | `#00ff88` (エメラルド) |
| 5 | `#1a0a00` (濃茶) | `#ffaa00` (黄金) |
| 6 | `#1a0000` (濃赤) | `#ff0044` (紅) |

---

## 10. 音響設計（AudioEngine）

### 10.1 基本構造

```js
class AudioEngine {
  ctx: AudioContext   // Web Audio API コンテキスト
  masterGain: GainNode

  // SE 再生（ワンショット）
  playSound(preset: SoundPreset): void

  // BGM ループ（手続き生成）
  startBGM(stageId: number): void
  stopBGM(): void
}
```

### 10.2 SE 生成パターン

| SE | 波形 | 概要 |
|----|------|------|
| ショット音 | Sine | 800Hz → 400Hz、持続20ms、発振 |
| 敵撃破 | NoiseBuffer | ホワイトノイズ + BiquadFilter(bandpass)、100ms |
| ボス撃破 | Sawtooth + Noise | 低周波ビート＋フィードバック遅延、800ms |
| 能力発動 | 能力別 | B1:鋭い電子音 / B2:ピュー系 / B3:バリア展開音 ... |
| ボム | NoiseBuffer | 全帯域バースト、250ms、低音強め |
| レベルアップ | Sine | C4→E4→G4→C5 のアルペジオ、各80ms |
| 被弾 | Sine | 300Hz → 100Hz ダウンポルタメント、150ms |

### 10.3 BGM 手続き生成

各ステージのBGMは以下の要素を組み合わせてループ生成する:
- **ベースライン:** OscillatorNode (Sawtooth)、ステージ固有のルート音程
- **ハイハット:** AudioBufferSourceNode (ノイズ短時間)、8分音符
- **メロディ:** OscillatorNode (Square)、ステージペンタトニックスケール上をランダムウォーク
- **リバーブ:** ConvolverNode（IR をコード生成）または DelayNode + フィードバック

---

## 11. ウェーブ（敵配置）設計

各ステージは **ウェーブ配列** として定義する。

```js
// Stage1.js の例
export const STAGE_1 = {
  id: 1,
  scrollSpeed: 60,         // px/秒
  bossUnlockExp: 600,
  waves: [
    {
      triggerScrollY: 0,   // この Y スクロール量で発火
      enemies: [
        { type: 'SMALL', x: 120, y: -20, pattern: 'straight_down' },
        { type: 'SMALL', x: 360, y: -20, pattern: 'straight_down' },
      ]
    },
    {
      triggerScrollY: 800,
      enemies: [
        { type: 'MEDIUM', x: 240, y: -20, pattern: 'zigzag' },
      ]
    },
    // ... ボス出現
    {
      triggerScrollY: 5000,
      isBoss: true,
      bossType: 'Boss1',
    }
  ]
}
```

---

## 12. 画面・UI 設計

### 12.1 レイアウト（480×720 px）

**ゲーム画面レイヤー（下から順に描画）:**
```
1. ScrollBackground（星フィールド）
2. Enemy / Boss スプライト
3. EnemyBullet
4. Player スプライト
5. PlayerBullet
6. ParticleSystem
7. AbilityEffect（能力演出）
8. HUD（HP / ボム数 / スコア / 能力ゲージ）
9. PauseOverlay（ポーズ中のみ）
```

**HUD 配置:**
```
[HP ████████░░]  [★×3]          [SCORE: 000000]
                               [ABILITY ████░░]
```

### 12.2 ネオン描画ユーティリティ

```js
// Renderer.js に共通ヘルパーを定義
drawNeonRect(ctx, x, y, w, h, color, glowSize)
drawNeonCircle(ctx, x, y, r, color, glowSize)
drawNeonLine(ctx, x1, y1, x2, y2, color, lineWidth, glowSize)
drawNeonText(ctx, text, x, y, size, color, glowSize)

// 実装パターン（shadowBlur を2重にして強い発光を表現）
ctx.shadowColor = color
ctx.shadowBlur = glowSize * 2
// → 内側（白系）で高輝度ハイライト
// → 外側（カラー）でハロー
```

---

## 13. データフロー図

```
[InputManager] ──────────────────────────────────────────┐
                                                          ▼
[ExperienceSystem] ──── ComputedStats ────▶ [Player]  [GameScene.update()]
[AbilityManager]  ──── gauge/active  ────▶   │            │
                                              │         [EnemyManager.update()]
                                              │         [BulletPool.update()]
                                              │         [ParticleSystem.update()]
                                              │         [CollisionSystem.check()]
                                              │              │
                                              │         ダメージ/EXP獲得
                                              ▼              ▼
                                         [Player.hp]  [ExperienceSystem.addExp()]
                                              │
                                        HP<=0 ▼
                                         [StateMachine → RESULT]
```

---

## 14. パフォーマンス考慮点

| 項目 | 対策 |
|------|------|
| 弾のGC | BulletPool でオブジェクト再利用 |
| パーティクルのGC | ParticleSystem でオブジェクト再利用 |
| 衝突判定の計算量 | Y軸バンドフィルタで O(n²) を削減 |
| Canvas 再描画 | 毎フレーム全画面クリア（シンプルさ優先、必要なら dirty rect 最適化） |
| 音声コンテキスト | AudioContext は1つのみ生成し再利用（ユーザーインタラクション後に resume） |
| localStorage | ゲーム中は書き込まず、リザルト画面遷移時のみ save() を呼ぶ |
