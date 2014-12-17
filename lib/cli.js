'use strict';

/**
 * Module dependencies.
 */

var path,
    fs,
    chalk,
    commander,
    table,
    Relint,
    reporters,
    rules,
    pack;

path = require('path');
fs = require('fs');
chalk = require('chalk');
commander = require('commander');
table = require('text-table');

Relint = require('..');
reporters = require('../lib/reporters');
rules = require('../lib/rules');
pack = require('../package.json');

/**
 * Constants.
 */

var defaultReporter,
    RULES_DELIMITER,
    RULE_DELIMITER,
    hasApplicableRule;

defaultReporter = 'simple';

RULES_DELIMITER = / *[,;] */g;

RULE_DELIMITER = / *: */g;

hasApplicableRule = false;

/**
 * Shortcuts.
 */

var Command,
    exists,
    readFile,
    writeFile,
    stdout,
    stdin,
    expextPipeIn,
    expextPipeOut;

Command = commander.Command;
exists = fs.existsSync || path.existsSync;
readFile = fs.readFileSync;
writeFile = fs.writeFileSync;
stdout = process.stdout;
stdin = process.stdin;

expextPipeIn = !stdin.isTTY;
expextPipeOut = !stdout.isTTY;

/**
 * Parse rules/flags into an object.
 */

function parseRules(flags, cache) {
    flags.split(RULES_DELIMITER).forEach(function (flag) {
        var option,
            value;

        flag = flag.split(RULE_DELIMITER);

        option = flag[0];
        value = flag[1] !== 'false';

        if (flag[1] === undefined && option.charAt(0) === '-') {
            option = option.substr(1);
            value = false;
        }

        cache[option] = value;

        if (value) {
            hasApplicableRule = true;
        }
    });

    return cache;
}

/**
 * Command.
 */

var program;

program = new Command(pack.name)
    .version(pack.version)
    .usage('[options] file')
    .option('-o, --output <file>', 'set the output file', null)
    .option('-r, --rule <rules>', 'specify rules', parseRules, {})
    .option('--reset', 'set all default rules to off', false)
    .option('--reporter <name>', 'specify a reporter', false)
    .option('--reporters', 'list available reporters', false)
    .option('--rules', 'list available rules', false);

/**
 * Help.
 */

program.on('--help', function () {
    console.log('  Usage:');
    console.log();
    console.log('  # print grammar warnings');
    console.log('  $ relint in.txt');
    console.log();
    console.log('  # turn off buzzwords');
    console.log('  $ relint in.txt --rule "-buzzword"');
    console.log();
    console.log('  # turn on only weasels');
    console.log('  $ relint in.txt --reset --rule weasel');
    console.log();
    console.log('  # fix grammar in in.txt');
    console.log('  $ relint in.txt > out.txt');
    console.log();
    console.log('  # fix grammar from stdin and output to out.txt');
    console.log('  $ relint < in.txt > out.txt');
    console.log();
    console.log('  # fix grammar from stdin and write to stdout');
    console.log('  $ echo "Well, that’s, like, cool." | relint | cat');
    console.log('  # That’s cool.');
    console.log();
});

/**
 * Write a pretty title/message.
 */

function write(title, message, color) {
    if (color) {
        console.log(chalk[color](title) + ':');
    } else {
        console.log(title + ':');
    }

    console.log('  ' + message.split(/\n/).join('\n  ') + '.');
}

/**
 * A generic fail method.
 */

function fail(title, message) {
    write(title, message, 'red');

    return 1;
}

/**
 * A generic success method.
 */

function succeed(title, message) {
    write(title, message, 'green');

    return 0;
}

/**
 * Utilities for listen reporters/rules.
 */

function sort(a, b) {
    return a[0].toLowerCase().charCodeAt(0) -
        b[0].toLowerCase().charCodeAt(0);
}

function outputTable(header, data) {
    console.log(chalk.white(header) + ':');
    console.log(table(
        Object.keys(data)
        .sort(sort)
        .map(function (key) {
            return [
                chalk.yellow(key),
                data[key].description || ''
            ];
        })
    ));
    console.log();
}

/**
 * Reporters.
 */

function onreporters() {
    outputTable('Reporters', reporters);

    return 0;
}

/**
 * Rules.
 */

function onrules() {
    outputTable('Rules', rules);

    return 0;
}

/**
 * Multiple files.
 */

function onmultiplefiles() {
    return fail(
        'Multiple input files were given',
        'Please specify one file'
    );
}

/**
 * A file.
 */

function onfile(file) {
    program.file = path.resolve(file);
}

/**
 * An invalid file.
 */

function oninvalidinput() {
    return fail(
        'An invalid path was given',
        program.file + '\n' +
        'Please specify a valid file or pipe from stdin'
    );
}

/**
 * An invalid file.
 */

function oninvalidreporter() {
    return fail(
        'An unknown reporter was specified',
        'Unknown reporter: ' + program.reporter + '.\n' +
        'Use `$ relint --reporters` to list all available reporters'
    );
}

/**
 * An invalid file.
 */

function oninvalidoutput() {
    return fail(
        'No output location was specified',
        'Please specify an output location with ' +
        '`--ouput` or pipe to stdout'
    );
}

/**
 * Invalid rules.
 */

function onnorules() {
    return fail(
        'No rules were given',
        'When using `--reset`, you should specify rules to use.\n' +
        'See `--help` for more information'
    );
}

/**
 * Invalid rules.
 */

function oninvalidrules() {
    return fail(
        'No valid rules were given',
        'See `--rules` for a list of valid rules'
    );
}

/**
 * Generated output.
 */

function onwrite() {
    return succeed(
        'Changes were saved',
        path.resolve(program.output)
    );
}

function ondone(tree) {
    if (program.output) {
        writeFile(program.output, tree);
        onwrite();
    } else {
        stdout.write(tree.toString());
    }
}

/**
 * Start the CLI.
 */

function execute(argv) {
    var relint;

    program.parse(argv);

    if (program.rules) {
        return onrules();
    }

    if (program.reporters) {
        return onreporters();
    }

    /**
     * Exit on multiple inputs.
     */

    if (program.args.length > 1) {
        return onmultiplefiles();
    }

    /**
     * Exit when an invalid reporter is given.
     */

    if (program.reporter && !reporters[program.reporter]) {
        return oninvalidreporter();
    }

    /**
     * Exit when no applicable rules are given.
     */

    if (program.reset && !hasApplicableRule) {
        return onnorules();
    }

    /**
     * Exit when no output location is given.
     */

    if (!expextPipeOut && !program.output) {
        return oninvalidoutput();
    }

    /**
     * Resolve a given file.
     */

    if (program.args[0]) {
        onfile(program.args[0]);

        /**
         * Exit on invalid input.
         */

        if (!exists(program.file)) {
            return oninvalidinput();
        }
    } else if (!expextPipeIn) {
        return oninvalidinput();
    }

    /**
     * Construct `relint`.
     */

    relint = new Relint({
        'reset': program.reset,
        'rules': program.rule,
        'report': reporters[program.reporter || defaultReporter],
        'done': ondone
    });

    if (!Object.keys(relint.rules).length) {
        return oninvalidrules();
    }

    /**
     * Lint.
     */

    if (program.file) {
        relint.lint(readFile(program.file, 'utf-8'));
    } else {
        relint.lint = relint.lint.bind(relint);

        stdin.resume();
        stdin.setEncoding('utf8');
        stdin.on('data', function () {});
    }
}

/**
 * Expose `execute`.
 */

exports.execute = execute;
