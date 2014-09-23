'use strict';

var Retext,
    ast,
    content,
    pos,
    range,
    visit,
    retext,
    rules,
    SimpleReporter;

/**
 * Module dependencies.
 */

Retext = require('retext');
ast = require('retext-ast');
content = require('retext-content');
pos = require('retext-pos');
range = require('retext-range');
visit = require('retext-visit');
SimpleReporter = require('./reporters/simple');

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
 * @param {Object?} settings - Options to use.
 * @param {Object?} settings.rules - Rules to use.
 * @param {Object?} settings.reset - Reset all rules.
 * @param {Function?} settings.done - Callback.
 * @param {Function?} settings.Reporter - Reporter class to use.
 * @constructor
 */

function Relint(settings) {
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
    var self,
        tree,
        reporter,
        rule,
        rules,
        type,
        types;

    self = this;

    tree = retext.parse(value);
    reporter = new self.Reporter(tree, retext);

    reporter.done = function () {
        self.done(tree, reporter);
    }

    rules = self.rules;

    for (rule in rules) {
        types = rules[rule](reporter);

        for (type in types) {
            if (type === tree.type) {
                types[type](tree)
            }

            tree.visitType(type, types[type]);
        }
    }

    // reporter.didRegisterAll();

    // Apply rules...

    self.done(tree, reporter);
};

/**
 * Default reporter.
 */

Relint.prototype.Reporter = SimpleReporter;


/**
 * Invoked when linting is complete.
 *
 * @param {Error} err - An error.
 * @param {Node} node - The linted TextOM document.
 * This should be overwritten.
 */

Relint.prototype.done = function () {};

/**
 * Expose `Relint`.
 */

module.exports = Relint;
