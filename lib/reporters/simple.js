'use strict';

/**
 * Define `simple`.
 */

function simple(problem) {
    console.log(problem.rule + ': "' + problem.anchor + '"');
}

/**
 * Define `description`.
 */

simple.description = 'Simply log warnings and errors';

/**
 * Expose `simple`.
 */

module.exports = simple;
