/** Stage 4 — 時空の迷宮（敵数増量版） */
export const STAGE_4 = {
  id: 3,
  name: 'STAGE 4',
  scrollSpeed: 84,
  bossExpBonus: 1200,
  bossScoreBonus: 16000,
  waves: [
    { triggerScrollY: 100,
      enemies: [
        { type: 'MEDIUM', x:  80, y: -20, pattern: 'dive_bomb', speed: 210, shoot: true },
        { type: 'MEDIUM', x: 180, y: -20, pattern: 'dive_bomb', speed: 210 },
        { type: 'MEDIUM', x: 300, y: -20, pattern: 'dive_bomb', speed: 210 },
        { type: 'MEDIUM', x: 400, y: -20, pattern: 'dive_bomb', speed: 210, shoot: true },
      ]
    },
    { triggerScrollY: 430,
      enemies: [
        { type: 'ELITE',  x:  80, y: -30, pattern: 'zigzag', speed: 105, shoot: true },
        { type: 'MEDIUM', x: 160, y: -20, pattern: 'sine_wave', speed: 110 },
        { type: 'LARGE',  x: 240, y: -30, pattern: 'straight_down', speed: 62, shoot: true },
        { type: 'MEDIUM', x: 320, y: -20, pattern: 'sine_wave', speed: 110 },
        { type: 'ELITE',  x: 400, y: -30, pattern: 'zigzag', speed: 105, shoot: true },
      ]
    },
    { triggerScrollY: 800,
      enemies: [
        { type: 'SMALL', x:  60, y: -20, pattern: 'dive_bomb', speed: 260 },
        { type: 'SMALL', x: 120, y: -20, pattern: 'dive_bomb', speed: 260 },
        { type: 'SMALL', x: 180, y: -20, pattern: 'dive_bomb', speed: 260 },
        { type: 'SMALL', x: 300, y: -20, pattern: 'dive_bomb', speed: 260 },
        { type: 'SMALL', x: 360, y: -20, pattern: 'dive_bomb', speed: 260 },
        { type: 'SMALL', x: 420, y: -20, pattern: 'dive_bomb', speed: 260 },
      ]
    },
    { triggerScrollY: 1150,
      enemies: [
        { type: 'ELITE',  x: 120, y: -30, pattern: 'sine_wave', speed: 112, shoot: true },
        { type: 'LARGE',  x: 240, y: -30, pattern: 'zigzag',    speed: 78,  shoot: true },
        { type: 'ELITE',  x: 360, y: -30, pattern: 'sine_wave', speed: 112, shoot: true },
      ]
    },
    { triggerScrollY: 1500,
      enemies: [
        { type: 'MEDIUM', x:  80, y: -20, pattern: 'zigzag', speed: 115, shoot: true },
        { type: 'MEDIUM', x: 160, y: -20, pattern: 'zigzag', speed: 115 },
        { type: 'MEDIUM', x: 240, y: -20, pattern: 'straight_down', speed: 95, shoot: true },
        { type: 'MEDIUM', x: 320, y: -20, pattern: 'zigzag', speed: 115 },
        { type: 'MEDIUM', x: 400, y: -20, pattern: 'zigzag', speed: 115, shoot: true },
      ]
    },
    { triggerScrollY: 1880,
      enemies: [
        { type: 'LARGE', x: 120, y: -30, pattern: 'sine_wave', speed: 80, shoot: true },
        { type: 'ELITE', x: 240, y: -30, pattern: 'dive_bomb', speed: 200, shoot: true },
        { type: 'LARGE', x: 360, y: -30, pattern: 'sine_wave', speed: 80, shoot: true },
      ]
    },
    { triggerScrollY: 2280,
      enemies: [
        { type: 'SMALL', x:  60, y: -20, pattern: 'dive_bomb', speed: 270, shoot: true },
        { type: 'SMALL', x: 140, y: -20, pattern: 'dive_bomb', speed: 270 },
        { type: 'SMALL', x: 220, y: -20, pattern: 'dive_bomb', speed: 270 },
        { type: 'SMALL', x: 300, y: -20, pattern: 'dive_bomb', speed: 270 },
        { type: 'SMALL', x: 380, y: -20, pattern: 'dive_bomb', speed: 270 },
        { type: 'SMALL', x: 450, y: -20, pattern: 'dive_bomb', speed: 270, shoot: true },
      ]
    },
    { triggerScrollY: 2680,
      enemies: [
        { type: 'ELITE',  x:  80, y: -30, pattern: 'sine_wave', speed: 115, shoot: true },
        { type: 'MEDIUM', x: 160, y: -20, pattern: 'zigzag',    speed: 130 },
        { type: 'LARGE',  x: 240, y: -30, pattern: 'straight_down', speed: 68, shoot: true },
        { type: 'MEDIUM', x: 320, y: -20, pattern: 'zigzag',    speed: 130 },
        { type: 'ELITE',  x: 400, y: -30, pattern: 'sine_wave', speed: 115, shoot: true },
      ]
    },
    { triggerScrollY: 3100,
      enemies: [
        { type: 'LARGE', x: 120, y: -30, pattern: 'curve_right', speed: 84, shoot: true },
        { type: 'ELITE', x: 240, y: -30, pattern: 'zigzag',      speed: 110, shoot: true },
        { type: 'LARGE', x: 360, y: -30, pattern: 'curve_left',  speed: 84, shoot: true },
      ]
    },
    { triggerScrollY: 3550,
      enemies: [
        { type: 'MEDIUM', x:  80, y: -20, pattern: 'dive_bomb', speed: 220, shoot: true },
        { type: 'MEDIUM', x: 160, y: -20, pattern: 'dive_bomb', speed: 220 },
        { type: 'MEDIUM', x: 240, y: -20, pattern: 'dive_bomb', speed: 220, shoot: true },
        { type: 'MEDIUM', x: 320, y: -20, pattern: 'dive_bomb', speed: 220 },
        { type: 'MEDIUM', x: 400, y: -20, pattern: 'dive_bomb', speed: 220, shoot: true },
      ]
    },
    { triggerScrollY: 4050,
      enemies: [
        { type: 'ELITE', x: 120, y: -30, pattern: 'sine_wave', speed: 120, shoot: true },
        { type: 'ELITE', x: 240, y: -30, pattern: 'dive_bomb', speed: 210, shoot: true },
        { type: 'ELITE', x: 360, y: -30, pattern: 'sine_wave', speed: 120, shoot: true },
      ]
    },
    { triggerScrollY: 5300, isBoss: true, bossType: 'Boss4' },
  ],
};
