'use strict';

var description,
    warning,
    fix,
    words;

/**
 * Module dependencies.
 */

words = require('fillers');

/**
 * Rule description.
 */

description = 'Warn when filler words are used';

/**
 * Warning.
 */

warning = 'This might be a filler';

/**
 * Fix.
 */

fix = 'Change it to something else';

/**
 * Define `fillers`
 *
 * @param {function(problem)} reporter
 * @return {Object} Which types to search for.
 */

function fillers(report) {
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

fillers.description = description;

/**
 * Expose `fillers`.
 */

module.exports = fillers;
