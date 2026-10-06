/** Stage 5 — 黄金の嵐（敵数増量版） */
export const STAGE_5 = {
  id: 4,
  name: 'STAGE 5',
  scrollSpeed: 92,
  bossExpBonus: 1400,
  bossScoreBonus: 22000,
  waves: [
    { triggerScrollY: 100,
      enemies: [
        { type: 'ELITE',  x:  80, y: -30, pattern: 'zigzag',   speed: 115, shoot: true },
        { type: 'MEDIUM', x: 160, y: -20, pattern: 'dive_bomb', speed: 215 },
        { type: 'MEDIUM', x: 240, y: -20, pattern: 'sine_wave', speed: 110 },
        { type: 'MEDIUM', x: 320, y: -20, pattern: 'dive_bomb', speed: 215 },
        { type: 'ELITE',  x: 400, y: -30, pattern: 'zigzag',   speed: 115, shoot: true },
      ]
    },
    { triggerScrollY: 450,
      enemies: [
        { type: 'LARGE',  x: 100, y: -30, pattern: 'sine_wave', speed: 85, shoot: true },
        { type: 'LARGE',  x: 240, y: -30, pattern: 'zigzag',    speed: 82, shoot: true },
        { type: 'LARGE',  x: 380, y: -30, pattern: 'sine_wave', speed: 85, shoot: true },
      ]
    },
    { triggerScrollY: 820,
      enemies: [
        { type: 'SMALL', x:  60, y: -20, pattern: 'dive_bomb', speed: 290, shoot: true },
        { type: 'SMALL', x: 130, y: -20, pattern: 'dive_bomb', speed: 290 },
        { type: 'SMALL', x: 200, y: -20, pattern: 'dive_bomb', speed: 290 },
        { type: 'SMALL', x: 280, y: -20, pattern: 'dive_bomb', speed: 290 },
        { type: 'SMALL', x: 350, y: -20, pattern: 'dive_bomb', speed: 290 },
        { type: 'SMALL', x: 420, y: -20, pattern: 'dive_bomb', speed: 290, shoot: true },
      ]
    },
    { triggerScrollY: 1200,
      enemies: [
        { type: 'ELITE',  x:  80, y: -30, pattern: 'sine_wave', speed: 120, shoot: true },
        { type: 'LARGE',  x: 160, y: -30, pattern: 'zigzag',    speed: 88,  shoot: true },
        { type: 'ELITE',  x: 240, y: -30, pattern: 'dive_bomb', speed: 210, shoot: true },
        { type: 'LARGE',  x: 320, y: -30, pattern: 'zigzag',    speed: 88,  shoot: true },
        { type: 'ELITE',  x: 400, y: -30, pattern: 'sine_wave', speed: 120, shoot: true },
      ]
    },
    { triggerScrollY: 1620,
      enemies: [
        { type: 'MEDIUM', x:  80, y: -20, pattern: 'zigzag', speed: 125, shoot: true },
        { type: 'MEDIUM', x: 160, y: -20, pattern: 'zigzag', speed: 125 },
        { type: 'MEDIUM', x: 240, y: -20, pattern: 'dive_bomb', speed: 230, shoot: true },
        { type: 'MEDIUM', x: 320, y: -20, pattern: 'zigzag', speed: 125 },
        { type: 'MEDIUM', x: 400, y: -20, pattern: 'zigzag', speed: 125, shoot: true },
      ]
    },
    { triggerScrollY: 2050,
      enemies: [
        { type: 'ELITE', x: 120, y: -30, pattern: 'sine_wave', speed: 125, shoot: true },
        { type: 'ELITE', x: 240, y: -30, pattern: 'zigzag',    speed: 110, shoot: true },
        { type: 'ELITE', x: 360, y: -30, pattern: 'sine_wave', speed: 125, shoot: true },
      ]
    },
    { triggerScrollY: 2480,
      enemies: [
        { type: 'SMALL', x:  60, y: -20, pattern: 'dive_bomb', speed: 300, shoot: true },
        { type: 'SMALL', x: 130, y: -20, pattern: 'dive_bomb', speed: 300 },
        { type: 'SMALL', x: 200, y: -20, pattern: 'dive_bomb', speed: 300 },
        { type: 'SMALL', x: 280, y: -20, pattern: 'dive_bomb', speed: 300 },
        { type: 'SMALL', x: 350, y: -20, pattern: 'dive_bomb', speed: 300 },
        { type: 'SMALL', x: 420, y: -20, pattern: 'dive_bomb', speed: 300, shoot: true },
      ]
    },
    { triggerScrollY: 2900,
      enemies: [
        { type: 'LARGE',  x: 100, y: -30, pattern: 'sine_wave', speed: 92,  shoot: true },
        { type: 'ELITE',  x: 200, y: -30, pattern: 'zigzag',    speed: 115, shoot: true },
        { type: 'LARGE',  x: 300, y: -30, pattern: 'dive_bomb', speed: 135, shoot: true },
        { type: 'ELITE',  x: 400, y: -30, pattern: 'zigzag',    speed: 115, shoot: true },
      ]
    },
    { triggerScrollY: 3380,
      enemies: [
        { type: 'MEDIUM', x:  80, y: -20, pattern: 'dive_bomb', speed: 240, shoot: true },
        { type: 'MEDIUM', x: 160, y: -20, pattern: 'dive_bomb', speed: 240 },
        { type: 'ELITE',  x: 240, y: -30, pattern: 'sine_wave', speed: 130, shoot: true },
        { type: 'MEDIUM', x: 320, y: -20, pattern: 'dive_bomb', speed: 240 },
        { type: 'MEDIUM', x: 400, y: -20, pattern: 'dive_bomb', speed: 240, shoot: true },
      ]
    },
    { triggerScrollY: 3880,
      enemies: [
        { type: 'ELITE', x:  80, y: -30, pattern: 'sine_wave', speed: 130, shoot: true },
        { type: 'LARGE', x: 160, y: -30, pattern: 'zigzag',    speed: 92,  shoot: true },
        { type: 'ELITE', x: 240, y: -30, pattern: 'dive_bomb', speed: 220, shoot: true },
        { type: 'LARGE', x: 320, y: -30, pattern: 'zigzag',    speed: 92,  shoot: true },
        { type: 'ELITE', x: 400, y: -30, pattern: 'sine_wave', speed: 130, shoot: true },
      ]
    },
    { triggerScrollY: 4500,
      enemies: [
        { type: 'SMALL', x:  60, y: -20, pattern: 'dive_bomb', speed: 320, shoot: true },
        { type: 'SMALL', x: 140, y: -20, pattern: 'dive_bomb', speed: 320 },
        { type: 'SMALL', x: 220, y: -20, pattern: 'dive_bomb', speed: 320 },
        { type: 'SMALL', x: 300, y: -20, pattern: 'dive_bomb', speed: 320 },
        { type: 'SMALL', x: 380, y: -20, pattern: 'dive_bomb', speed: 320 },
        { type: 'SMALL', x: 450, y: -20, pattern: 'dive_bomb', speed: 320, shoot: true },
      ]
    },
    { triggerScrollY: 6100, isBoss: true, bossType: 'Boss5' },
  ],
};
