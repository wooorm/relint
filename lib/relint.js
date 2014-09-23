'use strict';

var Retext,
    ast,
    content,
    pos,
    range,
    visit,
    retext,
    rules,
    simple;

/**
 * Module dependencies.
 */

Retext = require('retext');
ast = require('retext-ast');
content = require('retext-content');
pos = require('retext-pos');
range = require('retext-range');
visit = require('retext-visit');
simple = require('./reporters/simple');

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
 * @param {Function?} settings.report - Invoked with problems.
 * @constructor
 */

function Relint(settings) {
    var report;

    if (!settings) {
        settings = {};
    }

    if (typeof settings.reset !== 'boolean') {
        settings.reset = false;
    }

    this.rules = getRules(settings.rules, settings.reset);

    report = settings.report || simple;

    /**
     * Sync reporter.
     */

    if (report.length < 2) {
        this.report = function (problem, next) {
            report(problem);
            next();
        };
    } else {
        this.report = report;
    }

    if (settings.done) {
        this.done = settings.done;
    }
}

/**
 * Lint a document.
 *
 * @param {*} value - Value given to `retext`.
 */

Relint.prototype.lint = function (value) {
    var self,
        tree,
        rules,
        report,
        queue;

    self = this;
    tree = retext.parse(value);
    rules = self.rules;
    report = self.report;
    queue = [];

    Object.keys(rules).forEach(function (rule) {
        var types;

        types = rules[rule](function (node) {
            queue.push({
                'node' : node,
                'title' : rule,
                'rule' : rules[rule]
            });
        });

        Object.keys(types).forEach(function (type) {
            /**
             * `visit` searches for descendants, not for itself.
             */

            if (type === tree.type) {
                types[type](tree);
            }

            tree.visitType(type, types[type]);
        });
    });

    /**
     * Start reporting.
     */

    function next() {
        var problem;

        problem = queue.shift();

        if (problem) {
            report(problem, next);
        } else if (self.done) {
            self.done(tree);
        }
    }

    /**
     * Start reporting.
     */

    next();
};

/**
 * Expose `Relint`.
 */

module.exports = Relint;
