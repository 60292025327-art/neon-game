# 実装タスクチェックリスト — 縦スクロールシューティング＋RPG成長要素ゲーム

> 各フェーズは前のフェーズが完了してから着手する。
> チェックボックスは実装完了時に `[x]` へ変更する。

---

## Phase 0 — プロジェクト基盤

### 0-1. ファイル構成・HTML 雛形
- [ ] `index.html` を作成し、`<canvas id="game">` (480×720) と `<script type="module" src="src/main.js">` を配置する
- [ ] `src/` 以下のディレクトリ構成（`core/` `scenes/` `game/` `abilities/` `rpg/` `audio/`）を作成する
- [ ] CSS で Canvas を画面中央に表示し、`image-rendering: pixelated` を設定する
- [ ] `devicePixelRatio` に対応した高 DPI スケーリング処理を実装する

### 0-2. コア基盤モジュール
- [ ] `src/core/GameLoop.js` — `requestAnimationFrame` ループ、delta 計算（50ms キャップ）、FPS カウンターを実装する
- [ ] `src/core/StateMachine.js` — シーン登録・遷移（`transition(name, params)`）、`update` / `render` の委譲を実装する
- [ ] `src/core/InputManager.js` — `pressedKeys` / `justPressed` / `justReleased` の管理と `ACTION_MAP` によるアクション判定を実装する
- [ ] `src/core/Renderer.js` — `drawNeonRect` / `drawNeonCircle` / `drawNeonLine` / `drawNeonText` ユーティリティを実装する
- [ ] `src/core/Storage.js` — `SaveData` の JSON シリアライズ・デシリアライズ、デフォルト値マージを実装する
- [ ] `src/main.js` — `GameLoop` / `StateMachine` / `InputManager` を初期化し、ループを開始する

### 0-3. 動作確認
- [ ] ブラウザで `index.html` を開き、黒い Canvas が表示されることを確認する
- [ ] コンソールエラーが出ないことを確認する

---

## Phase 1 — タイトル画面

### 1-1. TitleScene
- [ ] `src/scenes/TitleScene.js` を作成し、`Scene` インターフェース（`onEnter` / `onExit` / `update` / `render`）を実装する
- [ ] ゲームタイトルテキストをネオン調（`drawNeonText`）で中央に描画する
- [ ] 「PRESS SPACE TO START」点滅テキストを実装する（0.8s 周期）
- [ ] Space キー押下で `StageSelectScene` へ遷移する
- [ ] 背景に流れる星フィールド（`ScrollBackground` の軽量版）を描画する

---

## Phase 2 — RPG基盤（EXP・ステータス）

### 2-1. StatDefinitions
- [ ] `src/rpg/StatDefinitions.js` に `STAT_DEFINITIONS` 定数（7種のステータス定義: costPerLevel / maxLevel / compute 関数）を実装する

### 2-2. ExperienceSystem
- [ ] `src/rpg/ExperienceSystem.js` を作成する
- [ ] `totalExp` / `allocations` の管理と `availableExp` getter（消費 EXP を差し引いた残量）を実装する
- [ ] `allocate(statKey)` — 残 EXP が十分かつ未上限なら 1 レベル上昇、EXP 消費を実装する
- [ ] `deallocate(statKey)` — 1 レベル下げ、EXP 全額還元を実装する
- [ ] `resetAll()` — 全ステータスを 0 に、EXP 全額還元を実装する
- [ ] `getComputedStats()` — 現在の allocations から実ゲーム用数値オブジェクトを計算して返す
- [ ] `save()` / `load()` — `Storage` 経由で `SaveData` の EXP・allocations 部分を永続化する
- [ ] 単体動作確認: allocate → deallocate で EXP 残量が正しく増減することをコンソールで確認する

---

## Phase 3 — ステージ選択・強化画面

### 3-1. StageSelectScene
- [ ] `src/scenes/StageSelectScene.js` を作成し `Scene` インターフェースを実装する
- [ ] ステージ一覧（1〜6）をグリッド表示し、ロック済みは鍵アイコンでグレーアウト表示する
- [ ] `ExperienceSystem.getComputedStats()` を参照して現在の各ステータス値をパネルに表示する
- [ ] 「+」ボタンで `allocate`、「−」ボタンで `deallocate` を呼び出し、表示をリアルタイム更新する
- [ ] 「全リセット」ボタンで `resetAll()` を呼び出す
- [ ] 現在の残 EXP をリアルタイム表示する
- [ ] 獲得済みボス能力リストを表示し、クリックで装備能力を切り替えられるようにする
- [ ] 選択したステージの「PLAY」ボタン押下で `GameScene` へ `{ stageId }` を渡して遷移する
- [ ] 画面遷移時に `ExperienceSystem.save()` を呼び出す

---

## Phase 4 — コアゲームシステム基盤

### 4-1. BulletPool
- [ ] `src/game/BulletPool.js` を作成し、最大 512 発のプールを実装する
- [ ] `spawn(x, y, vx, vy, dmg, radius, color)` — 非アクティブ弾を探して再利用する
- [ ] `update(delta)` — 全アクティブ弾を移動させ、Canvas 外に出たら非アクティブ化する
- [ ] `render(ctx)` — アクティブ弾をネオン調で描画する

### 4-2. ParticleSystem
- [ ] `src/game/ParticleSystem.js` を作成し、最大 512 個のプールを実装する
- [ ] `emit(x, y, { count, speed, spread, colors, radius, lifetime })` を実装する
- [ ] `update(delta)` — 位置更新・寿命減算・アルファフェードを実装する
- [ ] `render(ctx)` — 各パーティクルをネオン調円で描画する

### 4-3. ScrollBackground
- [ ] `src/game/ScrollBackground.js` を作成し、3レイヤーの星フィールドを実装する
- [ ] `update(delta, scrollSpeed)` — 各レイヤーを視差速度で下方向にスクロールする
- [ ] `render(ctx, stageColor)` — ステージカラーに対応したネオン輝点を描画する
- [ ] 画面外に出た星を上端に再配置するラップ処理を実装する

### 4-4. CollisionSystem
- [ ] `src/game/CollisionSystem.js` を作成し、円同士の衝突判定 `isColliding(a, b)` を実装する
- [ ] `checkAll(player, playerBullets, enemies, enemyBullets)` — 4種類の判定を一括実行する
- [ ] Y 軸バンドフィルタによる判定最適化を実装する

### 4-5. Player
- [ ] `src/game/Player.js` を作成する
- [ ] 移動処理（8方向、`ComputedStats.moveSpeed` 依存）を実装する
- [ ] Canvas 端の移動制限を実装する
- [ ] `shoot()` — `shotRate` に基づくクールダウン管理と `BulletPool.spawn()` 呼び出しを実装する
- [ ] `takeDamage(dmg)` — HP 減算、無敵時間設定、被弾エフェクト（`ParticleSystem.emit`）を実装する
- [ ] `activateBomb()` — ボム残数確認・消費、全画面パーティクル、全敵弾削除を実装する
- [ ] ネオン調の自機グラフィック（三角形ベース + 発光）を実装する
- [ ] 被弾無敵中の点滅表示を実装する

### 4-6. Enemy / EnemyManager
- [ ] `src/game/Enemy.js` に基底クラスを実装する（HP / 半径 / EXP / スコア / 移動パターン関数 / 描画）
- [ ] 移動パターン関数を実装する: `straight_down` / `zigzag` / `sine_wave` / `homing`
- [ ] `src/game/EnemyManager.js` を作成する
- [ ] ウェーブ配列を受け取り、`scrollY` トリガーで敵を生成する `spawnWave()` を実装する
- [ ] 全敵の `update` / `render` / 削除管理を実装する

### 4-7. Boss 基底クラス
- [ ] `src/game/Boss.js` に基底クラスを実装する
- [ ] 体力バーをネオン調で描画する（画面上部）
- [ ] 3フェーズ（HP 100%→60%→30%）の切り替えと演出（フラッシュ・画面振動）を実装する
- [ ] フェーズごとの行動パターン変更フックを実装する

---

## Phase 5 — ゲームシーン統合

### 5-1. GameScene
- [ ] `src/scenes/GameScene.js` を作成し `Scene` インターフェースを実装する
- [ ] `onEnter({ stageId })` — ステージデータ読み込み、全エンティティ初期化を実装する
- [ ] `update(delta)` — 以下の順序で呼び出す:
  - `InputManager` → Player 操作
  - `ScrollBackground.update`
  - `Player.update`
  - `EnemyManager.update`
  - `BulletPool.update`（自機弾・敵弾）
  - `CollisionSystem.checkAll`
  - `ParticleSystem.update`
  - `AbilityManager.update`
  - スコア・EXP 加算処理
  - ゲームオーバー / ボス撃破 判定
- [ ] `render(ctx)` — design.md §12.1 の描画レイヤー順で全要素を描画する
- [ ] HUD（HP ゲージ / ボム残数 / スコア / 能力ゲージ）を描画する
- [ ] ゲームオーバー条件（`player.hp <= 0`）で `ResultScene` へ遷移する
- [ ] ボス撃破でボス能力獲得 → `ResultScene` へ遷移する
- [ ] Escape キーで `PauseScene` へ遷移する

### 5-2. PauseScene
- [ ] `src/scenes/PauseScene.js` を作成する（オーバーレイ表示）
- [ ] 半透明黒背景の上に「PAUSED」テキストを表示する
- [ ] 「再開」「ステージ選択へ」の選択肢を実装する
- [ ] Escape キーで即時再開する

### 5-3. ResultScene
- [ ] `src/scenes/ResultScene.js` を作成する
- [ ] クリア/ゲームオーバーの区別表示を実装する
- [ ] スコア・獲得 EXP・最高スコア更新表示を実装する
- [ ] `ExperienceSystem.addExp()` と `Storage.save()` を呼び出す
- [ ] 「ステージ選択へ」ボタンで `StageSelectScene` へ遷移する

---

## Phase 6 — ボス能力システム

### 6-1. AbilityManager
- [ ] `src/abilities/AbilityManager.js` を作成する
- [ ] `gauge`（0〜100）の自動回復（`stats.abilityRegen` 依存）を実装する
- [ ] `activate(abilityId, gameState, stats)` — ゲージ確認・消費・能力発動を実装する
- [ ] `update(delta, gameState, stats)` — 発動中の `onUpdate` 呼び出しと残り時間管理を実装する
- [ ] `render(ctx)` — 発動中の `renderEffect` 呼び出しを実装する
- [ ] ゲージ UI（HUD内）描画メソッドを実装する

### 6-2. 各ボス能力の実装

- [ ] `LaserAbility.js` — 貫通レーザー（垂直細矩形、全敵に連続ダメージ、電子音SE）
- [ ] `MissileAbility.js` — 追尾ミサイル（3発エンティティ、毎フレーム角度補正、ピュー音SE）
- [ ] `BarrierAbility.js` — 全方位バリア（Player に `barrier` フラグ、接触敵ダメージ、バリア展開音SE）
- [ ] `TimeSlowAbility.js` — タイムスロー（EnemyManager / BulletPool の delta に 0.5 係数、時計音SE）
- [ ] `GigaChargeAbility.js` — ギガチャージ（チャージ1.5s固定 → 360°弾幕、チャージ＆発射SE）
- [ ] `MegaBlastAbility.js` — 画面爆発（全敵HP=0・全弾削除・フラッシュ、爆発SE）

---

## Phase 7 — ステージデータ実装

### 7-1. ステージ固有データ
- [ ] `src/game/stages/Stage1.js` — ウェーブ定義（直進雑魚×多数、ボス: Boss1/貫通レーザー）
- [ ] `src/game/stages/Stage2.js` — ウェーブ定義（ジグザグ敵、ボス: Boss2/追尾ミサイル）
- [ ] `src/game/stages/Stage3.js` — ウェーブ定義（サイン波編隊、ボス: Boss3/全方位バリア）
- [ ] `src/game/stages/Stage4.js` — ウェーブ定義（ホーミング敵、ボス: Boss4/タイムスロー）
- [ ] `src/game/stages/Stage5.js` — ウェーブ定義（混成編隊、ボス: Boss5/ギガチャージ）
- [ ] `src/game/stages/Stage6.js` — ウェーブ定義（全種登場、ボス: Boss6/画面爆発）

### 7-2. 各ステージのボス実装
- [ ] `Boss1.js` — 貫通レーザーを定期発射、フェーズ2以降はレーザー2本同時化
- [ ] `Boss2.js` — 追尾ミサイル発射、フェーズ2以降は散弾追加
- [ ] `Boss3.js` — バリア展開後に突進攻撃、フェーズ2以降は突進速度アップ
- [ ] `Boss4.js` — タイムスロー後に高速弾幕、フェーズ2以降はスロー範囲拡大
- [ ] `Boss5.js` — チャージ後に全方向弾幕、フェーズ2以降は弾数増加
- [ ] `Boss6.js` — 定期的な全画面爆発予告後攻撃、フェーズ2以降は頻度アップ

---

## Phase 8 — 音響システム

### 8-1. AudioEngine
- [ ] `src/audio/AudioEngine.js` を作成する
- [ ] `AudioContext` の生成（ユーザーインタラクション後に `resume()`）を実装する
- [ ] `masterGain` の設定とミュート切り替えを実装する
- [ ] `playSound(preset)` — ワンショット SE 再生を実装する
- [ ] `startBGM(stageId)` / `stopBGM()` — 手続き生成ループBGMを実装する

### 8-2. SoundEffects
- [ ] `src/audio/SoundEffects.js` に各 SE プリセットを実装する:
  - [ ] `SHOT` — Sine 800→400Hz、20ms
  - [ ] `ENEMY_DESTROY` — ノイズ + BandpassFilter、100ms
  - [ ] `BOSS_DESTROY` — Sawtooth + ノイズ + Delay フィードバック、800ms
  - [ ] `BOMB` — 全帯域ノイズバースト、250ms
  - [ ] `LEVEL_UP` — C4→E4→G4→C5 アルペジオ、各 80ms
  - [ ] `HIT` — Sine 300→100Hz ダウンポルタメント、150ms
  - [ ] 各ボス能力発動音 × 6 種

### 8-3. 手続き生成 BGM
- [ ] 6ステージ分のベースライン + ハイハット + メロディ生成を実装する
- [ ] ループ再生（`AudioBufferSourceNode.loop = true` またはスケジューリング）を実装する

---

## Phase 9 — 永続化・ステージ解放

### 9-1. SaveData 完全統合
- [ ] `Storage.js` の `SaveData` 全フィールド（解放状況・EXP・allocations・装備・スコア・能力取得）の save/load を実装する
- [ ] ボス撃破時に `acquiredAbilities[bossId] = true` / `unlockedStages[stageId] = true` を更新して保存する
- [ ] ページロード時に `ExperienceSystem.load()` を呼び出し、前回状態を復元する
- [ ] ハイスコア更新判定と保存を `ResultScene` で実装する

---

## Phase 10 — エフェクト・演出仕上げ

### 10-1. 画面振動
- [ ] `Renderer.js` に `shake(intensity, duration)` を実装する（Canvas の translate オフセット）
- [ ] 被弾時・ボス撃破時・ボム発動時に呼び出す

### 10-2. ボス撃破演出
- [ ] 大爆発パーティクル（64 個以上）を実装する
- [ ] 複数回のフラッシュ（白フェード）演出を実装する
- [ ] ボス能力獲得テキスト（「〇〇 GET!」）のポップアップを実装する

### 10-3. EXP 獲得演出
- [ ] 敵撃破位置に「+EXP」フロートテキスト（上昇しながらフェードアウト）を実装する

### 10-4. ボス能力発動演出
- [ ] 各能力の `renderEffect` に専用の発光・歪み・フラッシュ演出を実装する

---

## Phase 11 — 統合テスト・調整

### 11-1. 全画面フロー確認
- [ ] タイトル → ステージ選択 → ステージ1プレイ → リザルト → ステージ選択 の一連フローを通しプレイで確認する
- [ ] ステージ1ボス撃破後にステージ2がアンロックされることを確認する
- [ ] ページリロード後に EXP・解放状況・スコアが復元されることを確認する

### 11-2. EXP・振り直しシステム確認
- [ ] EXP 振り分け → ゲームプレイ → ステータスが反映されていることを確認する
- [ ] 振り分けを下げると EXP が還元され、他ステータスへ即再分配できることを確認する
- [ ] 一括リセットで全 EXP が返還されることを確認する

### 11-3. ボス能力確認
- [ ] 全6種の能力を装備して発動し、エフェクトと SE が再生されることを確認する
- [ ] ゲージ消費と回復が正常に動作することを確認する

### 11-4. パフォーマンス確認
- [ ] Chrome DevTools で 60 FPS が維持されていることを確認する（ボス戦中含む）
- [ ] メモリリークがないことを10分間プレイで確認する

### 11-5. ゲームバランス調整
- [ ] 全6ステージを通しプレイし、難易度曲線が適切かを確認する
- [ ] 各ステータスのコスト・効果量を調整する
- [ ] ボスの HP・攻撃パターン・フェーズ切り替えタイミングを調整する

---

## 実装優先度まとめ

| 優先度 | フェーズ | 内容 | 目安作業時間 |
|--------|----------|------|------------|
| P1（必須） | 0〜5 | 基盤・タイトル・EXP・ゲームコア | 〜40h |
| P2（必須） | 6〜7 | ボス能力・全ステージデータ | 〜20h |
| P3（必須） | 8〜9 | 音響・永続化 | 〜10h |
| P4（品質） | 10〜11 | 演出仕上げ・バランス調整 | 〜10h |

**合計目安: 約 80 時間**
