export const CELL_SIZE = 193;
export const HOLE_LOCATIONS = ['U', 'R', 'D', 'L'];
export const ROTATION_NUMBERS = [3, 5];
export const ROTATION_DIRECTIONS = ['CW', 'CCW'];
export const ARENA_LENGTH = 5;
export const GRIDS = [
    {
        starts: [[0,0], [4,4]],
        arrows: [[0,4], [1,4], [3,0], [4,0]],
        orbs: [[1,1], [4,3]],
        grid: [
            ['R',' ',' ',' ','d'],
            [' ','*',' ',' ','l'],
            [' ',' ',' ',' ',' '],
            ['r',' ',' ',' ',' '],
            ['u',' ',' ','*','L']
        ],
        orientation: 'h',
        note: 'odd'
    },
    {
        starts: [[0,0], [4,4]],
        arrows: [[0,4], [1,4], [3,0], [4,0]],
        orbs: [[0,1], [3,4]],
        grid: [
            ['R','*',' ',' ','d'],
            [' ',' ',' ',' ','l'],
            [' ',' ',' ',' ',' '],
            ['r',' ',' ',' ','*'],
            ['u',' ',' ',' ','L']
        ],
        orientation: 'h',
        note: 'normal'
    },
    {
        starts: [[0,4], [4,0]],
        arrows: [[0,0], [0,1], [4,3], [4,4]],
        orbs: [[0,3], [3,0]],
        grid: [
            ['r','d',' ','*','D'],
            [' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' '],
            ['*',' ',' ',' ',' '],
            ['U',' ',' ','u','l']
        ],
        orientation: 'v',
        note: 'normal'
    },
    {
        starts: [[0,4], [4,0]],
        arrows: [[0,0], [0,1], [4,3], [4,4]],
        orbs: [[1,4], [4,1]],
        grid: [
            ['r','d',' ',' ','D'],
            [' ',' ',' ',' ','*'],
            [' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' '],
            ['U','*',' ','u','l']
        ],
        orientation: 'v',
        note: 'normal'
    }
]
export const ROTATION_DIR_TO_DEGREES = new Map([
    ['U', 0],
    ['R', 90],
    ['D', 180],
    ['L', 270]
  ]);
export const ROTATION_NUM_TO_IMG = new Map([
    [3, '../assets/times-three.png'],
    [5, '../assets/times-five.png']
  ]);
export const DEBUFF_HOLE_LOC_TO_IMG = new Map([
    ['U', '../assets/front-unseen.png'],
    ['R', '../assets/right-unseen.png'],
    ['D', '../assets/back-unseen.png'],
    ['L', '../assets/left-unseen.png']
  ]);
export const DIRECTION_ROTATIONS = [
    [-45,  0,   45],
    [-90,  0,   90],
    [-135, 180, 135]
];
export const PLAYER_SIZE = 50;
export const PLAYER_OFFSET = CELL_SIZE/2 - PLAYER_SIZE/2;

export const ROT_DIR_SIZE = 80;
export const ROT_DIR_OFFSET = CELL_SIZE/2 - ROT_DIR_SIZE/2;

export const ASSET_SIZE = 100;

export const FADE_DEFAULT = 300;
export const START_SECONDS = 300;
export const INTERVAL_SECONDS = 1000;