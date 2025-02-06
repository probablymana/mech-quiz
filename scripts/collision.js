import {
    checkIntersection,
    colinearPointWithinSegment
} from 'https://unpkg.com/line-intersect@3.0.0/es/index.js';



function getLineSegment(point1, point2) {
    var x1 = point1[0];
    var y1 = point1[1];
    var x2 = point2[0];
    var y1 = point2[1];

    var a = y2-y1;
    var b = x1-x2;
    var c = y1*(x2-x1) - (y2-y1)*x1;

    return {a: a, b: b, c: c};
}

function getCenterCoords(topLeftCoords, size) {

    //orb
    //player
    //boss (always middle)

}

function getPlayerBoundingBox() {
    // calculate 3 lines

    var center = getCenterCoords(x, y);


    return [
        getLineSegment(point1, point2),
        getLineSegment(point2, point3),
        getLineSegment(point3, point4)
    ];
}