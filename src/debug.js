"use strict";

// ------------------------- //
// ---[[   D E B U G   ]]--- //
// ------------------------- //

/**
 * This is a simple wrapper around the optional dependency "debug".
 * If the dependency is installed, it posts debug messages to the namespace "plugin-please".
 * If not, it does nothing.
 */

try {
    var debug = require("debug")("plugin-please")
}
catch (error) {
    // dependency not installed. 
    debug = function () { }
}

module.exports = debug;