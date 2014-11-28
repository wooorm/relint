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
    'ParagraphNode': '\n',
    'SentenceNode': ' '
};

/**
 * Define `excessWhiteSpace`
 *
 * @param {function(problem)} report
 * @return {Object} Which types to search for.
 */

function excessWhiteSpace(report) {
    return {
        'WhiteSpaceNode': function (node) {
            var maximumLength,
                suggestion,
                adjacentNode,
                level;

            if (
                node.parent.type === node.SENTENCE_NODE ||
                (
                    node.parent.type === node.ROOT_NODE &&
                    node === node.parent.tail
                )
            ) {
                maximumLength = 1;
            } else {
                maximumLength = 2;
            }

            if (node.toString().length > maximumLength) {
                suggestion = new node.TextOM.WhiteSpaceNode();
                adjacentNode = node.prev || node.next;
                level = adjacentNode && adjacentNode.type;

                suggestion.fromString(
                    Array(maximumLength + 1).join(levelMap[level] || ' ')
                );

                report({
                    'addition': suggestion,
                    'deletion': node,
                    'description': warning,
                    'question': question
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
