'use strict';

var Relint,
    assert;

/**
 * Module dependencies.
 */

Relint = require('..');
assert = require('assert');

/**
 * Tests.
 */

describe('Relint()', function () {
    it('should be a `function`', function () {
        assert(typeof Relint === 'function');
    });

    it('should return an instance of `Retext`', function () {
        assert(new Relint() instanceof Relint);
    });
});
