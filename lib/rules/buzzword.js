'use strict';

var description,
    warning,
    fix,
    words;

/**
 * Module dependencies.
 */

words = require('buzzwords');

/**
 * Rule description.
 */

description = 'Warn when buzzwords are used';

/**
 * Warning.
 */

warning = 'This might be a buzzword';

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

function buzzwords(report) {
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

buzzwords.description = description;

/**
 * Expose `buzzwords`.
 */

module.exports = buzzwords;
