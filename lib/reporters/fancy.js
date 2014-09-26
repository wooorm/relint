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
        position,
        anchor,
        addition;

    data = [];

    anchor = problem.anchor || problem.deletion;
    addition = problem.addition;

    position = util.getNodePosition(anchor);

    data.push([
        '',
        position.line + ':' + position.column,
        chalk.yellow(problem.rule),
        '"' + util.visualizeWhiteSpace(chalk.red(anchor)) + '"'
    ]);

    if (addition) {
        data[0].push(
            '"' + util.visualizeWhiteSpace(chalk.green(addition)) + '"'
        );
    }

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

fancy.description = 'Colors & tables.';

/**
 * Expose `fancy`.
 */

module.exports = fancy;
