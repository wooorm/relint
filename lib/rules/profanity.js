'use strict';

var description,
    warning,
    fix,
    words;

/**
 * Module dependencies.
 */

words = require('profanities');

/**
 * Rule description.
 */

description = 'Warn when profane words are used';

/**
 * Warning.
 */

warning = 'This might be a profanity';

/**
 * Fix.
 */

fix = 'Change it to something else';

/**
 * Define `profanities`
 *
 * @param {function(problem)} reporter
 * @return {Object} Which types to search for.
 */

function profanities(report) {
    return {
        'WordNode': function (node) {
            if (words.is(node.toString().toLowerCase())) {
                report({
                    'anchor': node,
                    'description': warning,
                    'fix': fix
                });
            }
        }
    };
}

profanities.description = description;

/**
 * Expose `profanities`.
 */

module.exports = profanities;
