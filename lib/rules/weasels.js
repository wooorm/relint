'use strict';

var description,
    words;

/**
 * Module dependencies.
 */

words = require('weasels');

/**
 * Description.
 */

description = 'Warn when weasel words are used';

/**
 * Define `weasels`
 *
 * @param {Reporter} reporter
 * @return {Object} Which types to search for.
 */

function weasels(report) {
    return {
        'WordNode' : function (node) {
            if (words.is(node.toString())) {
                report(node);
            }
        }
    };
}

weasels.description = description;

/**
 * Expose `weasels`.
 */

module.exports = weasels;
