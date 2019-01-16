"use strict";

// ------------------------------------------- //
// ---[[   P L U G I N  -  P L E A S E   ]]--- //
// ------------------------------------------- //

var managerAPI = require("./src/manager");


/**
 * PluginManager:
 * The plugin-please user interface.
 * @param {*} directory 
 * @returns {object} PluginManager
 */
var PluginManager = function (directory) {
    // TODO: verify directory is directory
    if (directory) registry.directory = directory
    return PluginManager
}

// merge in API
Object.assign(PluginManager, managerAPI)

module.exports = PluginManager