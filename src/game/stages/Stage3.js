/** Stage 3 — 紫電の要塞（敵数増量版） */
export const STAGE_3 = {
  id: 2,
  name: 'STAGE 3',
  scrollSpeed: 78,
  bossExpBonus: 1000,
  bossScoreBonus: 12000,
  waves: [
    { triggerScrollY: 100,
      enemies: [
        { type: 'MEDIUM', x:  80, y: -20, pattern: 'sine_wave', speed: 105, shoot: true },
        { type: 'MEDIUM', x: 200, y: -20, pattern: 'sine_wave', speed: 105 },
        { type: 'MEDIUM', x: 320, y: -20, pattern: 'sine_wave', speed: 105 },
        { type: 'MEDIUM', x: 420, y: -20, pattern: 'sine_wave', speed: 105, shoot: true },
      ]
    },
    { triggerScrollY: 420,
      enemies: [
        { type: 'SMALL', x:  60, y: -20, pattern: 'zigzag', speed: 145 },
        { type: 'SMALL', x: 130, y: -20, pattern: 'zigzag', speed: 145 },
        { type: 'SMALL', x: 200, y: -20, pattern: 'zigzag', speed: 145 },
        { type: 'SMALL', x: 280, y: -20, pattern: 'zigzag', speed: 145 },
        { type: 'SMALL', x: 350, y: -20, pattern: 'zigzag', speed: 145 },
        { type: 'SMALL', x: 420, y: -20, pattern: 'zigzag', speed: 145 },
      ]
    },
    { triggerScrollY: 750,
      enemies: [
        { type: 'LARGE',  x: 120, y: -30, pattern: 'straight_down', speed: 55, shoot: true },
        { type: 'MEDIUM', x: 240, y: -20, pattern: 'zigzag',        speed: 100 },
        { type: 'LARGE',  x: 360, y: -30, pattern: 'straight_down', speed: 55, shoot: true },
      ]
    },
    { triggerScrollY: 1080,
      enemies: [
        { type: 'ELITE', x: 120, y: -30, pattern: 'sine_wave', speed: 92, shoot: true },
        { type: 'ELITE', x: 360, y: -30, pattern: 'sine_wave', speed: 92, shoot: true },
      ]
    },
    { triggerScrollY: 1400,
      enemies: [
        { type: 'SMALL', x:  80, y: -20, pattern: 'dive_bomb', speed: 210, shoot: true },
        { type: 'SMALL', x: 150, y: -20, pattern: 'dive_bomb', speed: 210 },
        { type: 'SMALL', x: 220, y: -20, pattern: 'dive_bomb', speed: 210 },
        { type: 'SMALL', x: 310, y: -20, pattern: 'dive_bomb', speed: 210 },
        { type: 'SMALL', x: 380, y: -20, pattern: 'dive_bomb', speed: 210 },
        { type: 'SMALL', x: 450, y: -20, pattern: 'dive_bomb', speed: 210, shoot: true },
      ]
    },
    { triggerScrollY: 1750,
      enemies: [
        { type: 'MEDIUM', x:  80, y: -20, pattern: 'zigzag', speed: 110, shoot: true },
        { type: 'MEDIUM', x: 160, y: -20, pattern: 'zigzag', speed: 110 },
        { type: 'LARGE',  x: 240, y: -30, pattern: 'straight_down', speed: 60, shoot: true },
        { type: 'MEDIUM', x: 320, y: -20, pattern: 'zigzag', speed: 110 },
        { type: 'MEDIUM', x: 400, y: -20, pattern: 'zigzag', speed: 110, shoot: true },
      ]
    },
    { triggerScrollY: 2100,
      enemies: [
        { type: 'ELITE', x: 160, y: -30, pattern: 'zigzag',    speed: 95, shoot: true },
        { type: 'ELITE', x: 320, y: -30, pattern: 'zigzag',    speed: 95, shoot: true },
      ]
    },
    { triggerScrollY: 2480,
      enemies: [
        { type: 'SMALL', x:  60, y: -20, pattern: 'sine_wave', speed: 115 },
        { type: 'SMALL', x: 140, y: -20, pattern: 'sine_wave', speed: 115 },
        { type: 'SMALL', x: 220, y: -20, pattern: 'dive_bomb', speed: 220, shoot: true },
        { type: 'SMALL', x: 300, y: -20, pattern: 'sine_wave', speed: 115 },
        { type: 'SMALL', x: 380, y: -20, pattern: 'sine_wave', speed: 115 },
      ]
    },
    { triggerScrollY: 2850,
      enemies: [
        { type: 'LARGE',  x: 100, y: -30, pattern: 'zigzag', speed: 82, shoot: true },
        { type: 'MEDIUM', x: 200, y: -20, pattern: 'dive_bomb', speed: 200 },
        { type: 'MEDIUM', x: 280, y: -20, pattern: 'dive_bomb', speed: 200 },
        { type: 'LARGE',  x: 380, y: -30, pattern: 'zigzag', speed: 82, shoot: true },
      ]
    },
    { triggerScrollY: 3250,
      enemies: [
        { type: 'ELITE', x: 100, y: -30, pattern: 'sine_wave', speed: 100, shoot: true },
        { type: 'LARGE', x: 240, y: -30, pattern: 'straight_down', speed: 58, shoot: true },
        { type: 'ELITE', x: 380, y: -30, pattern: 'sine_wave', speed: 100, shoot: true },
      ]
    },
    { triggerScrollY: 3700,
      enemies: [
        { type: 'SMALL', x:  80, y: -20, pattern: 'dive_bomb', speed: 240, shoot: true },
        { type: 'SMALL', x: 160, y: -20, pattern: 'dive_bomb', speed: 240 },
        { type: 'SMALL', x: 240, y: -20, pattern: 'dive_bomb', speed: 240 },
        { type: 'SMALL', x: 320, y: -20, pattern: 'dive_bomb', speed: 240 },
        { type: 'SMALL', x: 400, y: -20, pattern: 'dive_bomb', speed: 240, shoot: true },
      ]
    },
    { triggerScrollY: 4900, isBoss: true, bossType: 'Boss3' },
  ],
};
