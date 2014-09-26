'use strict';

/**
 * Define `simple`.
 */

function simple(problem) {
    var message;

    message = problem.rule + ':';

    message += ' "' + (problem.anchor || problem.deletion) + '"';

    if (problem.addition) {
        message += ' > "' + problem.addition + '"';
    }

    console.log(message);
}

/**
 * Define `description`.
 */

simple.description = 'Simply log warnings and errors';

/**
 * Expose `simple`.
 */

module.exports = simple;
