/**
 * StateMachine — シーン登録・遷移・update/render の委譲
 *
 * Scene インターフェース:
 *   onEnter(params?)  遷移時初期化
 *   onExit()          遷移時クリーンアップ
 *   update(delta)     ロジック更新
 *   render(ctx)       描画
 *
 * overlay モード:
 *   transition('pause', {}, true) のように第3引数を true にすると
 *   「オーバーレイ」として積まれ、その下のシーンも render される。
 *   ovelray を閉じるには overlay: false のシーンへ遷移する。
 */
export class StateMachine {
  constructor() {
    this._scenes  = new Map();
    this._current = null;
    this._currentName = '';

    // オーバーレイ用スタック（GameScene → PauseScene の順で積む）
    this._overlayScene = null;
    this._overlayName  = '';
  }

  /** シーンを登録する */
  register(name, scene) {
    this._scenes.set(name, scene);
  }

  /**
   * シーンを切り替える
   * @param {string}  name     遷移先シーン名
   * @param {object}  [params] onEnter に渡す引数
   * @param {boolean} [overlay=false] true にするとオーバーレイとして重ねる
   */
  transition(name, params = {}, overlay = false) {
    if (!this._scenes.has(name)) {
      console.error(`[StateMachine] シーン未登録: ${name}`);
      return;
    }

    if (overlay) {
      // 既存のオーバーレイがあれば閉じる
      if (this._overlayScene) {
        this._overlayScene.onExit?.();
      }
      this._overlayName  = name;
      this._overlayScene = this._scenes.get(name);
      this._overlayScene.onEnter?.(params);
    } else {
      // オーバーレイを閉じる
      if (this._overlayScene) {
        this._overlayScene.onExit?.();
        this._overlayScene = null;
        this._overlayName  = '';
      }
      // 現在シーンを切り替え
      if (this._current) {
        this._current.onExit?.();
      }
      this._currentName = name;
      this._current     = this._scenes.get(name);
      this._current.onEnter?.(params);
    }
  }

  /** オーバーレイを閉じて元のシーンに戻る */
  closeOverlay() {
    if (this._overlayScene) {
      this._overlayScene.onExit?.();
      this._overlayScene = null;
      this._overlayName  = '';
    }
  }

  update(delta) {
    if (this._overlayScene) {
      // オーバーレイがある場合はオーバーレイだけ update
      this._overlayScene.update(delta);
    } else {
      this._current?.update(delta);
    }
  }

  render(ctx) {
    // ベースシーンを描画
    this._current?.render(ctx);
    // オーバーレイがあれば上に重ねる
    this._overlayScene?.render(ctx);
  }

  get currentName() {
    return this._overlayName || this._currentName;
  }
}
