'use strict';

var description,
    warning,
    fix,
    words;

/**
 * Module dependencies.
 */

words = require('hedges');

/**
 * Rule description.
 */

description = 'Warn when hedge words are used';

/**
 * Warning.
 */

warning = 'This might be a hedge';

/**
 * Fix.
 */

fix = 'Change it to something else';

/**
 * Define `buzzwords`
 *
 * @param {function(problem)} reporter
 * @return {Object} Which types to search for.
 */

function hedges(report) {
    return {
        'WordNode': function (node) {
            if (words.is(node.toString())) {
                report({
                    'anchor': node,
                    'description': warning,
                    'fix': fix
                });
            }
        }
    };
}

hedges.description = description;

/**
 * Expose `hedges`.
 */

module.exports = hedges;
