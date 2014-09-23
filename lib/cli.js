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
fs = require('path');
pack = require('../package');
chalk = require('chalk');
commander = require('commander');
table = require('text-table');

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
exists = fs.existsSync;
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

program = new Command('relint')
    .version(pack.version)
    .usage('[options] file')
    .option('-o, --output <file>', 'set the output file', null)
    .option('-r, --rule <rules>', 'specify rules', parseRules, {})
    .option('--reset', 'set all default rules to off', false)
    .option('--reporter <name>', 'specify a reporter', false)
    .option('--reporters', 'list available reporters', false)
    .option('--rules', 'list available rules', false);

/**
 * Start the CLI.
 */

function execute(argv) {
    program.parse(argv);
}

/**
 * Expose `execute`.
 */

exports.execute = execute;
