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
 * Define `Relint`.
 *
 * @param {Object} settings - Options to use.
 * @param {Object} settings.rules - Rules to use.
 * @param {Function} settings.Reporter - Reporter class to use.
 * @constructor
 */

function Relint(settings, done) {
    if (!settings) {
        settings = {};
    }

    if (settings.rules) {
        this.rules = settings.rules;
    }

    if (settings.Reporter) {
        this.Reporter = settings.Reporter;
    }

    if (done) {
        this.done = done;
    }
}

/**
 * Lint a document.
 *
 * @param {*} value - Value given to retext.
 */

Relint.prototype.lint = function (value) {
    retext.parse(value, this.done.bind(this));
};

/**
 * Invoked when linting is complete.
 *
 * @param {Error} err - An error.
 * @param {Node} node - The linted TextOM document.
 * This should be overwritten.
 */

Relint.prototype.done = function (err, node) {
    if (err) {
        throw err;
    }

    console.log('done: ' + node);
};

/**
 * Expose `Relint`.
 */

module.exports = Relint;
