/** Stage 2 — ジグザグ・追尾の脅威（敵数増量版） */
export const STAGE_2 = {
  id: 1,
  name: 'STAGE 2',
  scrollSpeed: 72,
  bossExpBonus: 800,
  bossScoreBonus: 8000,
  waves: [
    { triggerScrollY: 100,
      enemies: [
        { type: 'SMALL', x:  60, y: -20, pattern: 'zigzag', speed: 130 },
        { type: 'SMALL', x: 140, y: -20, pattern: 'zigzag', speed: 130 },
        { type: 'SMALL', x: 340, y: -20, pattern: 'zigzag', speed: 130 },
        { type: 'SMALL', x: 420, y: -20, pattern: 'zigzag', speed: 130 },
      ]
    },
    { triggerScrollY: 380,
      enemies: [
        { type: 'MEDIUM', x: 100, y: -20, pattern: 'zigzag', speed: 100, shoot: true },
        { type: 'MEDIUM', x: 240, y: -20, pattern: 'straight_down', speed: 85 },
        { type: 'MEDIUM', x: 380, y: -20, pattern: 'zigzag', speed: 100, shoot: true },
      ]
    },
    { triggerScrollY: 680,
      enemies: [
        { type: 'SMALL', x:  80, y: -20, pattern: 'dive_bomb', speed: 210, shoot: true },
        { type: 'SMALL', x: 160, y: -20, pattern: 'dive_bomb', speed: 210 },
        { type: 'SMALL', x: 240, y: -20, pattern: 'dive_bomb', speed: 210 },
        { type: 'SMALL', x: 320, y: -20, pattern: 'dive_bomb', speed: 210 },
        { type: 'SMALL', x: 400, y: -20, pattern: 'dive_bomb', speed: 210, shoot: true },
      ]
    },
    { triggerScrollY: 1000,
      enemies: [
        { type: 'MEDIUM', x:  80, y: -20, pattern: 'zigzag', speed: 105, shoot: true },
        { type: 'MEDIUM', x: 180, y: -20, pattern: 'zigzag', speed: 105 },
        { type: 'MEDIUM', x: 300, y: -20, pattern: 'zigzag', speed: 105 },
        { type: 'MEDIUM', x: 400, y: -20, pattern: 'zigzag', speed: 105, shoot: true },
      ]
    },
    { triggerScrollY: 1320,
      enemies: [
        { type: 'LARGE',  x: 120, y: -30, pattern: 'zigzag', speed: 72, shoot: true },
        { type: 'SMALL',  x: 240, y: -20, pattern: 'dive_bomb', speed: 220 },
        { type: 'LARGE',  x: 360, y: -30, pattern: 'zigzag', speed: 72, shoot: true },
      ]
    },
    { triggerScrollY: 1650,
      enemies: [
        { type: 'SMALL', x:  60, y: -20, pattern: 'sine_wave', speed: 110 },
        { type: 'SMALL', x: 130, y: -20, pattern: 'sine_wave', speed: 110 },
        { type: 'SMALL', x: 200, y: -20, pattern: 'sine_wave', speed: 110 },
        { type: 'SMALL', x: 280, y: -20, pattern: 'sine_wave', speed: 110 },
        { type: 'SMALL', x: 350, y: -20, pattern: 'sine_wave', speed: 110 },
        { type: 'SMALL', x: 420, y: -20, pattern: 'sine_wave', speed: 110 },
      ]
    },
    { triggerScrollY: 1980,
      enemies: [
        { type: 'ELITE',  x: 240, y: -30, pattern: 'sine_wave', speed: 82, shoot: true },
      ]
    },
    { triggerScrollY: 2300,
      enemies: [
        { type: 'MEDIUM', x:  80, y: -20, pattern: 'dive_bomb', speed: 190, shoot: true },
        { type: 'MEDIUM', x: 160, y: -20, pattern: 'dive_bomb', speed: 190 },
        { type: 'MEDIUM', x: 320, y: -20, pattern: 'dive_bomb', speed: 190 },
        { type: 'MEDIUM', x: 400, y: -20, pattern: 'dive_bomb', speed: 190, shoot: true },
      ]
    },
    { triggerScrollY: 2650,
      enemies: [
        { type: 'SMALL', x:  80, y: -20, pattern: 'curve_right', speed: 130 },
        { type: 'SMALL', x: 160, y: -20, pattern: 'curve_right', speed: 130 },
        { type: 'SMALL', x: 240, y: -20, pattern: 'straight_down', speed: 120, shoot: true },
        { type: 'SMALL', x: 320, y: -20, pattern: 'curve_left',  speed: 130 },
        { type: 'SMALL', x: 400, y: -20, pattern: 'curve_left',  speed: 130 },
      ]
    },
    { triggerScrollY: 3000,
      enemies: [
        { type: 'LARGE',  x: 160, y: -30, pattern: 'straight_down', speed: 65, shoot: true },
        { type: 'MEDIUM', x: 240, y: -20, pattern: 'zigzag', speed: 100 },
        { type: 'LARGE',  x: 320, y: -30, pattern: 'straight_down', speed: 65, shoot: true },
      ]
    },
    { triggerScrollY: 3400,
      enemies: [
        { type: 'SMALL',  x:  60, y: -20, pattern: 'dive_bomb', speed: 230, shoot: true },
        { type: 'SMALL',  x: 140, y: -20, pattern: 'dive_bomb', speed: 230 },
        { type: 'ELITE',  x: 240, y: -30, pattern: 'zigzag',    speed: 90,  shoot: true },
        { type: 'SMALL',  x: 340, y: -20, pattern: 'dive_bomb', speed: 230 },
        { type: 'SMALL',  x: 420, y: -20, pattern: 'dive_bomb', speed: 230, shoot: true },
      ]
    },
    { triggerScrollY: 4400, isBoss: true, bossType: 'Boss2' },
  ],
};
