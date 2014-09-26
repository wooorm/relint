'use strict';

var description,
    warning,
    question;

/**
 * Rule description.
 */

description = 'Warn when excess white space is used';

/**
 * Warning.
 */

warning = 'This might be more white space than needed';

/**
 * Fix.
 */

question = 'Should it be replaced?';

/**
 * Define `excessWhiteSpace`
 *
 * @param {function(problem)} reporter
 * @return {Object} Which types to search for.
 */

function excessWhiteSpace(report) {
    return {
        'WhiteSpaceNode' : function (node) {
            var maximumLength;

            maximumLength = 2;

            if (node.parent.type === node.SENTENCE_NODE) {
                maximumLength = 1;
            }

            if (node.toString().length > maximumLength) {
                report({
                    'anchor' : node,
                    'description' : warning,
                    'question' : question
                });
            }
        }
    };
}

excessWhiteSpace.description = description;

/**
 * Expose `excessWhiteSpace`.
 */

module.exports = excessWhiteSpace;
