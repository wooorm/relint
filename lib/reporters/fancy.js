'use strict';

var table,
    chalk,
    minSize;

/**
 * Module dependencies.
 */

table = require('text-table');
chalk = require('chalk');

/**
 * Constants.
 */

minSize = 15;

/**
 * Define `fancy`.
 */

function fancy(problem) {
    var data,
        rule;

    data = [];
    rule = problem.rule;

    data.push([
        Array(minSize - rule.length).join(' ') + chalk.yellow(rule) + ':',
        chalk.red(problem.anchor)
    ]);

    if (problem.description) {
        data.push([
            'Problem:',
            problem.description
        ]);
    }

    if (problem.fix) {
        data.push([
            'Fix:',
            problem.fix
        ]);
    }

    /* This is not a debug message. */
    console.log(table(data, {
        'align' : ['r', 'l'],
        'stringLength' : function (value) {
            return chalk.stripColor(value).length;
        }
    }));
    console.log();
}

/**
 * Define `description`.
 */

fancy.description = 'Print warnings, colors, tables.';

/**
 * Expose `fancy`.
 */

module.exports = fancy;
