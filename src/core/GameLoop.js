/**
 * GameLoop — requestAnimationFrame ベースのゲームループ管理
 * delta は秒単位で統一（例: 1/60 ≒ 0.01667s）
 */
export class GameLoop {
  constructor({ update, render }) {
    this._update = update;
    this._render = render;
    this._rafId = null;
    this._lastTime = 0;
    this._running = false;

    // FPS 計測用
    this._fpsFrames = 0;
    this._fpsTimer = 0;
    this.fps = 0;

    this._tick = this._tick.bind(this);
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._lastTime = performance.now();
    this._rafId = requestAnimationFrame(this._tick);
  }

  stop() {
    this._running = false;
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  _tick(timestamp) {
    if (!this._running) return;

    // delta 計算（最大 50ms でキャップ、スパイク防止）
    let delta = (timestamp - this._lastTime) / 1000;
    if (delta > 0.05) delta = 0.05;
    this._lastTime = timestamp;

    // FPS カウンター更新
    this._fpsFrames++;
    this._fpsTimer += delta;
    if (this._fpsTimer >= 1.0) {
      this.fps = this._fpsFrames;
      this._fpsFrames = 0;
      this._fpsTimer -= 1.0;
    }

    this._update(delta);
    this._render();

    this._rafId = requestAnimationFrame(this._tick);
  }
}
