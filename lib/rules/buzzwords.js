'use strict';

var description,
    words;

/**
 * Module dependencies.
 */

words = require('buzzwords');

/**
 * Description.
 */

description = 'Warn when buzzwords are used';

/**
 * Define `buzzwords`
 *
 * @param {Reporter} reporter
 * @return {Object} Which types to search for.
 */

function buzzwords(report) {
    return {
        'WordNode' : function (node) {
            if (words.is(node.toString())) {
                report(node);
            }
        }
    };
}

buzzwords.description = description;

/**
 * Expose `buzzwords`.
 */

module.exports = buzzwords;
