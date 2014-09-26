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
        position;

    data = [];

    position = util.getNodePosition(problem.anchor);

    data.push([
        '',
        position.line + ':' + position.column,
        chalk.yellow(problem.rule),
        '"' + util.visualizeWhiteSpace(chalk.red(problem.anchor)) + '"'
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

fancy.description = 'Colors & tables.';

/**
 * Expose `fancy`.
 */

module.exports = fancy;
