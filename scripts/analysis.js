const CELL_SIZE = 193;
const HOLE_LOCATIONS = ['U', 'R', 'D', 'L'];
const ROTATION_NUMBERS = [3, 5];
const ROTATION_DIRECTIONS = ['CW', 'CCW'];
const GRIDS = [
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
        orientation: 'h'
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
        orientation: 'h'
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
        orientation: 'v'
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
        orientation: 'v'
    }
]
const ROTATION_DIR_TO_DEGREES = new Map([
    ['U', 0],
    ['R', 90],
    ['D', 180],
    ['L', 270]
  ]);
const ROTATION_NUM_TO_IMG = new Map([
    [3, '../assets/times-three.png'],
    [5, '../assets/times-five.png']
  ]);
const DEBUFF_HOLE_LOC_TO_IMG = new Map([
    ['U', '../assets/front-unseen.png'],
    ['R', '../assets/right-unseen.png'],
    ['D', '../assets/back-unseen.png'],
    ['L', '../assets/left-unseen.png']
  ]);
const DIRECTION_ROTATIONS = [
    [315,  0,   45],
    [270,  0,   90],
    [225, 180, 135]
];
const PLAYER_SIZE = 40;
const PLAYER_OFFSET = CELL_SIZE/2 - PLAYER_SIZE/2;


const ROT_DIR_SIZE = 80;
const ROT_DIR_OFFSET = CELL_SIZE/2 - ROT_DIR_SIZE/2;

arenaGrid = {};
deadzoneGrid = [];
assetsGrid = [...Array(5)].map(e => Array(5));
testLocations = [];
testDirections = [];

currentBossMechs = null;
currentPlayerMechs = null;
currentStep = 0;

$(document).ready(function() {
    initGrid();
});

function initGrid(orient = null) {
    if(orient == null) {
        arenaGrid = GRIDS[Math.floor(Math.random() * GRIDS.length)];
    }
    else if(orient == 'h' || orient == 'v') {
        // get sub-array that has that orientation
    }
    
    nextStep();
}

function nextStep() {
    switch(currentStep) {
        case 0: // default state
            // player gets rotation dir buff

            step0();
            break;

        case 1: // orb 1 explodes
            // player/boss gets rotation# buff
            // boss displays aoe
            break;
        
        case 2: // 
            break;

        default:
            console.log('nothing');
    }
}

function step1() {
    //orb 1 explodes

}

function step0() {
    // set up deadzones
    deadzoneGrid = [];
    for(i = 0; i < 5; i++) {
        gridRow = [];
        for(j = 0; j < 5; j++) {
            cellId = `dead_${i}_${j}`;
            cellImg = $('<img>', { 
                src: "../assets/dead-zone.png",
                id: cellId,
                class: 'invisibleImg'
            });
            cellImg.css({
                'top': i*CELL_SIZE + 'px',
                'left': j*CELL_SIZE + 'px',
                'opacity': '40%'
            });
            
            $('#arenaContainer').append(cellImg);
            gridRow[j] = cellId;
        }
        deadzoneGrid[i] = gridRow;
    }

    // set up arrows
    startArrows = arenaGrid.starts;
    initAssets('start_arrow', '../assets/arrow-start.png', startArrows);
    initAssets('arrow', '../assets/arrow-normal.png', arenaGrid.arrows);
    initAssets('orb', '../assets/ozma.png', arenaGrid.orbs);

    // activate deadzones for start arrows
    for(i = 0; i < startArrows.length; i++) {
        cellXY = startArrows[i];
        cellX = cellXY[0];
        cellY = cellXY[1];
        activateDeadzone(cellX, cellY);
    }

    // place test locs
    initTests();

    // generate player and boss mechs
    currentBossMechs = initBossMechs();
    currentPlayerMechs = initPlayerMechs();
    
    // display player
    playerHole = currentPlayerMechs.holeLocation;

    playerFaceImg = $('<img>', { 
        src: '../assets/player.png',
        id: 'player_face',
        height: PLAYER_SIZE + 'px'
    });
    playerFaceImg.css({
        'top': (3*CELL_SIZE) + PLAYER_OFFSET + 'px',
        'left': (2*CELL_SIZE) + PLAYER_OFFSET + 'px'
    });

    playerHoleImg = $('<img>', { 
        src: '../assets/player-hole.png',
        id: 'player_hole',
        height: PLAYER_SIZE + 'px'
    });
    playerHoleImg.css({
        'top': (3*CELL_SIZE) + PLAYER_OFFSET + 'px',
        'left': (2*CELL_SIZE) + PLAYER_OFFSET + 'px',
        'rotate': ROTATION_DIR_TO_DEGREES.get(playerHole) + 'deg',
        'opacity': '80%'
    });

    $('#arenaContainer').append(playerHoleImg);
    $('#arenaContainer').append(playerFaceImg);

    // display boss' rotation
    bossRot = currentBossMechs.rotationDirection;
    rotationPath = (bossRot == 'CW'?
        '../assets/rotation-cw.png' : '../assets/rotation-ccw.png')
    bossRotImg = $('<img>', { 
        src: rotationPath,
        id: 'boss_aoe',
        height: ROT_DIR_SIZE + 'px'
    });
    bossRotImg.css({
        'top': (2*CELL_SIZE) + ROT_DIR_OFFSET + 'px',
        'left': (2*CELL_SIZE) + ROT_DIR_OFFSET + 'px'
    });
    $('#arenaContainer').append(bossRotImg);

    displayStatusInfo('playerInfo', 'player_hole_loc', DEBUFF_HOLE_LOC_TO_IMG.get(playerHole));
    displayStatusInfo('playerInfo', 'player_rot_num', ROTATION_NUM_TO_IMG.get(currentPlayerMechs.rotationNumber));
    displayStatusInfo('bossInfo', 'boss_rot_num', ROTATION_NUM_TO_IMG.get(currentBossMechs.rotationNumber));
}

function initTests() {
    // generate test locations and display
    
    baseCell = 2*CELL_SIZE;

    for(i = 0; i < 3; i++) {
        gridRow = [];
        for(j = 0; j < 3; j++) {
            if(i == 1 && j == 1) continue;

            testId = `test_loc_${i}_${j}`;
            topPx = baseCell + i*PLAYER_OFFSET;
            leftPx = baseCell + j*PLAYER_OFFSET;

            testImg = $('<img>', { 
                src: '../assets/test-location.png',
                id: testId,
                onclick: `displayTestDirections([${i}, ${j}], [${topPx}, ${leftPx}])`,
                height: PLAYER_SIZE + 'px',
                class: 'test-loc'
            });
            testImg.css({
                'top': topPx + 'px',
                'left': leftPx + 'px',
                'cursor': 'pointer',
                'opacity': '80%'
            });
            gridRow[j] = testId;
            $('#arenaContainer').append(testImg);

        }
        testLocations[i] = gridRow;
    }
    
    // generate test directions and make invisible

    //player's top/left
    playerImg = $('#player_face');
    playerLoc = [playerImg.css('top'), playerImg.css('left')];

    for(i = 0; i < 3; i++) {
        gridRow = [];
        for(j = 0; j < 3; j++) {
            if(i == 1 && j == 1) continue;

            directionCoords = getTestDirectionCoords([i,j], playerLoc);
            testId = `test_dir_${i}_${j}`;
            testImg = $('<img>', {
                src: '../assets/test-direction.png',
                id: testId,
                onclick: `grade([${i}, ${j}])`,
                height: PLAYER_SIZE + 'px',
                class: 'test-dir invisibleImg'
            });
            testImg.css({
                'top': directionCoords[0] + 'px',
                'left': directionCoords[1] + 'px',
                'cursor': 'pointer',
                'opacity': '80%',
                'rotate': DIRECTION_ROTATIONS[i][j] + 'deg'
            });

            gridRow[j] = testId;
            $('#arenaContainer').append(testImg);
        }
        testDirections[i] = gridRow;
    }
}

function grade(index) {

    switch(currentStep) {
        case 0: // judge against orb 1
            //determine if correct

            //
            break;
        
        case 1: //
        default:
            console.log('nothing');
    }

    currentStep++;
    nextStep();

    //rotate player
    //resolveRotation(index, 'player_hole');
}

function displayTestDirections(index, loc) {
    //make all test locations invisible
    for(i = 0; i < 3; i++) {
        for(j = 0; j < 3; j++) {
            if(i == 1 && j == 1) continue;
            
            testId = testLocations[i][j];
            testImg = $(`#${testId}`);

            testImg.addClass('invisibleImg');
        }
    }

    //move player to location
    $('#player_face').css({
        'top': loc[0] + 'px',
        'left': loc[1] + 'px'
    });
    $('#player_hole').css({
        'top': loc[0] + 'px',
        'left': loc[1] + 'px'
    });

    // move directions and make visible
    for(i = 0; i < 3; i++) {
        for(j = 0; j < 3; j++) {
            if(i == 1 && j == 1) continue;

            directionCoords = getTestDirectionCoords([i,j], loc);
            testId = testDirections[i][j];
            testImg = $(`#${testId}`);
            testImg.css({
                'top': directionCoords[0] + 'px',
                'left': directionCoords[1] + 'px'
            });
            testImg.removeClass('invisibleImg');
        }
    }
}

function resolveRotation(index, rotateId) {
    rotationVal = DIRECTION_ROTATIONS[index[0]][index[1]];
    holeLoc = null;
    
    if(rotateId == 'boss_aoe') {
        holeLoc = currentBossMechs.holeLocation;
    } else {
        holeLoc = currentPlayerMechs.holeLocation;
        $('#player_face').css({
            'rotate': rotationVal + 'deg'
        });
    }

    newRotation = (ROTATION_DIR_TO_DEGREES.get(holeLoc) + rotationVal) % 360;

    $(`#${rotateId}`).css({
        'rotate': newRotation + 'deg'
    });
}

function getTestDirectionCoords(index, loc) {
    offsets = [-PLAYER_SIZE, 0, PLAYER_SIZE];
    topOffset = offsets[index[0]];
    leftOffset = offsets[index[1]];

    return [loc[0] + topOffset, loc[1] + leftOffset];
}

/*
    Taken from https://cupnoodle.moe/sunrise.htm
*/
function moveImage(imgId, topPx, leftPx, rotDeg) {
    imageToMove = document.getElementById(imgId);

	if (img) {
		imageToMove.offsetHeight; //Force Reflow
		
		//Move image to specified location
		imageToMove.style.left = leftPx + "px";
		imageToMove.style.top = topPx + "px";
		
		//Transform (rotate/mirror)
		var transformValue = `rotate(${rotDeg}deg)`;
		imageToMove.style.transform = transformValue;
	}
	else {
		console.error("Could not move image (Not found: " + imgId + ")");
	}
}

function displayStatusInfo(targetContainer, imgId, imgPath) {
    newImg = $('<img>', {
        src: imgPath,
        id: imgId
    });
    //console.log(newImg);
    $(`#${targetContainer}`).append(newImg);
}

function activateDeadzone(cellX, cellY) {
    imgId = deadzoneGrid[cellX][cellY];
    $(`#${imgId}`).removeClass('invisibleImg');
}

// for 100x100px images
function initAssets(idPrefix, imgPath, coordsList) {
    for(i = 0; i < coordsList.length; i++) {
        cellXY = coordsList[i];
        cellX = cellXY[0];
        cellY = cellXY[1];
        rotDir = arenaGrid.grid[cellX][cellY].toUpperCase();

        offset = CELL_SIZE/2 - 50;

        cellId = `${idPrefix}_${i}`;
        cellImg = $('<img>', { 
            src: imgPath,
            id: cellId
        });
        cellImg.css({
            'top': (cellX*CELL_SIZE + offset) + 'px',
            'left': (cellY*CELL_SIZE + offset) + 'px',
            'rotate': ROTATION_DIR_TO_DEGREES.get(rotDir) + 'deg'
        });
        $('#arenaContainer').append(cellImg);
        assetsGrid[cellX][cellY] = cellId;
    }
}

function initBossMechs(loc = null, num = null, dir = null) {
    bossHoleLoc = getRandomFromArray(HOLE_LOCATIONS, loc);
    bossRotNum = getRandomFromArray(ROTATION_NUMBERS, num);
    bossRotDir = getRandomFromArray(ROTATION_DIRECTIONS, dir);

    console.log('Boss: ' + bossHoleLoc + ', ' + bossRotNum + ', ' + bossRotDir);

    return {
        holeLocation: bossHoleLoc,
        rotationNumber: bossRotNum,
        rotationDirection: bossRotDir
    }
}

function initPlayerMechs(loc = null, num = null, dir = null) {
    playerHoleLoc = getRandomFromArray(HOLE_LOCATIONS, loc);
    playerRotNum = getRandomFromArray(ROTATION_NUMBERS, num);
    playerRotDir = getRandomFromArray(ROTATION_DIRECTIONS, dir);

    console.log('Player: ' + playerHoleLoc + ', ' + playerRotNum + ', ' + playerRotDir);

    return {
        holeLocation: playerHoleLoc,
        rotationNumber: playerRotNum,
        rotationDirection: playerRotDir
    }
}

function getRandomFromArray(arr, val) {
    if(val == null || !arr.includes(val)) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
}
