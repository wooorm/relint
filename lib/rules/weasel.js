'use strict';

var description,
    warning,
    fix,
    words;

/**
 * Module dependencies.
 */

words = require('weasels');

/**
 * Rule description.
 */

description = 'Warn when weasel words are used';

/**
 * Warning.
 */

warning = 'This might be a weasel';

/**
 * Fix.
 */

fix = 'Change it to something else';

/**
 * Define `weasels`
 *
 * @param {function(problem)} reporter
 * @return {Object} Which types to search for.
 */

function weasels(report) {
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

weasels.description = description;

/**
 * Expose `weasels`.
 */

module.exports = weasels;
