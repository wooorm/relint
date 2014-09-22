'use strict';

var description;

/**
 * Description.
 */

description = 'Rule to warn when weasel words are used.';

/**
 * Define `weasels`
 *
 * @param {Reporter} reporter
 * @return {Object} Which types to search for.
 */

function weasels(reporter) {
    return {
        'WordNode' : function (node) {}
    };
}

weasels.description = description;

/**
 * Expose `weasels`.
 */

module.exports = weasels;
