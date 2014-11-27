'use strict';

var table,
    chalk,
    util;

/**
 * Module dependencies.
 */

table = require('text-table');
chalk = require('chalk');
util = require('../util');

/**
 * Define `fancy`.
 */

function fancy(problem) {
    var data,
        value,
        position,
        anchor,
        addition,
        lineLength,
        before,
        after,
        beforeLength,
        afterLength,
        length;

    data = [];

    anchor = problem.anchor || problem.deletion;
    addition = problem.addition;

    position = util.getNodePosition(anchor);

    lineLength = 78;

    length = util.visualizeWhiteSpace(
        anchor.toString() + (addition || '').toString()
    ).length;

    afterLength = beforeLength = (lineLength / 2) - (length / 2);

    if (beforeLength !== Math.round(beforeLength)) {
        beforeLength -= 0.5;
        afterLength += 0.5;
    }

    before = util.findPrevCharacters(anchor, lineLength);
    after = util.findNextCharacters(anchor, lineLength);

    before = util.visualizeWhiteSpace(before).slice(-beforeLength - 1);
    after = util.visualizeWhiteSpace(after).slice(0, afterLength - 1);

    value = chalk.red(anchor);

    if (addition) {
        value += chalk.green(addition);
    }

    value = util.visualizeWhiteSpace(value);

    data.push([
        '',
        '…' + before + value + after + '…',
        '',
        position.line + ':' + position.column,
        '',
        chalk.yellow(problem.rule)
    ]);

    /* This is not a debug message. */
    console.log(table(data, {
        'stringLength' : function (value) {
            return chalk.stripColor(value).length;
        }
    }));
}

/**
 * Define `description`.
 */

fancy.description = '';

/**
 * Expose `fancy`.
 */

module.exports = fancy;
