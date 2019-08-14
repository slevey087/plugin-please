"use strict";
var debug = require("./debug")

// ------------------------------- //
// ---[[   R E G I S T R Y   ]]--- //
// ------------------------------- //

var path = require("path")

debug("Creating registry.")

/**
 * registry:
 * tracks module-wide variables: hooks, plugins, pluginNames, and the path directories
 */
var registry = {

    /**
     * registry.directories:
     * the path to the plugins. Defaults to the './plugins' folder in the current working directory
     */
    directories: [path.join(process.cwd(), "./plugins")],

    /**
     * registry.hooks:
     * Object whose keys are string names of hooks, and whose values
     *  are arrays of functions subscribed to those hooks.
     */
    hooks: {},

    /**
     * registry.plugins:
     * array of plugins.
     */
    plugins: [],

    /**
     * registry.pluginNames:
     * array of plugin names, for quick searching.
     */
    pluginNames: [],

    /**
     * getPluginByName:
     * fetch registered plugin, using identifier 
     * @param {string} name 
     */
    getPluginByName(name) {
        debug("registry: fetching plugin %s", name)
        var list = registry.plugins.filter(plg => (plg.name === name))
        if (list.length == 1) return list[0]
        else return list;
    },

    /**
     * reset:
     * clear registry data.
     */
    reset() {
        debug("registry.reset")
        registry.hooks = {};
        registry.plugins = [];
        registry.pluginNames = [];
    }


};

module.exports = registry
