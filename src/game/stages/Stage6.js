/** Stage 6 — 深紅の終焉（敵数増量版） */
export const STAGE_6 = {
  id: 5,
  name: 'STAGE 6',
  scrollSpeed: 102,
  bossExpBonus: 2000,
  bossScoreBonus: 35000,
  waves: [
    { triggerScrollY: 100,
      enemies: [
        { type: 'ELITE',  x:  80, y: -30, pattern: 'dive_bomb', speed: 220, shoot: true },
        { type: 'LARGE',  x: 160, y: -30, pattern: 'zigzag',    speed: 95,  shoot: true },
        { type: 'LARGE',  x: 320, y: -30, pattern: 'zigzag',    speed: 95,  shoot: true },
        { type: 'ELITE',  x: 400, y: -30, pattern: 'dive_bomb', speed: 220, shoot: true },
      ]
    },
    { triggerScrollY: 450,
      enemies: [
        { type: 'SMALL', x:  60, y: -20, pattern: 'dive_bomb', speed: 320, shoot: true },
        { type: 'SMALL', x: 130, y: -20, pattern: 'dive_bomb', speed: 320 },
        { type: 'SMALL', x: 200, y: -20, pattern: 'dive_bomb', speed: 320 },
        { type: 'SMALL', x: 280, y: -20, pattern: 'dive_bomb', speed: 320 },
        { type: 'SMALL', x: 350, y: -20, pattern: 'dive_bomb', speed: 320 },
        { type: 'SMALL', x: 420, y: -20, pattern: 'dive_bomb', speed: 320, shoot: true },
      ]
    },
    { triggerScrollY: 820,
      enemies: [
        { type: 'LARGE',  x:  80, y: -30, pattern: 'sine_wave', speed: 95, shoot: true },
        { type: 'ELITE',  x: 160, y: -30, pattern: 'zigzag',    speed: 125, shoot: true },
        { type: 'LARGE',  x: 240, y: -30, pattern: 'straight_down', speed: 72, shoot: true },
        { type: 'ELITE',  x: 320, y: -30, pattern: 'zigzag',    speed: 125, shoot: true },
        { type: 'LARGE',  x: 400, y: -30, pattern: 'sine_wave', speed: 95, shoot: true },
      ]
    },
    { triggerScrollY: 1250,
      enemies: [
        { type: 'MEDIUM', x:  60, y: -20, pattern: 'dive_bomb', speed: 250, shoot: true },
        { type: 'MEDIUM', x: 130, y: -20, pattern: 'dive_bomb', speed: 250 },
        { type: 'MEDIUM', x: 200, y: -20, pattern: 'dive_bomb', speed: 250 },
        { type: 'MEDIUM', x: 280, y: -20, pattern: 'dive_bomb', speed: 250 },
        { type: 'MEDIUM', x: 350, y: -20, pattern: 'dive_bomb', speed: 250 },
        { type: 'MEDIUM', x: 420, y: -20, pattern: 'dive_bomb', speed: 250, shoot: true },
      ]
    },
    { triggerScrollY: 1700,
      enemies: [
        { type: 'ELITE',  x:  80, y: -30, pattern: 'sine_wave', speed: 130, shoot: true },
        { type: 'ELITE',  x: 160, y: -30, pattern: 'zigzag',    speed: 120, shoot: true },
        { type: 'LARGE',  x: 240, y: -30, pattern: 'dive_bomb', speed: 140, shoot: true },
        { type: 'ELITE',  x: 320, y: -30, pattern: 'zigzag',    speed: 120, shoot: true },
        { type: 'ELITE',  x: 400, y: -30, pattern: 'sine_wave', speed: 130, shoot: true },
      ]
    },
    { triggerScrollY: 2200,
      enemies: [
        { type: 'SMALL', x:  60, y: -20, pattern: 'dive_bomb', speed: 340, shoot: true },
        { type: 'SMALL', x: 120, y: -20, pattern: 'dive_bomb', speed: 340 },
        { type: 'SMALL', x: 180, y: -20, pattern: 'dive_bomb', speed: 340 },
        { type: 'SMALL', x: 240, y: -20, pattern: 'dive_bomb', speed: 340 },
        { type: 'SMALL', x: 300, y: -20, pattern: 'dive_bomb', speed: 340 },
        { type: 'SMALL', x: 360, y: -20, pattern: 'dive_bomb', speed: 340 },
        { type: 'SMALL', x: 420, y: -20, pattern: 'dive_bomb', speed: 340, shoot: true },
      ]
    },
    { triggerScrollY: 2700,
      enemies: [
        { type: 'ELITE',  x:  80, y: -30, pattern: 'sine_wave', speed: 132, shoot: true },
        { type: 'LARGE',  x: 160, y: -30, pattern: 'zigzag',    speed: 96,  shoot: true },
        { type: 'ELITE',  x: 240, y: -30, pattern: 'dive_bomb', speed: 225, shoot: true },
        { type: 'LARGE',  x: 320, y: -30, pattern: 'zigzag',    speed: 96,  shoot: true },
        { type: 'ELITE',  x: 400, y: -30, pattern: 'sine_wave', speed: 132, shoot: true },
      ]
    },
    { triggerScrollY: 3250,
      enemies: [
        { type: 'MEDIUM', x:  80, y: -20, pattern: 'zigzag',    speed: 135, shoot: true },
        { type: 'MEDIUM', x: 160, y: -20, pattern: 'zigzag',    speed: 135 },
        { type: 'ELITE',  x: 240, y: -30, pattern: 'sine_wave', speed: 132, shoot: true },
        { type: 'MEDIUM', x: 320, y: -20, pattern: 'zigzag',    speed: 135 },
        { type: 'MEDIUM', x: 400, y: -20, pattern: 'zigzag',    speed: 135, shoot: true },
      ]
    },
    { triggerScrollY: 3800,
      enemies: [
        { type: 'LARGE',  x:  80, y: -30, pattern: 'sine_wave', speed: 98, shoot: true },
        { type: 'ELITE',  x: 160, y: -30, pattern: 'dive_bomb', speed: 230, shoot: true },
        { type: 'LARGE',  x: 240, y: -30, pattern: 'zigzag',    speed: 100, shoot: true },
        { type: 'ELITE',  x: 320, y: -30, pattern: 'dive_bomb', speed: 230, shoot: true },
        { type: 'LARGE',  x: 400, y: -30, pattern: 'sine_wave', speed: 98, shoot: true },
      ]
    },
    { triggerScrollY: 4400,
      enemies: [
        { type: 'SMALL', x:  60, y: -20, pattern: 'dive_bomb', speed: 360, shoot: true },
        { type: 'SMALL', x: 120, y: -20, pattern: 'dive_bomb', speed: 360 },
        { type: 'SMALL', x: 180, y: -20, pattern: 'dive_bomb', speed: 360 },
        { type: 'SMALL', x: 240, y: -20, pattern: 'dive_bomb', speed: 360, shoot: true },
        { type: 'SMALL', x: 300, y: -20, pattern: 'dive_bomb', speed: 360 },
        { type: 'SMALL', x: 360, y: -20, pattern: 'dive_bomb', speed: 360 },
        { type: 'SMALL', x: 420, y: -20, pattern: 'dive_bomb', speed: 360, shoot: true },
      ]
    },
    { triggerScrollY: 5100,
      enemies: [
        { type: 'ELITE',  x:  80, y: -30, pattern: 'sine_wave', speed: 135, shoot: true },
        { type: 'LARGE',  x: 160, y: -30, pattern: 'zigzag',    speed: 100, shoot: true },
        { type: 'ELITE',  x: 240, y: -30, pattern: 'sine_wave', speed: 140, shoot: true },
        { type: 'LARGE',  x: 320, y: -30, pattern: 'zigzag',    speed: 100, shoot: true },
        { type: 'ELITE',  x: 400, y: -30, pattern: 'sine_wave', speed: 135, shoot: true },
      ]
    },
    { triggerScrollY: 6600, isBoss: true, bossType: 'Boss6' },
  ],
};
