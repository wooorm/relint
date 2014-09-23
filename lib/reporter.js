'use strict';

/**
 * Define `Reporter`.
 */

function Reporter() {}

/**
 * Define `onreport` handler.
 */

Reporter.prototype.onreport = function () {};

/**
 * Subclass the given constructor from the context.
 *
 * @param {Function} Constructor - Subclass
 * @this {Function} Superclass
 */

function isImplementedBy(Constructor) {
    var constructorPrototype,
        key;

    if (
        typeof this !== 'function' ||
        typeof this.prototype !== 'object'
    ) {
        throw new Error(
            'TypeError: `' + this + '` is not a valid ' +
            'context for `isImplementedBy`'
        )
    }

    if (typeof Constructor !== 'function') {
        throw new Error(
            'TypeError: `' + Constructor + '` is not a valid ' +
            'argument for `isImplementedBy`'
        )
    }

    constructorPrototype = Constructor.prototype;

    function Prototype() {}

    Prototype.prototype = this.prototype;

    Constructor.prototype = new Prototype();

    for (key in constructorPrototype) {
        Constructor.prototype[key] = constructorPrototype[key];
    }
}

/**
 * Enable subclassing.
 */

Reporter.isImplementedBy = isImplementedBy;

/**
 * Define `description`.
 */

Reporter.description = 'Default, void, reporter';

/**
 * Expose `Reporter`.
 */

module.exports = Reporter;
