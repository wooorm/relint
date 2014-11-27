'use strict';

var util,
    whiteSpaceMap;

util = {};

whiteSpaceMap = {
    '\n' : '\\n',
    '\r' : '\\r',
    '\f' : '\\f',
    '\t' : '\\t',
    ' ' : '·'
};

function visualizeWhiteSpace(value) {
    return value.replace(/\s/g, function ($0) {
        return whiteSpaceMap[$0] || $0;
    });
}

function isAttached(object, parent) {
    if (!parent) {
        return Boolean(object.parent);
    }

    if ('startContainer' in object) {
        return isAttached(object.startContainer, parent) &&
            isAttached(object.endContainer, parent);
    }

    while (object) {
        if (object === parent) {
            return true;
        }

        object = object.parent;
    }

    return false;
}

function findParentInDirectionFactory(direction) {
    return function (node) {
        while (node) {
            if ((node = node.parent) && node[direction]) {
                return node[direction];
            }
        }

        return null;
    };
}

var findPrevParent = findParentInDirectionFactory('prev'),
    findNextParent = findParentInDirectionFactory('next');

function walkInDirectionFactory(direction) {
    var findParent;

    findParent = direction === 'prev' ? findPrevParent : findNextParent;

    return function (start, callback) {
        var pointer = start[direction] || findParent(start),
            result;

        while (pointer) {
            result = callback(pointer);

            if (result === false) {
                return;
            }

            pointer = pointer[direction] || findParent(pointer);
        }
    };
}

var walkForwards = walkInDirectionFactory('next'),
    walkBackwards = walkInDirectionFactory('prev');

function findCharactersInDirectionFactory(direction) {
    var walk;

    walk = direction === 'prev' ? walkBackwards : walkForwards;

    return function (node, characters) {
        var value,
            results;

        results = [];

        walk(node, function (otherNode) {
            results.push(otherNode.toString());

            if (results.join('').length > characters) {
                return false;
            }
        });

        if (direction === 'prev') {
            value = results.reverse().join('');

            // console.log('value: ', characters, [value]);

            return value.slice(-characters);
        }

        return results.join('').slice(0, characters);
    };
}

var findPrevCharacters = findCharactersInDirectionFactory('prev'),
    findNextCharacters = findCharactersInDirectionFactory('next');

function getNodePosition(node) {
    var valueBefore,
        lines, lastLine;

    valueBefore = [];

    walkBackwards(node, function (otherNode) {
        valueBefore.push(otherNode);
    });

    valueBefore = valueBefore.reverse().join('');

    lines = valueBefore.split(/\n/);
    lastLine = lines[lines.length - 1];

    return {
        'line' : lines.length,
        'column' : lastLine.length + 1
    };
}

/**
 * Expose `util`.
 */

module.exports = util;

util.visualizeWhiteSpace = visualizeWhiteSpace;
util.getNodePosition = getNodePosition;
util.walkBackwards = walkBackwards;
util.walkForwards = walkForwards;
util.isAttached = isAttached;
util.findPrevParent = findPrevParent;
util.findNextParent = findNextParent;
util.findPrevCharacters = findPrevCharacters;
util.findNextCharacters = findNextCharacters;
