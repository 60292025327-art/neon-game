/**
 * InputManager — キーボード入力の一元管理
 *
 * 使い方:
 *   input.isDown('SHOOT')      // 長押し判定
 *   input.isJustPressed('BOMB') // このフレームだけ true
 *   input.flush()              // フレーム末尾に呼ぶ
 */

const ACTION_MAP = {
  MOVE_UP:    ['ArrowUp',    'KeyW'],
  MOVE_DOWN:  ['ArrowDown',  'KeyS'],
  MOVE_LEFT:  ['ArrowLeft',  'KeyA'],
  MOVE_RIGHT: ['ArrowRight', 'KeyD'],
  SHOOT:      ['Space'],
  ABILITY:    ['KeyZ', 'KeyJ'],
  BOMB:       ['ShiftLeft', 'ShiftRight'],
  PAUSE:      ['Escape'],
  CONFIRM:    ['Space', 'Enter', 'KeyZ'],
  BACK:       ['KeyX'],   // ステージ選択へ戻る
};

export class InputManager {
  constructor() {
    /** @type {Set<string>} 現在押されているキーコード */
    this._pressed = new Set();
    /** @type {Set<string>} このフレームで押されたキーコード */
    this._justPressed = new Set();
    /** @type {Set<string>} このフレームで離されたキーコード */
    this._justReleased = new Set();

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup',   this._onKeyUp);
  }

  _onKeyDown(e) {
    // ゲーム操作キーのデフォルト動作を抑制（スクロール等）
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) {
      e.preventDefault();
    }
    if (!this._pressed.has(e.code)) {
      this._justPressed.add(e.code);
    }
    this._pressed.add(e.code);
  }

  _onKeyUp(e) {
    this._pressed.delete(e.code);
    this._justReleased.add(e.code);
  }

  /** 押し続けている間 true */
  isDown(action) {
    const keys = ACTION_MAP[action];
    if (!keys) return false;
    return keys.some(k => this._pressed.has(k));
  }

  /** このフレームで押した瞬間だけ true */
  isJustPressed(action) {
    const keys = ACTION_MAP[action];
    if (!keys) return false;
    return keys.some(k => this._justPressed.has(k));
  }

  /** このフレームで離した瞬間だけ true */
  isJustReleased(action) {
    const keys = ACTION_MAP[action];
    if (!keys) return false;
    return keys.some(k => this._justReleased.has(k));
  }

  /** フレーム末尾に呼ぶ（justPressed / justReleased をリセット） */
  flush() {
    this._justPressed.clear();
    this._justReleased.clear();
  }

  destroy() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup',   this._onKeyUp);
  }
}
