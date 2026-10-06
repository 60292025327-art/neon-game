/**
 * main.js — エントリーポイント
 * 全モジュールを初期化し、ゲームループを開始する
 */

import { GameLoop }        from './core/GameLoop.js';
import { StateMachine }    from './core/StateMachine.js';
import { InputManager }    from './core/InputManager.js';
import { Renderer }        from './core/Renderer.js';
import { ExperienceSystem } from './rpg/ExperienceSystem.js';
import { AudioEngine }     from './audio/AudioEngine.js';

import { TitleScene }       from './scenes/TitleScene.js';
import { StageSelectScene } from './scenes/StageSelectScene.js';
import { GameScene }        from './scenes/GameScene.js';
import { PauseScene }       from './scenes/PauseScene.js';
import { ResultScene }      from './scenes/ResultScene.js';

// ──────────────────────────────────────────
// 初期化
// ──────────────────────────────────────────

const renderer  = new Renderer('game');
const input     = new InputManager();
const sm        = new StateMachine();
const expSystem = new ExperienceSystem();
const audio     = new AudioEngine();

// セーブデータをロード
expSystem.load();

// ──────────────────────────────────────────
// シーン登録
// ──────────────────────────────────────────

const titleScene  = new TitleScene(renderer, input, sm, audio);
const selectScene = new StageSelectScene(renderer, input, sm, expSystem, audio);
const gameScene   = new GameScene(renderer, input, sm, expSystem, audio);
const pauseScene  = new PauseScene(renderer, input, sm);
const resultScene = new ResultScene(renderer, input, sm, expSystem, audio);

sm.register('title',       titleScene);
sm.register('stageSelect', selectScene);
sm.register('game',        gameScene);
sm.register('pause',       pauseScene);
sm.register('result',      resultScene);

// ──────────────────────────────────────────
// ゲームループ
// ──────────────────────────────────────────

let _lastDelta = 1 / 60;

const loop = new GameLoop({
  update: (delta) => {
    _lastDelta = delta;
    sm.update(delta);
    input.flush();  // フレーム末尾で justPressed をリセット
  },
  render: () => {
    renderer.beginFrame(_lastDelta);
    sm.render(renderer.ctx);
    renderer.endFrame();
  },
});

// ──────────────────────────────────────────
// 起動
// ──────────────────────────────────────────

// ロード表示を消す
const loadingEl = document.getElementById('loading');
if (loadingEl) loadingEl.style.display = 'none';

// 最初のシーンに遷移してループ開始
sm.transition('title');
loop.start();

// デバッグ: コンソールで操作できるようにグローバルに公開
if (typeof window !== 'undefined') {
  window._game = { loop, sm, expSystem, audio, input, renderer };
}
