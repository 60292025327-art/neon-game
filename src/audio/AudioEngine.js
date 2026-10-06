/**
 * AudioEngine — Web Audio API ラッパー
 * 外部ファイルなし、全て手続き生成で SE / BGM を再生する
 */

export class AudioEngine {
  constructor() {
    this._ctx = null;
    this._masterGain = null;
    this._bgmNodes = [];
    this._muted = false;
    this._volume = 0.5;
    this._bgmVolume = 0.3;
    this._bgmGain = null;
  }

  /** ユーザーインタラクション後に呼ぶ（ブラウザ制限対策） */
  resume() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      this._masterGain = this._ctx.createGain();
      this._masterGain.gain.value = this._volume;
      this._masterGain.connect(this._ctx.destination);

      this._bgmGain = this._ctx.createGain();
      this._bgmGain.gain.value = this._bgmVolume;
      this._bgmGain.connect(this._masterGain);
    }
    if (this._ctx.state === 'suspended') {
      this._ctx.resume();
    }
  }

  setMuted(muted) {
    this._muted = muted;
    if (this._masterGain) {
      this._masterGain.gain.value = muted ? 0 : this._volume;
    }
  }

  toggleMute() {
    this.setMuted(!this._muted);
  }

  // ──────────────────────────────────────────
  // SE 再生ヘルパー
  // ──────────────────────────────────────────

  _getCtx() {
    return this._ctx;
  }

  /**
   * オシレーターワンショット
   * @param {object} opts
   */
  playTone(opts = {}) {
    const ctx = this._getCtx();
    if (!ctx || this._muted) return;

    const {
      type      = 'sine',
      frequency = 440,
      freqEnd   = frequency,
      duration  = 0.1,
      gain      = 0.3,
      gainEnd   = 0.0,
      delay     = 0,
    } = opts;

    const osc  = ctx.createOscillator();
    const gn   = ctx.createGain();
    osc.connect(gn);
    gn.connect(this._masterGain);

    osc.type = type;
    const t = ctx.currentTime + delay;
    osc.frequency.setValueAtTime(frequency, t);
    osc.frequency.linearRampToValueAtTime(freqEnd, t + duration);

    gn.gain.setValueAtTime(gain, t);
    gn.gain.linearRampToValueAtTime(gainEnd, t + duration);

    osc.start(t);
    osc.stop(t + duration + 0.01);
  }

  /**
   * ノイズワンショット（爆発音など）
   */
  playNoise(opts = {}) {
    const ctx = this._getCtx();
    if (!ctx || this._muted) return;

    const {
      duration  = 0.15,
      gain      = 0.3,
      filterType = 'bandpass',
      filterFreq = 300,
      filterQ   = 1,
      delay     = 0,
    } = opts;

    const bufSize = Math.ceil(ctx.sampleRate * duration);
    const buffer  = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data    = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type            = filterType;
    filter.frequency.value = filterFreq;
    filter.Q.value         = filterQ;

    const gn = ctx.createGain();
    const t  = ctx.currentTime + delay;
    gn.gain.setValueAtTime(gain, t);
    gn.gain.exponentialRampToValueAtTime(0.001, t + duration);

    src.connect(filter);
    filter.connect(gn);
    gn.connect(this._masterGain);
    src.start(t);
  }

  // ──────────────────────────────────────────
  // SE プリセット
  // ──────────────────────────────────────────

  playShot() {
    this.playTone({ type: 'sine', frequency: 800, freqEnd: 400, duration: 0.02, gain: 0.2, gainEnd: 0 });
  }

  playEnemyDestroy() {
    this.playNoise({ duration: 0.1, gain: 0.25, filterFreq: 800, filterQ: 0.5 });
  }

  playBossDestroy() {
    this.playNoise({ duration: 0.5, gain: 0.5,  filterFreq: 200, filterQ: 0.8 });
    this.playTone({ type: 'sawtooth', frequency: 120, freqEnd: 40, duration: 0.8, gain: 0.3, gainEnd: 0, delay: 0.1 });
  }

  playBomb() {
    this.playNoise({ duration: 0.25, gain: 0.6, filterType: 'lowpass', filterFreq: 600 });
    this.playTone({ type: 'sine', frequency: 80, freqEnd: 30, duration: 0.3, gain: 0.4, gainEnd: 0 });
  }

  playLevelUp() {
    // C4 E4 G4 C5 のアルペジオ
    const notes = [261.6, 329.6, 392.0, 523.3];
    notes.forEach((freq, i) => {
      this.playTone({ type: 'sine', frequency: freq, freqEnd: freq, duration: 0.08, gain: 0.25, gainEnd: 0, delay: i * 0.08 });
    });
  }

  playHit() {
    this.playTone({ type: 'sine', frequency: 300, freqEnd: 100, duration: 0.15, gain: 0.3, gainEnd: 0 });
  }

  /** ボス能力発動 SE（bossId: 0〜5） */
  playAbility(bossId) {
    switch (bossId) {
      case 0: // 貫通レーザー
        this.playTone({ type: 'sawtooth', frequency: 1200, freqEnd: 600, duration: 0.3, gain: 0.35, gainEnd: 0 });
        break;
      case 1: // 追尾ミサイル
        this.playTone({ type: 'square', frequency: 400, freqEnd: 800, duration: 0.2, gain: 0.25, gainEnd: 0 });
        break;
      case 2: // バリア
        this.playTone({ type: 'sine', frequency: 600, freqEnd: 900, duration: 0.4, gain: 0.3, gainEnd: 0.1 });
        break;
      case 3: // タイムスロー
        this.playTone({ type: 'sine', frequency: 200, freqEnd: 100, duration: 0.5, gain: 0.3, gainEnd: 0 });
        break;
      case 4: // ギガチャージ
        this.playNoise({ duration: 0.15, gain: 0.2, filterFreq: 1200 });
        this.playTone({ type: 'sawtooth', frequency: 100, freqEnd: 400, duration: 1.5, gain: 0.3, gainEnd: 0.5, delay: 0.15 });
        break;
      case 5: // 画面爆発
        this.playNoise({ duration: 0.5, gain: 0.8, filterType: 'lowpass', filterFreq: 400 });
        this.playTone({ type: 'sine', frequency: 60, freqEnd: 20, duration: 0.8, gain: 0.5, gainEnd: 0 });
        break;
    }
  }

  // ──────────────────────────────────────────
  // BGM（手続き生成ループ）
  // ──────────────────────────────────────────

  stopBGM() {
    // タイマーをキャンセル
    if (this._bgmTimer) {
      clearTimeout(this._bgmTimer);
      this._bgmTimer = null;
    }
    for (const node of this._bgmNodes) {
      try { node.stop(0); } catch {}
    }
    this._bgmNodes = [];
  }

  startBGM(stageId) {
    this.stopBGM();
    const ctx = this._getCtx();
    if (!ctx || this._muted) return;

    // ステージごとのルート音程（Hz）
    const roots = [110, 123.5, 130.8, 98, 116.5, 103.8];
    const root  = roots[stageId] ?? 110;

    // ベースライン（2拍子、1小節 = 0.8秒）
    this._scheduleBGMLoop(ctx, root, stageId);
  }

  _scheduleBGMLoop(ctx, root, stageId) {
    const barLen  = 1.6;  // 1小節の秒数
    const startAt = ctx.currentTime + 0.05;

    // ──── ベース ────
    const bassOsc  = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.type = 'sawtooth';
    bassGain.gain.value = 0.08;
    bassOsc.connect(bassGain);
    bassGain.connect(this._bgmGain);

    const bassNotes = [root, root * 1.25, root, root * 0.75];
    bassNotes.forEach((freq, i) => {
      bassOsc.frequency.setValueAtTime(freq, startAt + i * (barLen / 4));
    });

    bassOsc.start(startAt);
    bassOsc.stop(startAt + barLen);
    this._bgmNodes.push(bassOsc);

    // ──── ハイハット ────
    for (let i = 0; i < 8; i++) {
      const t = startAt + i * (barLen / 8);
      const bufSize = Math.ceil(ctx.sampleRate * 0.05);
      const buf  = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let j = 0; j < bufSize; j++) data[j] = (Math.random() * 2 - 1);

      const src = ctx.createBufferSource();
      src.buffer = buf;
      const flt = ctx.createBiquadFilter();
      flt.type = 'highpass';
      flt.frequency.value = 8000;
      const gn = ctx.createGain();
      gn.gain.setValueAtTime(0.04, t);
      gn.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      src.connect(flt); flt.connect(gn); gn.connect(this._bgmGain);
      src.start(t);
      this._bgmNodes.push(src);
    }

    // ──── メロディ ────
    const scale = [0, 2, 4, 7, 9]; // ペンタトニック（半音数）
    let noteIdx = Math.floor(Math.random() * scale.length);
    const melOsc  = ctx.createOscillator();
    const melGain = ctx.createGain();
    melOsc.type = 'square';
    melGain.gain.value = 0.04;
    melOsc.connect(melGain);
    melGain.connect(this._bgmGain);

    for (let i = 0; i < 4; i++) {
      const t = startAt + i * (barLen / 4);
      const step = scale[noteIdx % scale.length];
      const freq = root * 2 * Math.pow(2, step / 12);
      melOsc.frequency.setValueAtTime(freq, t);
      // ランダムウォーク
      noteIdx += Math.floor(Math.random() * 3) - 1;
      if (noteIdx < 0) noteIdx = 0;
    }
    melOsc.start(startAt);
    melOsc.stop(startAt + barLen);
    this._bgmNodes.push(melOsc);

    // ループ予約（次の小節を事前スケジュール）
    const delay = (startAt + barLen - ctx.currentTime) * 1000 - 50;
    this._bgmTimer = setTimeout(() => {
      this._scheduleBGMLoop(ctx, root, stageId);
    }, Math.max(0, delay));
  }
}
