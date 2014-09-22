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
 */

function Relint() {
}

/**
 * Expose `Relint`.
 */

module.exports = Relint;
