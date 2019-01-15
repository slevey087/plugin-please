"use strict";

// ------------------------------------------- //
// ---[[   P L U G I N  -  P L E A S E   ]]--- //
// ------------------------------------------- //

var managerAPI = require("./src/manager");
var hooksAPI = require("./src/hooks");

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

// merge in APIs
Object.assign(PluginManager, managerAPI, hooksAPI)

module.exports = PluginManager