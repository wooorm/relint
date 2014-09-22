'use strict';

var description;

/**
 * Description.
 */

description = 'Rule to warn when buzzwords are used.';

/**
 * Define `buzzwords`
 *
 * @param {Reporter} reporter
 * @return {Object} Which types to search for.
 */

function buzzwords(reporter) {
    return {
        'WordNode' : function (node) {}
    };
}

buzzwords.description = description;

/**
 * Expose `buzzwords`.
 */

module.exports = buzzwords;
