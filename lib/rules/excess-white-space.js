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
 * Generally accepted whtie space.
 */

var levelMap = {
    'ParagraphNode' : '\n\n',
    'SentenceNode' : ' '
};

/**
 * Define `excessWhiteSpace`
 *
 * @param {function(problem)} reporter
 * @return {Object} Which types to search for.
 */

function excessWhiteSpace(report) {
    return {
        'WhiteSpaceNode' : function (node) {
            var maximumLength,
                suggestion,
                adjacentNode,
                level;

            maximumLength = 2;

            if (node.parent.type === node.SENTENCE_NODE) {
                maximumLength = 1;
            }

            if (node.toString().length > maximumLength) {
                suggestion = new node.TextOM.WhiteSpaceNode();
                adjacentNode = node.prev || node.next;
                level = adjacentNode && adjacentNode.type;

                suggestion.replaceContent(levelMap[level] || ' ');

                report({
                    'deletion' : node,
                    'addition' : suggestion,
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
