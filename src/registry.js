"use strict";

// ------------------------------- //
// ---[[   R E G I S T R Y   ]]--- //
// ------------------------------- //


/**
 * registry:
 * tracks module-wide variables: hooks, plugins, pluginNames, and the directory
 */
var registry = {

    /**
     * registry.directory:
     * the path to the plugins
     */
    directory: process.cwd(),

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
        var list = registry.plugins.filter(plg => (plg.name === name))
        if (list.length == 1) return list[0]
        else return list;
    },

    /**
     * reset:
     * clear registry data.
     */
    reset() {
        registry.hooks = {};
        registry.plugins = [];
        registry.pluginNames = [];
    }


};

module.exports = registry
