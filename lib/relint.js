'use strict';

var Retext,
    ast,
    content,
    pos,
    range,
    visit,
    retext,
    rules,
    reporters;

/**
 * Module dependencies.
 */

Retext = require('retext');
ast = require('retext-ast');
content = require('retext-content');
pos = require('retext-pos');
range = require('retext-range');
visit = require('retext-visit');

/**
 * Base `retext`.
 */

retext = new Retext()
    .use(ast)
    .use(content)
    .use(pos)
    .use(range)
    .use(visit);

/**
 * Rules.
 */

rules = require('./rules');

/**
 * Reporters.
 */

reporters = require('./reporters');

/**
 * Get rules from a map of flags.
 *
 * @param {Object<string, boolean>} flags
 * @return {Object<string, Object>} applicableRules
 */

function getRules(flags, reset) {
    var applicableRules,
        ruleName,
        isApplicable;

    if (!flags) {
        flags = {};
    }

    applicableRules = {};

    for (ruleName in rules) {
        if (ruleName in flags) {
            isApplicable = flags[ruleName];
        } else {
            isApplicable = reset ? false : true;
        }

        if (isApplicable) {
            applicableRules[ruleName] = rules[ruleName];
        }
    }

    return applicableRules;
}

/**
 * Define `Relint`.
 *
 * @param {Object} settings - Options to use.
 * @param {Object} settings.rules - Rules to use.
 * @param {Object} settings.reset - Reset all rules.
 * @param {Object} settings.done - Callback.
 * @param {Function} settings.Reporter - Reporter class to use.
 * @constructor
 */

function Relint(settings, done) {
    if (!settings) {
        settings = {};
    }

    if (typeof settings.reset !== 'boolean') {
        settings.reset = false;
    }

    this.rules = getRules(settings.rules, settings.reset);

    if (settings.Reporter) {
        this.Reporter = settings.Reporter;
    }

    if (settings.done) {
        this.done = settings.done;
    }
}

/**
 * Lint a document.
 *
 * @param {*} value - Value given to retext.
 */

Relint.prototype.lint = function (value) {
    var tree,
        reporter;

    tree = retext.parse(value);
    reporter = new this.Reporter();

    // Apply rules...

    this.done(tree, reporter);
};

/**
 * Invoked when linting is complete.
 *
 * @param {Error} err - An error.
 * @param {Node} node - The linted TextOM document.
 * This should be overwritten.
 */

Relint.prototype.done = function (node, reporter) {
    console.log('done: ' + node);
};

/**
 * Expose `Relint`.
 */

module.exports = Relint;
