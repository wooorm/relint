'use strict';

var util,
    whiteSpaceMap;

util = {};

whiteSpaceMap = {
    '\n': '\\n',
    '\r': '\\r',
    '\f': '\\f',
    '\t': '\\t',
    ' ': '·'
};

function visualizeWhiteSpace(value) {
    return value.replace(/\s/g, function ($0) {
        return whiteSpaceMap[$0] || $0;
    });
}

function findCharactersInDirectionFactory(direction) {
    var fn;

    fn = direction === 'prev' ? 'walkBackwards' : 'walkForwards';

    return function (node, characters) {
        var value,
            results;

        results = [];

        node[fn](function (otherNode) {
            results.push(otherNode.toString());

            if (results.join('').length > characters) {
                return false;
            }
        });

        if (direction === 'prev') {
            value = results.reverse().join('');

            return value.slice(-characters);
        }

        return results.join('').slice(0, characters);
    };
}

function getNodePosition(node) {
    var valueBefore,
        lines, lastLine;

    valueBefore = [];

    node.walkBackwards(function (otherNode) {
        valueBefore.push(otherNode);
    });

    valueBefore = valueBefore.reverse().join('');

    lines = valueBefore.split(/\n/);
    lastLine = lines[lines.length - 1];

    return {
        'line': lines.length,
        'column': lastLine.length + 1
    };
}

/**
 * Expose `util`.
 */

module.exports = util;

util.visualizeWhiteSpace = visualizeWhiteSpace;
util.getNodePosition = getNodePosition;
util.findPrevCharacters = findCharactersInDirectionFactory('prev');
util.findNextCharacters = findCharactersInDirectionFactory('next');
