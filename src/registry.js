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
    },

    /**
     * subscribe:
     * Add a listener function to a hook-string.
     * @param {string} hookName 
     * @param {function} hookFn 
     * @param {number} hookPriority 
     */
    subscribe(hookName, hookFn, hookPriority = 100, pluginName = null) {
        hookFn.priority = hookPriority;
        hookFn.pluginName = pluginName;

        if (!registry.hooks[hookName]) {
            registry.hooks[hookName] = [];
        }

        registry.hooks[hookName].push(hookFn);
        return hookName
    },

    unsubscribe(hookName, hookFn) {
        // This prevents errors if hook doesn't exist. But this should never happen.
        if (!registry.hooks[hookName]) return;

        if (registry.hooks[hookName].includes(hookFn))
            registry.hooks[hookName] = registry.hooks[hookName].filter(fn => !(fn === hookFn))
    }
};

module.exports = registry
