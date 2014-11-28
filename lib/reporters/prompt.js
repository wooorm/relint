'use strict';

/**
 * Dependencies.
 */

var chalk,
    stringLength,
    yn,
    prompt;

chalk = require('chalk');
stringLength = require('string-length');
yn = require('yn');
prompt = require('prompt');

/**
 * Constants
 */

var VERTICAL_BAR,
    HORIZONTAL_BAR,
    LINE_LENGTH;

VERTICAL_BAR = '|'; // ASCII code 124
HORIZONTAL_BAR = '_'; // Underscore
LINE_LENGTH = 78;

if (!process.stdout.isTTY) {
    process.stdout.write(chalk.red(
        'The prompt reporter only works with a TTY'
    ));

    process.exit();
}

prompt.colors = false;
prompt.start();
prompt.pause();

prompt.message = 'Fix';
prompt.delimiter = ': ';

// The readline module used by read.js, in turn by prompt, seems
// to throw on the tenth read. This fixes it. Pretty brutal, but it
// works.
require('events').EventEmitter.defaultMaxListeners = 0;

function highlight(value) {
    return chalk.bgYellow.white(value);
}

function highlightError(error) {
    return chalk.bgRed.white(error);
}

function highlightSuggestion(suggestion) {
    return chalk.bgGreen.white(suggestion);
}

function getLineBreak(start, direction) {
    var fn = direction === 'prev' ? 'walkBackwards' : 'walkForwards',
        lineBreak = false;

    start[fn](start.WHITE_SPACE_NODE, function (node) {
        if (/[\n\r]/.test(node)) {
            lineBreak = node;

            return false;
        }
    });

    return lineBreak;
}

function getPreviousLineBreak(node) {
    return getLineBreak(node, 'prev');
}

function getNextLineBreak(node) {
    return getLineBreak(node, 'next');
}

var pattern = /((?:\u001b\[(?:[0-9]{1,3}(?:;[0-9]{1,3})*)?[m|K]+)+[\s\S]|[\s\S](?:\u001b\[(?:[0-9]{1,3}(?:;[0-9]{1,3})*)?[m|K]+)+|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\s\S]){77}|[\s\S]+(\n|$)/g;

function breakLines(value) {
    var lines = [],
        match,
        initialMatch;

    match = pattern.exec(value);

    while (match) {
        initialMatch = match[0];

        lines.push(initialMatch);

        match = pattern.exec(value);
    }

    return lines;
}

function padRight(value, character, times) {
    if (times <= 0) {
        return value;
    }

    return value + Array(times + 1).join(character);
}

function padLines(lines) {
    return lines.map(function (line) {
        return padRight(line, ' ', LINE_LENGTH - 1 - stringLength(line));
    });
}

function wrap(value) {
    var brokenText = padLines(breakLines(value));

    return padRight('', HORIZONTAL_BAR, LINE_LENGTH) + '\n' +
        VERTICAL_BAR + brokenText.join(
            VERTICAL_BAR + '\n' + VERTICAL_BAR
        ) + VERTICAL_BAR + '\n' +
        padRight('', HORIZONTAL_BAR, LINE_LENGTH) + '\n';
}

function visualize(problem, tree) {
    var anchor,
        start,
        end,
        TextOM,
        emphasis,
        deletion,
        addition,
        before,
        after,
        range;

    anchor = problem.deletion || problem.anchor;

    start = 'type' in anchor ? anchor : anchor.startContainer;
    end = 'type' in anchor ? anchor : anchor.endContainer;

    if (end.next) {
        end = end.next;
    }

    TextOM = start.TextOM;
    emphasis = deletion = addition = '';

    range = new TextOM.Range();
    range.setStart(getPreviousLineBreak(start) || tree.head);
    range.setEnd(start, 0);
    before = range.toString();

    range = new TextOM.Range();
    range.setStart(end);
    range.setEnd(getNextLineBreak(end) || tree.tail);
    after = range.toString();

    if (problem.deletion) {
        deletion = highlightError(problem.deletion);
    }

    if (problem.addition) {
        addition = highlightSuggestion(problem.addition);
    }

    if (problem.anchor) {
        emphasis = highlight(problem.anchor);
    }

    return wrap((before + emphasis + deletion + addition + after).trim());
}

function formatHeader(problem, tree) {
    return 'Warning: ' + chalk.white(problem.rule) + '\n' +
        visualize(problem, tree);
}

function formatPromptDescription(problem) {
    var values = [chalk.white(problem.description)];

    if (!problem.deletion) {
        values.push('On confirmation, the new value will be added');
    } else if (!problem.addition) {
        values.push('On confirmation, the current value will be removed');
    } else {
        values.push(
            'On confirmation, the current value will be replaced ' +
            'with the new value'
        );
    }

    values.push('y/n');

    return values.join('\n');
}

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
                console.log('range: replace deletion with addition');
            }
        } else {
            console.log('add addition after anchor');
        }
    } else if (problem.deletion) {
        if (isDeletionNode) {
            problem.deletion.remove();
        } else {
            console.log('range: remove deletion');
        }
    } else {
        console.log('just a warning for anchor');
    }
}

function report(problem, next) {
    var self;

    self = this;

    if (!(problem.addition || problem.deletion)) {
        process.stdout.write(formatHeader(problem, self));

        process.stdout.write(
            chalk.white(problem.description) + '.\n' +
            chalk.yellow('We\'re not sure how to fix it') +
            '. When Relint is finished, you can fix the\nproblem' +
            '. If you think an algorithm could fix this, please tell us' +
            ' all about\nit in an issue on GitHub:' +
            '\n  https://github.com/wooorm/relint' +
            '\n\n'
        );

        next();

        return;
    }

    prompt.resume();

    process.stdout.write(formatHeader(problem, self));

    prompt.get([{
        'description': formatPromptDescription(problem) + '.',
        'message': 'Please provide either yes, y, no, or n',
        'default': chalk.green('yes'),
        'conform': function (value) {
            return yn(chalk.stripColor(value)) !== null;
        }
    }], function (error, result) {
        if (error) {
            if (/canceled/i.test(error.message)) {
                process.stdout.write(
                    chalk.red('You\'ve canceled Relint') +
                    '. Nothing was written.\n'
                );

                process.exit();
            }

            problem.oncancelation(error);
        }

        if (yn(chalk.stripColor(result.question))) {
            fix(problem);

            process.stdout.write(chalk.green(
                'Done!\n\n'
            ));
        } else {
            process.stdout.write(chalk.yellow(
                'Canceled...\n\n'
            ));
        }

        prompt.pause();

        // Clear screen:
        // process.stdout.write('\u001B[2J\u001B[0;0f');

        next();
    });

    // process.stdout.write(formatHeader(problem, self));

    // self.next();
}

module.exports = report;
