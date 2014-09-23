'use strict';

var title,
    description;

/**
 * Title.
 */

title = 'Weasel';

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
        'WordNode' : function (node) {
            console.log('weasel?', ['' + node]);
        }
    };
}

weasels.title = title;
weasels.description = description;

/**
 * Expose `weasels`.
 */

module.exports = weasels;
