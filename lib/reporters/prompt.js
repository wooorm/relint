'use strict';

/**
 * Dependencies.
 */

var util,
    chalk,
    yn,
    prompt,
    stdout;

util = require('../util.js');
chalk = require('chalk');
yn = require('yn');
prompt = require('prompt');
stdout = process.stdout;

/**
 * Exit early when not operating in a TTY.
 */

if (!stdout.isTTY) {
    stdout.write(chalk.red(
        'The prompt reporter only works with a TTY'
    ));

    process.exit();
}

/**
 * Constants.
 */

var HORIZONTAL_BAR,
    LINE_LENGTH;

HORIZONTAL_BAR = '─';
LINE_LENGTH = stdout.columns;

/**
 * Prompt.
 */

prompt.colors = false;
prompt.start();
prompt.pause();

prompt.message = '';
prompt.delimiter = '';

/**
 * Prompt messages.
 */

var PROMPT_ADD,
    PROMPT_DELETE,
    PROMPT_REPLACE;

PROMPT_ADD = 'On confirmation, the new value will be ' +
    'added';

PROMPT_DELETE = 'On confirmation, the current value ' +
    'will be removed';

PROMPT_REPLACE = 'On confirmation, the current value ' +
    'will be replaced with the new value';

/**
 * Silence errors.
 *
 * The `readline` module used by `read.js`, in turn by
 * `prompt`, seems to throw on the tenth read. This
 * fixes it. Pretty brutal, but it works.
 */

require('events').EventEmitter.defaultMaxListeners = 0;

/**
 * Semantic colour functions.
 */

function strong(value) {
    return chalk.white(value);
}

function notification(value) {
    return chalk.yellow(value);
}

function notificationSuccess(value) {
    return chalk.green(value);
}

function notificationError(value) {
    return chalk.red(value);
}

function highlight(value) {
    return chalk.bgYellow(strong(value));
}

function highlightError(value) {
    return chalk.bgRed(strong(value));
}

function highlightSuggestion(value) {
    return chalk.bgGreen(strong(value));
}

/**
 * Pad a `value` with `times` `character`s.
 *
 * @param {string} value
 * @param {string} character
 * @param {number} times
 * @return {string}
 */

function padRight(value, character, times) {
    if (times <= 0) {
        return value;
    }

    return value + Array(times + 1).join(character);
}

/**
 * Wrap a `value` into a nicely enclosed ASCII-art box.
 *
 * @param {string} value
 * @return {string}
 */

function wrap(value) {
    var line;

    line = padRight('', HORIZONTAL_BAR, LINE_LENGTH);

    return [
        line,
        value,
        line,
        ''
    ].join('\n');
}

/**
 * Visualize a problem.
 *
 * @param {Object} problem
 * @param {TextOMNode} tree
 * @return {string}
 */

function visualize(problem, tree) {
    var anchor,
        start,
        end,
        TextOM,
        emphasis,
        deletion,
        addition,
        before,
        after;

    anchor = problem.deletion || problem.anchor;

    if ('type' in anchor) {
        start = anchor;
        end = anchor;
    } else {
        start = anchor.startContainer;
        end = anchor.endContainer;
    }

    if (end.next) {
        end = end.next;
    }

    TextOM = start.TextOM;

    before = new TextOM.Range();

    before.setStart(util.getPreviousLineBreak(start) || tree.head);
    before.setEnd(start, 0);

    before = before.toString();

    after = new TextOM.Range();

    after.setStart(end);
    after.setEnd(util.getNextLineBreak(end) || tree.tail);

    after = after.toString();

    if (problem.deletion) {
        deletion = highlightError(problem.deletion);
    } else {
        deletion = '';
    }

    if (problem.addition) {
        addition = highlightSuggestion(problem.addition);
    } else {
        addition = '';
    }

    if (problem.anchor) {
        emphasis = highlight(problem.anchor);
    } else {
        emphasis = '';
    }

    return 'Warning: ' + strong(problem.rule) + '\n' +
        wrap((before + emphasis + deletion + addition + after).trim());
}

/**
 * Format a prompt message.
 *
 * @param {Object} problem
 * @return {string}
 */

function formatPromptDescription(problem) {
    var message;

    if (!problem.deletion) {
        message = PROMPT_ADD;
    } else if (!problem.addition) {
        message = PROMPT_DELETE;
    } else {
        message = PROMPT_REPLACE;
    }

    return problem.description + '.\n' +
        notification(message) + '.\n' +
        'y/n';
}

/**
 * Fix a `problem`.
 *
 * @param {Object} problem
 */

function fix(problem) {
    var isAdditionNode,
        isDeletionNode;

    isAdditionNode = problem.addition && 'type' in problem.addition;
    isDeletionNode = problem.deletion && 'type' in problem.deletion;

    if (problem.addition) {
        if (problem.deletion) {
            if (isAdditionNode && isDeletionNode) {
                problem.deletion.replace(problem.addition);
            } else {
                throw new Error(
                    'Reached not-implemented ' +
                    'functionality: replace deletion range ' +
                    'with addition range'
                );
            }
        } else {
            throw new Error(
                'Reached not-implemented ' +
                'functionality: add addition ' +
                'after anchor'
            );
        }
    } else if (problem.deletion) {
        if (isDeletionNode) {
            problem.deletion.remove();
        } else {
            problem.deletion.removeContent();
        }
    } else {
        throw new Error(
            'Reached not-implemented ' +
            'functionality: a warning for anchor'
        );
    }
}

/**
 * Check if a user's response to `prompt` is
 * conforming to a yes/no answer.
 *
 * @param {string} value
 * @return {boolean}
 */

function conforms(value) {
    return yn(chalk.stripColor(value)) !== null;
}

/**
 * Factory for on-confirmation, bound with `problem`
 * and `next`.
 *
 * @param {Object} problem
 * @return {Function} next
 */

function onreceiveFactory(problem, next) {
   /**
    * Callback when a user entered a conforming
    * confirmation or cancelation.
    *
    * @param {Error?} exception
    * @return {string} result
    */

    return function (exception, result) {
        if (exception) {
            if (/canceled/i.test(exception.message)) {
                stdout.write(
                    notificationError('You\'ve canceled Relint') +
                    '. Nothing was written.\n'
                );

                process.exit();
            }

            problem.oncancelation(exception);
        }

        if (yn(chalk.stripColor(result.question))) {
            fix(problem);

            stdout.write(notificationSuccess('Done!'));
        } else {
            stdout.write(notification('Canceled...'));
        }

        stdout.write('\n\n');

        prompt.pause();

        next();
    };
}

/**
 * A method used to report a `problem`.
 * When done, invokes `next`.
 *
 * @param {Object} problem
 * @param {Function} next
 */

function report(problem, next) {
    stdout.write(visualize(problem, this));

    if (!problem.addition && !problem.deletion) {
        stdout.write(
            problem.description + ', ' +
            notification('and we can\'t do anything about it') +
            '.\n'
        );

        stdout.write('\n');

        next();
    } else {
        prompt.resume();

        prompt.get([{
            'description': formatPromptDescription(problem),
            'message': 'Please provide either yes, y, no, or n',
            'default': notificationSuccess('yes'),
            'conform': conforms
        }], onreceiveFactory(problem, next));
    }
}

/**
 * Define `description`.
 */

report.description = 'Prompts you to fix things';

module.exports = report;
