'use strict';

/**
 * Define `simple`.
 */

function simple(problem) {
    var message;

    message = problem.title + ': "' + problem.node + '"';

    if (problem.addition) {
        message += ' > "' + problem.addition + '"';
    }

    /* This is not a debug message. */
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
