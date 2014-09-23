'use strict';

/**
 * Module dependencies.
 */

var Relint,
    reporters,
    rules,
    path,
    fs,
    pack,
    chalk,
    commander,
    table;

Relint = require('..');
reporters = require('../lib/reporters');
rules = require('../lib/rules');
path = require('path');
fs = require('fs');
pack = require('../package');
chalk = require('chalk');
commander = require('commander');
table = require('text-table');

/**
 * Constants.
 */

var defaultReporter;

defaultReporter = 'simple';

/**
 * Shortcuts.
 */

var Command,
    exists,
    readFile,
    writeFile,
    stdout,
    stdin,
    isTTY;

Command = commander.Command;
exists = fs.existsSync || path.existsSync;
readFile = fs.readFileSync;
writeFile = fs.writeFileSync;
stdout = process.stdout;
stdin = process.stdin;
isTTY = stdin.isTTY;

/**
 * Parse rules/flags into an object.
 */

function parseRules() {
    console.log('rule: ', arguments);
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
    console.log('  $ relint in.txt --rule "-buzzwords"');
    console.log();
    console.log('  # turn on only weasels');
    console.log('  $ relint in.txt --reset --rule "weasels"');
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

function oninvalidfile() {
    return fail(
        'An invalid path was given',
        program.file + '\nPlease specify a valid file'
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
        'Please specify an output location with `--ouput`'
    );
}

/**
 * Generated output.
 */

function onwrite() {
    return succeed(
        'Changes were saved',
        program.output
    );
}

function ondone(tree, reporter) {
    if (!program.output) {
        stdout.write(tree.toString());
    } else {
        writeFile(program.output, tree);

        if (isTTY) {
            onwrite();
        }
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
     * Exit when no output location is given.
     */

    if (isTTY && !program.output) {
        return oninvalidoutput();
    }

    /**
     * Resolve a given file.
     */

    if (program.args[0]) {
        onfile(program.args[0]);

        if (!exists(program.file)) {
            return oninvalidfile();
        }
    }

    relint = new Relint({
        'reset' : program.reset,
        'Reporter' : reporters[program.reporter || defaultReporter],
        'done' : ondone
    });


    /**
     * Start linting.
     */

    if (program.file) {
        relint.lint(readFile(program.file, 'utf-8'));
    } else {
        relint.lint = relint.lint.bind(relint);

        stdin.resume();
        stdin.setEncoding('utf8');
        stdin.on('data', relint.lint);
    }
}

/**
 * Expose `execute`.
 */

exports.execute = execute;
