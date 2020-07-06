"use strict";

// ------------------------------------------- //
// ---[[   P L U G I N  -  P L E A S E   ]]--- //
// ------------------------------------------- //

var managerAPI = require("./src/manager");
var registry = require("./src/registry")

var path = require("path")

/**
 * PluginManager:
 * The plugin-please user interface.
 * @param {*} directory 
 * @returns {object} PluginManager
 */
var PluginManager = function (directory) {
    // TODO: verify directory is directory
    if (directory) {
        if (path.isAbsolute(directory)) registry.directories = [directory]
        else registry.directories = [path.join(process.cwd(), directory)]
    }
    return PluginManager
}

// merge in API
Object.assign(PluginManager, managerAPI)

module.exports = PluginManager