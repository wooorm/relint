'use strict';

var Reporter;

/**
 * Module dependencies.
 */

Reporter = require('../reporter'); // Doesnt yet exist.

/**
 * Define `SimpleReporter`.
 */

function SimpleReporter() {
    Reporter.apply(this, arguments);
}

/**
 * Define `onreport` handler.
 */

SimpleReporter.prototype.onreport = function (report) {
    var message;

    message = report.title + ': "' + report.deletion + '"';

    if (report.addition) {
        message += ' > "' + report.addition + '"';
    }

    /* This is not a debug message. */
    console.log(message);
};

/**
 * Inherit from `Reporter`.
 */

Reporter.isImplementedBy(SimpleReporter);

/**
 * Define `description`.
 */

SimpleReporter.description =
    'Simply log warnings and errors (node and client)';

/**
 * Expose `SimpleReporter`.
 */

module.exports = SimpleReporter;
