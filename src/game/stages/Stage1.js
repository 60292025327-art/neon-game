/** Stage 1 — 入門ステージ（敵数増量版） */
export const STAGE_1 = {
  id: 0,
  name: 'STAGE 1',
  scrollSpeed: 65,
  bossExpBonus: 600,
  bossScoreBonus: 5000,
  waves: [
    { triggerScrollY: 100,
      enemies: [
        { type: 'SMALL', x:  80, y: -20, pattern: 'straight_down', speed: 100 },
        { type: 'SMALL', x: 160, y: -20, pattern: 'straight_down', speed: 100 },
        { type: 'SMALL', x: 240, y: -20, pattern: 'straight_down', speed: 100 },
        { type: 'SMALL', x: 320, y: -20, pattern: 'straight_down', speed: 100 },
        { type: 'SMALL', x: 400, y: -20, pattern: 'straight_down', speed: 100 },
      ]
    },
    { triggerScrollY: 350,
      enemies: [
        { type: 'SMALL', x:  60, y: -20, pattern: 'zigzag', speed: 110 },
        { type: 'SMALL', x: 180, y: -20, pattern: 'zigzag', speed: 110 },
        { type: 'SMALL', x: 300, y: -20, pattern: 'zigzag', speed: 110 },
        { type: 'SMALL', x: 420, y: -20, pattern: 'zigzag', speed: 110 },
      ]
    },
    { triggerScrollY: 620,
      enemies: [
        { type: 'MEDIUM', x: 120, y: -20, pattern: 'zigzag',       speed: 85 },
        { type: 'MEDIUM', x: 240, y: -20, pattern: 'straight_down', speed: 80 },
        { type: 'MEDIUM', x: 360, y: -20, pattern: 'zigzag',       speed: 85 },
      ]
    },
    { triggerScrollY: 900,
      enemies: [
        { type: 'SMALL', x:  80, y: -20, pattern: 'straight_down', speed: 120 },
        { type: 'SMALL', x: 160, y: -20, pattern: 'straight_down', speed: 120 },
        { type: 'SMALL', x: 240, y: -20, pattern: 'straight_down', speed: 120 },
        { type: 'SMALL', x: 320, y: -20, pattern: 'straight_down', speed: 120 },
        { type: 'SMALL', x: 400, y: -20, pattern: 'straight_down', speed: 120 },
        { type: 'SMALL', x: 480, y: -20, pattern: 'straight_down', speed: 120 },
      ]
    },
    { triggerScrollY: 1200,
      enemies: [
        { type: 'SMALL',  x: 100, y: -20, pattern: 'zigzag',       speed: 120, shoot: true },
        { type: 'MEDIUM', x: 240, y: -25, pattern: 'straight_down', speed: 80,  shoot: true },
        { type: 'SMALL',  x: 380, y: -20, pattern: 'zigzag',       speed: 120, shoot: true },
      ]
    },
    { triggerScrollY: 1500,
      enemies: [
        { type: 'SMALL', x:  60, y: -20, pattern: 'sine_wave', speed: 95 },
        { type: 'SMALL', x: 150, y: -30, pattern: 'sine_wave', speed: 95 },
        { type: 'SMALL', x: 240, y: -20, pattern: 'sine_wave', speed: 95 },
        { type: 'SMALL', x: 330, y: -30, pattern: 'sine_wave', speed: 95 },
        { type: 'SMALL', x: 420, y: -20, pattern: 'sine_wave', speed: 95 },
      ]
    },
    { triggerScrollY: 1800,
      enemies: [
        { type: 'LARGE', x: 160, y: -30, pattern: 'straight_down', speed: 60, shoot: true },
        { type: 'LARGE', x: 320, y: -30, pattern: 'straight_down', speed: 60, shoot: true },
      ]
    },
    { triggerScrollY: 2100,
      enemies: [
        { type: 'SMALL', x:  80, y: -20, pattern: 'curve_right', speed: 120 },
        { type: 'SMALL', x: 160, y: -20, pattern: 'curve_right', speed: 120 },
        { type: 'SMALL', x: 320, y: -20, pattern: 'curve_left',  speed: 120 },
        { type: 'SMALL', x: 400, y: -20, pattern: 'curve_left',  speed: 120 },
      ]
    },
    { triggerScrollY: 2400,
      enemies: [
        { type: 'MEDIUM', x:  80, y: -20, pattern: 'zigzag',       speed: 90, shoot: true },
        { type: 'MEDIUM', x: 200, y: -20, pattern: 'straight_down', speed: 80 },
        { type: 'MEDIUM', x: 280, y: -20, pattern: 'straight_down', speed: 80 },
        { type: 'MEDIUM', x: 400, y: -20, pattern: 'zigzag',       speed: 90, shoot: true },
      ]
    },
    { triggerScrollY: 2750,
      enemies: [
        { type: 'SMALL', x:  60, y: -20, pattern: 'dive_bomb', speed: 200 },
        { type: 'SMALL', x: 150, y: -20, pattern: 'dive_bomb', speed: 200 },
        { type: 'SMALL', x: 240, y: -20, pattern: 'dive_bomb', speed: 200 },
        { type: 'SMALL', x: 330, y: -20, pattern: 'dive_bomb', speed: 200 },
        { type: 'SMALL', x: 420, y: -20, pattern: 'dive_bomb', speed: 200 },
      ]
    },
    { triggerScrollY: 3100,
      enemies: [
        { type: 'MEDIUM', x: 120, y: -20, pattern: 'zigzag', speed: 95, shoot: true },
        { type: 'LARGE',  x: 240, y: -30, pattern: 'straight_down', speed: 55, shoot: true },
        { type: 'MEDIUM', x: 360, y: -20, pattern: 'zigzag', speed: 95, shoot: true },
      ]
    },
    { triggerScrollY: 3500,
      enemies: [
        { type: 'SMALL', x:  80, y: -20, pattern: 'sine_wave', speed: 100 },
        { type: 'SMALL', x: 160, y: -20, pattern: 'sine_wave', speed: 100 },
        { type: 'SMALL', x: 240, y: -20, pattern: 'straight_down', speed: 110, shoot: true },
        { type: 'SMALL', x: 320, y: -20, pattern: 'sine_wave', speed: 100 },
        { type: 'SMALL', x: 400, y: -20, pattern: 'sine_wave', speed: 100 },
      ]
    },
    { triggerScrollY: 4200, isBoss: true, bossType: 'Boss1' },
  ],
};
