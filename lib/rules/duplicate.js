'use strict';

var description,
    warning,
    question;

/**
 * Rule description.
 */

description = 'Warn when duplicate words occur';

/**
 * Warning.
 */

warning = 'These words look like duplication';

/**
 * Question.
 */

question = 'Should we remove one?';

/**
 * Define `duplicates`
 *
 * @param {function(problem)} reporter
 * @return {Object} Which types to search for.
 */

function duplicates(report) {
    return {
        'SentenceNode': function (node) {
            var word,
                prev,
                range;

            word = node.head;

            while (word) {
                if (prev && word.type === word.WORD_NODE) {
                    if (
                        prev.toString().toLowerCase() ===
                        word.toString().toLowerCase()
                    ) {
                        range = new word.TextOM.Range();
                        range.setStart(prev.next);
                        range.setEnd(word);

                        report({
                            'deletion': range,
                            'description': warning,
                            'question': question
                        });
                    }
                }

                if (word.type === word.WORD_NODE) {
                    prev = word;
                } else if (word.type === word.PUNCTUATION_NODE) {
                    prev = null;
                }

                word = word.next;
            }
        }
    };
}

duplicates.description = description;

/**
 * Expose `duplicates`.
 */

module.exports = duplicates;
