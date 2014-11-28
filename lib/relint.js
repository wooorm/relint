'use strict';

var Retext,
    cst,
    content,
    pos,
    walk,
    find,
    range,
    inspect,
    visit,
    retext,
    rules,
    simple;

/**
 * Module dependencies.
 */

Retext = require('retext');
cst = require('retext-cst');
content = require('retext-content');
pos = require('retext-pos');
range = require('retext-range');
walk = require('retext-walk');
find = require('retext-find');
visit = require('retext-visit');
inspect = require('retext-inspect');
simple = require('./reporters/simple');

/**
 * Base `retext`.
 */

retext = new Retext()
    .use(cst)
    .use(find)
    .use(walk)
    .use(content)
    .use(pos)
    .use(range)
    .use(inspect)
    .use(visit);

/**
 * Rules.
 */

rules = require('./rules');

/**
 * Shallow clone.
 */

function clone(object) {
    var result,
        key;

    result = {};

    for (key in object) {
        result[key] = object[key];
    }

    return result;
}

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
    var self,
        report;

    self = this;

    if (!settings) {
        settings = {};
    }

    if (typeof settings.reset !== 'boolean') {
        settings.reset = false;
    }

    self.rules = getRules(settings.rules, settings.reset);

    report = settings.report || simple;

    /**
     * Sync reporter.
     */

    if (report.length < 2) {
        self.report = function (problem, next) {
            report(problem);
            next();
        };
    } else {
        self.report = report;
    }

    if (settings.done) {
        self.done = settings.done;
    }
}

/**
 * Lint a document.
 *
 * @param {*} value - Value given to `retext`.
 */

Relint.prototype.lint = function (value) {
    var self,
        applicableRules,
        report,
        queue;

    self = this;
    applicableRules = self.rules;
    report = self.report;
    queue = [];

    retext.parse(value, function (err, tree) {
        if (err) {
            throw err;
        }

        Object.keys(applicableRules).forEach(function (rule) {
            var types;

            types = applicableRules[rule](function (problem) {
                problem = clone(problem);
                problem.rule = rule;

                queue.push(problem);
            });

            Object.keys(types).forEach(function (type) {
                /**
                 * `visit` searches for descendants, not for itself.
                 */

                if (type === tree.type) {
                    types[type](tree);
                }

                tree.visit(type, types[type]);
            });
        });

        /**
         * Start reporting.
         */

        function next() {
            var problem;

            problem = queue.shift();

            if (problem) {
                report.call(tree, problem, next);
            } else if (self.done) {
                self.done(tree);
            }
        }

        /**
         * Start reporting.
         */

        next();
    });
};

/**
 * Expose `Relint`.
 */

module.exports = Relint;
