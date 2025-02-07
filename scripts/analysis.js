import {
    checkIntersection,
    colinearPointWithinSegment
} from 'https://unpkg.com/line-intersect@3.0.0/es/index.js';

const ORB_AOE_ASSET = '../assets/aloalo/orb-aoe.png';
const ORB_ASSET = '../assets/aloalo/ozma.png';
const CW_ASSET = '../assets/aloalo/rotation-cw.png';
const CCW_ASSET = '../assets/aloalo/rotation-ccw.png';
const EX_ASSET = '../assets/aloalo/ex.png';
const CHECK_ASSET = '../assets/aloalo/check.png';
const THREE_ASSET = '../assets/aloalo/times-three.png';
const FIVE_ASSET = '../assets/aloalo/times-five.png';
const FRONT_ASSET = '../assets/aloalo/front-unseen.png';
const RIGHT_ASSET = '../assets/aloalo/right-unseen.png';
const LEFT_ASSET = '../assets/aloalo/left-unseen.png';
const BACK_ASSET = '../assets/aloalo/back-unseen.png';
const ARENA_ASSET = '../assets/aloalo/aloalo-boss-2-lala.png';
const DEADZONE_ASSET = '../assets/aloalo/dead-zone.png';
const START_ASSET = '../assets/aloalo/arrow-start.png';
const ARROW_ASSET = '../assets/aloalo/arrow-normal.png';
const BOSS_AOE_ASSET = '../assets/aloalo/boss-aoe.png';
const BOSS_AOE_ASSET2 = '../assets/aloalo/boss-aoe2.png';
const PLAYER_FACE_ASSET = '../assets/aloalo/player.png';
const PLAYER_HOLE_ASSET = '../assets/aloalo/player-hole.png';
const LOC_ASSET = '../assets/aloalo/test-location.png';
const DIR_ASSET = '../assets/aloalo/test-direction.png';

const ARENA_SIZE = 860; // originally 965
const CELL_SIZE = ARENA_SIZE/5;
const HOLE_LOCATIONS = ['U', 'R', 'D', 'L'];
const ROTATION_NUMBERS = [3, 5];
const ROTATION_DIRECTIONS = ['CW', 'CCW'];
const ARENA_LENGTH = 5;
const GRIDS = [
    {
        starts: [[0,0], [4,4]],
        arrows: [[0,4], [1,4], [3,0], [4,0]],
        orbs: [[4,3], [1,1]],
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
        orbs: [[3,0], [0,3]],
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
const ROTATION_DIR_TO_DEGREES = new Map([
    ['U', 0],
    ['R', 90],
    ['D', 180],
    ['L', 270]
  ]);
const ROTATION_NUM_TO_IMG = new Map([
    [3, THREE_ASSET],
    [5, FIVE_ASSET]
  ]);
const DEBUFF_HOLE_LOC_TO_IMG = new Map([
    ['U', FRONT_ASSET],
    ['R', RIGHT_ASSET],
    ['D', BACK_ASSET],
    ['L', LEFT_ASSET]
  ]);
const DIRECTION_ROTATIONS = [
    [-45,  0,   45],
    [-90,  0,   90],
    [-135, 180, 135]
];
const PLAYER_SIZE = 50;
const PLAYER_OFFSET = CELL_SIZE/2 - PLAYER_SIZE/2;

const ROT_DIR_SIZE = 70;
const ROT_DIR_OFFSET = CELL_SIZE/2 - ROT_DIR_SIZE/2;

const ASSET_SIZE = 90;

const FADE_DEFAULT = 300;
const START_SECONDS = 300;
const INTERVAL_SECONDS = 1000;

const SCORE_SIZE = 50;

var arenaGrid = {};
var deadzoneGrid = [];
var assetsGrid = [...Array(ARENA_LENGTH)].map(e => Array(ARENA_LENGTH));
var visitedGrid = [...Array(ARENA_LENGTH)].map(e => Array(ARENA_LENGTH));
var testLocations = [];
var testDirections = [];

var currentBossMechs = null;
var currentPlayerMechs = null;
var currentStep = 0;
var currentCells = [];
var weirdPattern = false;
var assetsToClear = ['start_arrow_0', 'start_arrow_1'];
var currentScore = 0;
var locIndex = null;
var dirIndex = [0, 1];

$(document).ready(function() {
    window.nextStep = nextStep;
    window.selectLocation = selectLocation;
    window.selectDirection = selectDirection;
    window.finishStep = finishStep;
    window.startOver = startOver;

    initGame();
});

function initGame() {
    arenaGrid = {};
    deadzoneGrid = [];
    assetsGrid = [...Array(ARENA_LENGTH)].map(e => Array(ARENA_LENGTH));visitedGrid = [...Array(ARENA_LENGTH)].map(e => Array(ARENA_LENGTH));
    testLocations = [];
    testDirections = [];

    currentBossMechs = null;
    currentPlayerMechs = null;
    currentStep = 0;
    currentCells = [];
    weirdPattern = false;
    assetsToClear = ['start_arrow_0', 'start_arrow_1'];
    currentScore = 0;
    dirIndex = [0, 1];
    locIndex = null;

    $('#arenaContainer').empty();
    $('#bossInfo').empty();
    $('#playerInfo').empty();
    $('#scoreInfo').empty();

    $('.directionButton').attr('disabled', true);

    initGrid();
    nextStep();
}

function startOver() {
    //console.log(isMobile());
    if(currentStep>=4) {
        initGame();
        return;
    }
    var result = confirm("Are you sure you want to start over?");
    if (result === true) initGame();
}

function initGrid(orient = null) {
    var arenaImg = $('<img>', {
        src: ARENA_ASSET,
        id: 'arenaImg',
        height: ARENA_SIZE
    });
    $('#arenaContainer').append(arenaImg);

    if(orient == null) {
        arenaGrid = GRIDS[Math.floor(Math.random() * GRIDS.length)];
    }
    else if(orient == 'h' || orient == 'v') {
        // get sub-array that has that orientation
    }

    weirdPattern = (arenaGrid.note == 'odd');
}

function nextStep() {
    toggleButton('nextButton', false);
    setTimeout(() => {
        $('#arenaSvg').empty();
    }, START_SECONDS);

    switch(currentStep) {
        case 0: // default state
            // player gets rotation dir buff
            step0();
            break;

        case 1: // orb 1 explodes
            // player/boss gets rotation# buff
            // boss displays aoe
            step1();
            break;
        
        case 2: // boss aoe explodess
            step2();
            break;

        case 3: // orb 2 explodes
            step3();
            break;

        case 4: // boss tether goes off
            step4();
            break;

        default:
            console.log('End');
    }
}

function step4() {
    var explanationText = 'Looks like you need more practice. Give it another go?';
    if(currentScore == 4) {
        explanationText = 'Excellent work! You\'re one step closer to getting that Exquisite weapon!';
    }
    updateExplanation('instruction', explanationText);

    setTimeout(() => {
        // do a boss aoe 
        $('#player_rotation').fadeOut(FADE_DEFAULT);
        $('#player_hole').fadeOut(FADE_DEFAULT);
        $('#player_face').fadeOut(FADE_DEFAULT);
        $('#player_hole_loc').fadeOut(FADE_DEFAULT);
        $('#player_rot_num').fadeOut(FADE_DEFAULT);
    }, START_SECONDS);
}

function step3() {
    updateExplanation('instruction', 'Mechanic 4!<br>Pick a <b>location to stand on</b> and a <b>direction to face</b> to show the gap in your rotating \'shield\' to Lala.');

    //sec 0: explode orb
    setTimeout(() => {
        traverseAndActivate();

        if(!weirdPattern) {
            toggleButton('confirmButton', true);
            toggleTestSpots(true, false, null);
        }
    }, 0);

    // if weird pattern, traverse one more time
    if(weirdPattern) {
        setTimeout(() => {
            traverseAndActivate();
            toggleButton('confirmButton', true);
            toggleTestSpots(true, false, null);
        }, INTERVAL_SECONDS);
    }
}

function step2() {
    updateExplanation('instruction', 'Mechanic 3!<br>Pick a <b>location to stand on</b> and a <b>direction to face</b> to show the gap in your \'shield\' to the second <b>orb</b>.');

    //sec 0: boss aoe rotates and goes off
    setTimeout(() => {
        $('#boss_rot_num').fadeOut(FADE_DEFAULT);
        $('#boss_rotation').fadeOut(FADE_DEFAULT);

        var bossAoeImg = $('#boss_aoe');
        bossAoeImg.fadeOut(FADE_DEFAULT + 400);

        //if weird pattern, orb activate toggleSpots here
        if(weirdPattern) {
            toggleTestSpots(true, false, null);
            toggleButton('confirmButton', true);
        }
    }, 0);

    if(!weirdPattern) {
        // sec 1: if NOT weird pattern, traverse
        setTimeout(() => {
            traverseAndActivate();
            toggleTestSpots(true, false, null);
            toggleButton('confirmButton', true);
        }, START_SECONDS);
    }
}

function step1() {
    updateExplanation('instruction',
        'Mechanic 2!<br>Pick a <b>location to stand on</b>, so you will be safe from Lala\'s rotating AoE.'
    );

    setTimeout(() => {
        traverseAndActivate();

        // display boss' rotation (supposed to happen 1 sec earlier, but deferred to make the grading less cluttered)
        var bossRotImg = $('#boss_rotation');
        var centerCoord = (2*CELL_SIZE) + ROT_DIR_OFFSET;
        moveImage(bossRotImg, [centerCoord, centerCoord]);
        bossRotImg.fadeIn(FADE_DEFAULT);

        $('#boss_aoe').fadeIn(FADE_DEFAULT + 100);
    }, START_SECONDS);

    // sec 2
    setTimeout(() => {
        traverseAndActivate();
    }, START_SECONDS + 1*INTERVAL_SECONDS);

    // sec 3: display player rotation
    setTimeout(() => {
        var playerRotImg = $('#player_rotation');
        moveImage(playerRotImg, getPlayerRotationCoords());
        playerRotImg.fadeIn(FADE_DEFAULT);

        traverseAndActivate();
    }, START_SECONDS + 2*INTERVAL_SECONDS);

    // sec 4
    setTimeout(() => {
        traverseAndActivate();
    }, START_SECONDS + 3*INTERVAL_SECONDS);

    // sec 5
    setTimeout(() => {
        traverseAndActivate();
        toggleTestSpots(true, false, null);
        toggleButton('confirmButton', true);
    }, START_SECONDS + 4*INTERVAL_SECONDS);
}

function step0() {
    // set up deadzones
    deadzoneGrid = [];
    for(var i = 0; i < ARENA_LENGTH; i++) {
        var gridRow = [];
        for(var j = 0; j < ARENA_LENGTH; j++) {
            var cellId = `dead_${i}_${j}`;
            var cellImg = $('<img>', { 
                src: DEADZONE_ASSET,
                id: cellId,
                height: CELL_SIZE
            });
            cellImg.css({
                'top': i*CELL_SIZE + 'px',
                'left': j*CELL_SIZE + 'px',
                'opacity': '50%',
                'display': 'none'
            });
            
            $('#arenaContainer').append(cellImg);
            gridRow[j] = cellId;

            //initialize visitedGrid
            visitedGrid[i][j] = false;
        }
        deadzoneGrid[i] = gridRow;
    }

    // set up arrows
    var startArrows = arenaGrid.starts;
    initAssets('start_arrow', START_ASSET, startArrows);
    initAssets('arrow', ARROW_ASSET, arenaGrid.arrows);
    initAssets('orb', ORB_ASSET, arenaGrid.orbs);

    // activate deadzones for start arrows, add to currentCells
    for(var i = 0; i < startArrows.length; i++) {
        var cellXY = startArrows[i];
        activateDeadzone(cellXY);
        
        var cellX = cellXY[0];
        var cellY = cellXY[1];
        var cellDirection = arenaGrid.grid[cellX][cellY];
        currentCells[i] = {
            coordinates: cellXY,
            direction: cellDirection
        };
    }

    // generate player and boss mechs
    currentBossMechs = initBossMechs();
    currentPlayerMechs = initPlayerMechs();
    
    // generate boss aoe (invisible)
    var bossAoe = currentBossMechs.holeLocation;
    var bossAoeImg = $('<img>', { 
        src: BOSS_AOE_ASSET,
        id: 'boss_aoe',
        height: ARENA_SIZE
    });
    bossAoeImg.css({
        'top': '0px',
        'left': '0px',
        'rotate': ROTATION_DIR_TO_DEGREES.get(bossAoe) + 'deg',
        'display': 'none'
    });

    // generate boss rotation (invisible)
    var bossRot = currentBossMechs.rotationDirection;
    var bossRotImg = placeRotations('boss_rotation', bossRot, ROT_DIR_SIZE);

    //generate player rotation (invisible)
    var playerRot = currentPlayerMechs.rotationDirection;
    var playerRotImg = placeRotations('player_rotation', playerRot, PLAYER_SIZE);
    
    // display player
    var playerHole = currentPlayerMechs.holeLocation;

    var playerFaceImg = $('<img>', { 
        src: PLAYER_FACE_ASSET,
        id: 'player_face',
        height: PLAYER_SIZE + 'px'
    });
    playerFaceImg.css({
        'top': (3*CELL_SIZE) + PLAYER_OFFSET + 'px',
        'left': (2*CELL_SIZE) + PLAYER_OFFSET + 'px'
    });

    var playerHoleImg = $('<img>', { 
        src: PLAYER_HOLE_ASSET,
        id: 'player_hole',
        height: PLAYER_SIZE + 'px'
    });
    playerHoleImg.css({
        'top': (3*CELL_SIZE) + PLAYER_OFFSET + 'px',
        'left': (2*CELL_SIZE) + PLAYER_OFFSET + 'px',
        'rotate': ROTATION_DIR_TO_DEGREES.get(playerHole) + 'deg',
        'opacity': '80%'
    });

    $('#arenaContainer').append(bossAoeImg);
    $('#arenaContainer').append(bossRotImg);
    $('#arenaContainer').append(playerRotImg);

    appendAndFade('arenaContainer', playerHoleImg, FADE_DEFAULT);
    appendAndFade('arenaContainer', playerFaceImg, FADE_DEFAULT);

    
    getPlayerHoleSegment();

    displayStatusInfo('playerInfo', 'player_hole_loc', DEBUFF_HOLE_LOC_TO_IMG.get(playerHole));
    displayStatusInfo('playerInfo', 'player_rot_num', ROTATION_NUM_TO_IMG.get(currentPlayerMechs.rotationNumber));
    displayStatusInfo('bossInfo', 'boss_rot_num', ROTATION_NUM_TO_IMG.get(currentBossMechs.rotationNumber));
    
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', ARENA_SIZE);
    svg.setAttribute('height', ARENA_SIZE);
    svg.setAttribute('id', 'arenaSvg');
    svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
    $('#arenaContainer').append(svg);

    // place test locs
    initTests();
    toggleButton('confirmButton', false);

    updateExplanation('instruction',
        'Mechanic 1!<br>Pick a <b>location to stand on</b> and a <b>direction to face</b> to show the gap in your \'shield\' to the first <b>orb</b>.'
    )
}

function initTests() {
    // generate test locations and display
    
    var baseCell = 2*CELL_SIZE;

    for(var i = 0; i < 3; i++) {
        var gridRow = [];
        for(var j = 0; j < 3; j++) {
            if(i == 1 && j == 1) continue;

            var testId = `test_loc_${i}_${j}`;
            var topPx = baseCell + i*PLAYER_OFFSET;
            var leftPx = baseCell + j*PLAYER_OFFSET;

            var testImg = $('<img>', { 
                src: LOC_ASSET,
                id: testId,
                onclick: `selectLocation([${i}, ${j}])`,
                height: PLAYER_SIZE + 'px',
                class: 'testLoc'
            });
            testImg.css({
                'top': topPx + 'px',
                'left': leftPx + 'px',
                'cursor': 'pointer',
                'opacity': '90%'
            });
            gridRow[j] = testId;
            appendAndFade('arenaContainer', testImg, FADE_DEFAULT);
        }
        testLocations[i] = gridRow;
    }
    
    // generate test directions and make invisible

    //player's top/left
    var playerImg = $('#player_face');
    var playerLoc = [playerImg.css('top'), playerImg.css('left')];

    for(var i = 0; i < 3; i++) {
        var gridRow = [];
        for(var j = 0; j < 3; j++) {
            if(i == 1 && j == 1) continue;

            var directionCoords = getTestDirectionCoords([i,j], playerLoc);
            var testId = `test_dir_${i}_${j}`;
            var testImg = $('<img>', {
                src: DIR_ASSET,
                id: testId,
                onclick: `selectDirection([${i}, ${j}])`,
                height: PLAYER_SIZE + 'px',
                class: 'testDir'
            });
            testImg.css({
                'top': directionCoords[0] + 'px',
                'left': directionCoords[1] + 'px',
                'cursor': 'pointer',
                'opacity': '90%',
                'rotate': DIRECTION_ROTATIONS[i][j] + 'deg',
                'display': 'none'
            });

            gridRow[j] = testId;
            $('#arenaContainer').append(testImg);
        }
        testDirections[i] = gridRow;
    }
}

function selectDirection(index) {
    //console.log('selectdirection', index);
    dirIndex = index;
    resolveRotation('player_hole', currentPlayerMechs, false, index);
}

function finishStep() {
    //console.log('finishstep', index);
    toggleButton('nextButton', true);
    toggleButton('confirmButton', false);
    var playerCenter = getCenterCoords('player_hole');

    switch(currentStep) {
        case 0: // judge against orb 1 
            toggleTestSpots(false, false, null);
            
            setTimeout(() => {
                traverseAndActivate();

                var orbCenter = getCenterCoords('orb_0');
                drawLine(playerCenter, orbCenter);
                var intersects = isIntersecting({A: orbCenter, B: playerCenter}, getPlayerHoleSegment());

                var correctText = 'Good job! You faced the gap to the first orb!';
                var wrongText = 'Oops! You got hit by the orb explosion.';
                grade(intersects, correctText, wrongText);
            }, START_SECONDS);

            break;
        
        case 1: // judge against boss AoE
            toggleTestSpots(false, false, null);

            setTimeout(() => {
                traverseAndActivate();

                var bossAoeImg = $('#boss_aoe');
                bossAoeImg.attr('src', BOSS_AOE_ASSET2);  
                resolveRotation('boss_aoe', currentBossMechs, true, null);
                bossAoeImg.fadeTo(FADE_DEFAULT, 0.7);
                bossAoeImg.fadeOut(FADE_DEFAULT + 400);

                var safe = isSafe(locIndex);
                var correctText = 'Good job! You dodged Lala\'s AoE.';
                var wrongText = 'Oops! Don\'t forget to check Lala\'s debuffs to see where it rotates. (We\'re not counting diagonals as safe in this simulation!)';
                grade(safe, correctText, wrongText);
            }, START_SECONDS);
            break;

        case 2: // judge against orb 2
            toggleTestSpots(false, false, null);

            setTimeout(() => {
                traverseAndActivate();

                var orbCenter = getCenterCoords('orb_1');
                drawLine(playerCenter, orbCenter);
                var intersects = isIntersecting({A: orbCenter, B: playerCenter}, getPlayerHoleSegment());
                
                var correctText = 'Good job! You faced the gap to the second orb!';
                var wrongText = 'Oops! Don\'t forget to check your debuffs to see where you will rotate.';
                grade(intersects, correctText, wrongText);
            }, START_SECONDS);
            break;

        case 3: // judge against boss tether
            toggleTestSpots(false, false, null);
            
            setTimeout(() => {
                traverseAndActivate();
                explodeOrb();

                resolveRotation('player_hole', currentPlayerMechs, true, dirIndex);

                var bossCenter = getCenterCoords('boss');
                drawLine(bossCenter, playerCenter);
                var intersects = isIntersecting({A: bossCenter, B: playerCenter}, getPlayerHoleSegment());
                
                var correctText = 'Good job! You faced the gap to Lala!';
                var wrongText = 'Oops! You got hit by the orb explosion.';
                grade(intersects, correctText, wrongText);
            }, START_SECONDS);
            break;

        default:
            console.log('No step', currentStep);
            break;
    }

    currentStep++;
}

function traverseGrid(currentCellIndex) {
    var cell = currentCells[currentCellIndex];
    var coords = cell.coordinates;
    var direction = cell.direction;

    var coordsX = coords[0];
    var coordsY = coords[1];
    var grid = arenaGrid.grid;

    var deltaX = new Map([
        ['U', -1],
        ['R', 0],
        ['D', 1],
        ['L', 0]
    ]);
    var deltaY = new Map([
        ['U', 0],
        ['R', 1],
        ['D', 0],
        ['L', -1]
    ]);

    var newX = coordsX + deltaX.get(direction);
    var newY = coordsY + deltaY.get(direction);

    if(!isWithinGrid(newX) || !isWithinGrid(newY)){
        return null;
    }

    var newContents = grid[newX][newY];
    var newId = assetsGrid[newX][newY];

    if(newContents != ' ')
        assetsToClear.push(newId);

    var newDirection = direction;

    if(newContents == '*')
        explodeOrb([newX, newY]);
    else if(newContents != ' ') // is direction
        newDirection = newContents.toUpperCase();
    
    var newCell = {
        coordinates: [newX, newY],
        direction: newDirection
    };
    currentCells[currentCellIndex] = newCell;
    return newCell;
}

function toggleTestSpots(showLocations, showDirections, loc) {
    for(var i = 0; i < 3; i++) {
        for(var j = 0; j < 3; j++) {
            if(i == 1 && j == 1) continue;
            
            // toggle locations
            var locationId = testLocations[i][j];
            var locationImg = $(`#${locationId}`);

            if(showLocations)
                locationImg.fadeIn(FADE_DEFAULT);
            else
                locationImg.fadeOut(FADE_DEFAULT);

            // toggle directions
            var directionId = testDirections[i][j];
            var directionImg = $(`#${directionId}`);

            if(showDirections) {
                var directionCoords = getTestDirectionCoords([i,j], loc);
                moveImage(directionImg, directionCoords);
                directionImg.fadeIn(FADE_DEFAULT);

                $('.directionButton').attr('disabled', false);
                $('#middleDirection').attr('disabled', true);
            } else {
                directionImg.fadeOut(FADE_DEFAULT);
                $('.directionButton').attr('disabled', true);
            }
        }
    }
}

function selectLocation(index) {
    locIndex = index;
    var baseCell = 2*CELL_SIZE;
    var topPx = baseCell + index[0]*PLAYER_OFFSET;
    var leftPx = baseCell + index[1]*PLAYER_OFFSET;

    var loc = [topPx, leftPx];
    
    toggleButton('confirmButton', true);

    //move player to location
    moveImage($('#player_face'), loc);
    moveImage($('#player_hole'), loc);
    moveImage($('#player_rotation'), getPlayerRotationCoords(loc));

    //reset rotation to face North
    dirIndex = [0,1];
    resolveRotation('player_hole', currentPlayerMechs, false, dirIndex);

    if(currentStep == 1) { // no need to select direction
        //make all test locations invisible
        locIndex = index;
    } else {
        //make all test locations invisible
        toggleTestSpots(true, true, loc);
    }
}

function resolveRotation(rotateId, targetMechs, forceRotating, faceIndex) {
    var rotationVal = 0;

    if(faceIndex) {
        rotationVal += DIRECTION_ROTATIONS[faceIndex[0]][faceIndex[1]];
    } 
    
    if(forceRotating) {
        // calculate based on rotate dir/num
        rotationVal += getFinalRotation(targetMechs);
    }
    var holeLoc = targetMechs.holeLocation;
    
    if(rotateId == 'player_hole') {
        $('#player_face').css({
            'rotate': rotationVal + 'deg'
        });
    }

    var newRotation = (ROTATION_DIR_TO_DEGREES.get(holeLoc) + rotationVal) % 360;
    
    $(`#${rotateId}`).css({
        'rotate': newRotation + 'deg'
    });
}

function getTestDirectionCoords(index, loc) {
    var indexX = index[0];
    var indexY = index[1];

    var offsets = [-PLAYER_SIZE, 0, PLAYER_SIZE];
    var topOffset = offsets[indexX];
    var leftOffset = offsets[indexY];
    var cornerMultiplier = 0.8;

    if(indexX == 1 || indexY == 1) //middle index
        return [loc[0] + topOffset, loc[1] + leftOffset];
    else // corner index
        return [loc[0] + topOffset*cornerMultiplier, loc[1] + leftOffset*cornerMultiplier];
}

/*
    Taken from https://cupnoodle.moe/sunrise.htm
*/
function moveImage(moveImg, loc) {
    //moveImg = $(`#${imgId}`);
    var topPx = loc[0];
    var leftPx = loc[1];

	moveImg.css({
        'top': topPx + 'px',
        'left': leftPx + 'px'
    });
}

function traverseAndActivate() {
    fadeAssets();

    for(var i = 0; i < currentCells.length; i++) {
        var newCell = traverseGrid(i);
        if(newCell)
            activateDeadzone(newCell.coordinates);
    }
}

function displayStatusInfo(targetContainerId, imgId, imgPath) {
    var newImg = $('<img>', {
        src: imgPath,
        id: imgId
    });
    appendAndFade(targetContainerId, newImg, FADE_DEFAULT);
}

function activateDeadzone(cell) {
    var imgId = deadzoneGrid[cell[0]][cell[1]];
    $(`#${imgId}`).fadeIn(FADE_DEFAULT);
}

function appendAndFade(targetContainerId, img, fadeInSecs) {
    $(`#${targetContainerId}`).append(img);
    img.fadeIn(fadeInSecs);
}

// for 100x100px images
function initAssets(idPrefix, imgPath, coordsList) {
    for(var i = 0; i < coordsList.length; i++) {
        var cellXY = coordsList[i];
        var cellX = cellXY[0];
        var cellY = cellXY[1];
        var rotDir = arenaGrid.grid[cellX][cellY].toUpperCase();

        var offset = CELL_SIZE/2 - ASSET_SIZE/2;

        var cellId = `${idPrefix}_${i}`;
        var cellImg = $('<img>', { 
            src: imgPath,
            id: cellId,
            height: ASSET_SIZE
        });
        cellImg.css({
            'top': (cellX*CELL_SIZE + offset) + 'px',
            'left': (cellY*CELL_SIZE + offset) + 'px',
            'rotate': ROTATION_DIR_TO_DEGREES.get(rotDir) + 'deg',
            'opacity': '90%',
            'display': 'none'
        });
        appendAndFade('arenaContainer', cellImg, FADE_DEFAULT);
        assetsGrid[cellX][cellY] = cellId;
    }
}

function initBossMechs(loc = null, num = null, dir = null) {
    var bossHoleLoc = getRandomFromArray(HOLE_LOCATIONS, loc);
    var bossRotNum = getRandomFromArray(ROTATION_NUMBERS, num);
    var bossRotDir = getRandomFromArray(ROTATION_DIRECTIONS, dir);

    console.log('Boss: ' + bossHoleLoc + ', ' + bossRotNum + ', ' + bossRotDir);

    return {
        holeLocation: bossHoleLoc,
        rotationNumber: bossRotNum,
        rotationDirection: bossRotDir
    }
}

function initPlayerMechs(loc = null, num = null, dir = null) {
    var playerHoleLoc = getRandomFromArray(HOLE_LOCATIONS, loc);
    var playerRotNum = getRandomFromArray(ROTATION_NUMBERS, num);
    var playerRotDir = getRandomFromArray(ROTATION_DIRECTIONS, dir);

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

function isWithinGrid(val) {
    if(val < 0 || val >= ARENA_LENGTH) return false;
    return true;
}

function explodeOrb() {
    var orbExplosionImg = $('<img>', {
        src: ORB_AOE_ASSET,
        height: ARENA_SIZE + 'px'
    });
    orbExplosionImg.css({
        'top': '0px',
        'left': '0px',
        'opacity': '20%',
        'display': 'none'
    });
    $('#arenaContainer').append(orbExplosionImg);
    appendAndFade('arenaContainer', orbExplosionImg, FADE_DEFAULT);
    orbExplosionImg.fadeOut(1000);
}

function placeRotations(imgId, rotation, size) {
    var rotationPath = (rotation == 'CW'?
        CW_ASSET : CCW_ASSET);
    var rotationImg = $('<img>', { 
        src: rotationPath,
        id: imgId,
        height: size + 'px'
    });
    rotationImg.css('display', 'none');

    return rotationImg;
}

function getPlayerRotationCoords(loc = null) {
    var playerX = 0;
    var playerY = 0;

    if(loc) {
        playerX = loc[0];
        playerY = loc[1];
    } else {
        var playerTopLeft = getTopLeftCoord('player_face');
        playerX = playerTopLeft[0];
        playerY = playerTopLeft[1];
    }

    var newX = playerX - 1.25*PLAYER_SIZE;
    var newY = playerY;
    return [newX, newY];
}

function getFinalRotation(targetObject) {
    var rotDir = targetObject.rotationDirection;
    var rotNum = targetObject.rotationNumber;

    var rotationDegree = (rotDir == 'CW'? 90 : -90);
    var rotationMultiplier = (rotNum == 3? -1 : 1);

    return rotationDegree * rotationMultiplier;
}

function getCenterCoords(targetId) {
    if(targetId.startsWith('boss'))
        return [ARENA_SIZE/2, ARENA_SIZE/2];
    
    var targetTopLeft = getTopLeftCoord(targetId);
    var targetTop = targetTopLeft[0];
    var targetLeft = targetTopLeft[1];
    var sizeOffset = 0;

    if(targetId.startsWith('player')) { //player
        sizeOffset = PLAYER_SIZE;
    } else { // orb
        sizeOffset = ASSET_SIZE;
    }

    return [
        targetTop + sizeOffset/2,
        targetLeft + sizeOffset/2
    ];
}

function getPlayerHoleSegment() {
    var pointA = getTopLeftCoord('player_hole');
    var pointB = [pointA[0], pointA[1] + PLAYER_SIZE];

    var targetImg = $('#player_hole');
    var targetRotStr = targetImg.css('rotate').split('d')[0];
    var targetRot = parseFloat(targetRotStr);

    var a = getRotatedCoords(pointA, targetRot);
    var b = getRotatedCoords(pointB, targetRot);
    //drawLine(a, b);

    return {
        A: getRotatedCoords(pointA, targetRot),
        B: getRotatedCoords(pointB, targetRot)
    }
}

function isIntersecting(segmentAB, segmentCD) {
    var pointA = segmentAB.A;
    var pointB = segmentAB.B;
    var pointC = segmentCD.A;
    var pointD = segmentCD.B;
    
    var result = checkIntersection(
        pointA[0], pointA[1], 
        pointB[0], pointB[1], 
        pointC[0], pointC[1],
        pointD[0], pointD[1]
    );

    return result.type == 'intersecting';
}

function addScore(isCorrect) {
    var imgPath = EX_ASSET;
    if(isCorrect) {
        imgPath = CHECK_ASSET;
        currentScore++;
    }

    var newScoreImg = $('<img>', {
        src: imgPath,
        height: SCORE_SIZE,
        width: SCORE_SIZE
    });

    $('#scoreInfo').append(newScoreImg);
}

/* from https://jsfiddle.net/dch7xyez/2/ */
function drawLine(point1, point2) {
    //reverse x and y here

    var lineSvg = document.createElementNS('http://www.w3.org/2000/svg','line');
    lineSvg.setAttribute('x1', point1[1]);
    lineSvg.setAttribute('y1', point1[0]);
    lineSvg.setAttribute('x2', point2[1]);
    lineSvg.setAttribute('y2', point2[0]);
    $('#arenaSvg').append(lineSvg);
}

function grade(isCorrect, correctText, wrongText) {
    addScore(isCorrect);
    var addClass = 'wrong';
    var text = wrongText;

    if(isCorrect) {
        addClass = 'correct';
        text = correctText;
    }
    updateExplanation(addClass, text);
}

function updateExplanation(classType, text) {
    var explanationDiv = $('#explanation');
    explanationDiv.removeClass();
    explanationDiv.addClass(classType);
    explanationDiv.html(text);
}

/* from https://stackoverflow.com/questions/9705123/how-can-i-get-sin-cos-and-tan-to-use-degrees-instead-of-radians
*/
function toRadians(angle) {
    return angle * (Math.PI/180);
}

/* from https://stackoverflow.com/questions/19959937/getting-image-coords-relative-to-original-image-after-image-is-rotated-90-180
x' = x*cos(θ) - y*sin(θ)
y' = x*sin(θ) + y*cos(θ)

https://stackoverflow.com/questions/6428192/get-new-x-y-coordinates-of-a-point-in-a-rotated-image

    function rotate(x, y, xm, ym, a) {
        var cos = Math.cos,
            sin = Math.sin,

            a = a * Math.PI / 180, // Convert to radians because that is what
                                // JavaScript likes

            // Subtract midpoints, so that midpoint is translated to origin
            // and add it in the end again
            xr = (x - xm) * cos(a) - (y - ym) * sin(a)   + xm,
        yr = (x - xm) * sin(a) + (y - ym) * cos(a)   + ym;

    return [xr, yr];
}
*/
function getRotatedCoords(coords, degAngle) {
    // reverse x and y here

    var center = getCenterCoords('player_hole');
    var radAngle = toRadians(degAngle);
    var x = coords[1];
    var xm = center[1];
    var y = coords[0];
    var ym = center[0];
    var cosRad = Math.cos(radAngle);
    var sinRad = Math.sin(radAngle);

    //subtract the center coords to move (0,0), then add back later
    var newX = (x-xm)*cosRad - (y-ym)*sinRad + xm;
    var newY = (x-xm)*sinRad + (y-ym)*cosRad + ym;

    return [newY, newX];
}

function getTopLeftCoord(targetId) {
    var targetImg = $(`#${targetId}`);
    var targetTopStr = targetImg.css('top').split('p')[0];
    var targetLeftStr = targetImg.css('left').split('p')[0];
    var targetTop = parseFloat(targetTopStr);
    var targetLeft = parseFloat(targetLeftStr);

    return [targetTop, targetLeft];
}

function fadeAssets() {
    assetsToClear.forEach(asset => {
        $(`#${asset}`).fadeOut(FADE_DEFAULT);
    });
    assetsToClear = [];
}

function toggleButton(buttonId, toEnable) {
    if(toEnable)
        $(`#${buttonId}`).attr('disabled', false);
    else
        $(`#${buttonId}`).attr('disabled', true);
}

function isSafe(index) {
    var bossAoeImg = $('#boss_aoe');
    var bossAoeStr = bossAoeImg.css('rotate').split('d')[0];
    var bossAoe = parseFloat(bossAoeStr);

    //turn into positive num
    bossAoe = (bossAoe + 360) % 360;

    var indexX = index[0];
    var indexY = index[1];

    if(bossAoe == 0 && indexX == 0 && indexY == 1) return true;
    else if(bossAoe == 90 && indexX == 1 && indexY == 2) return true;
    else if(bossAoe == 180 && indexX == 2 && indexY == 1) return true;
    else if(bossAoe == 270 && indexX == 1 && indexY == 0) return true;
    else
        return false;
}