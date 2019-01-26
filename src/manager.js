"use strict";
var debug = require("./debug")

// ------------------------------------- //
// ---[[   M A N A G E R   A P I   ]]--- //
// ------------------------------------- //

// Local dependencies
var registry = require("./registry")
var { _Plugin, Plugin } = require("./plugins")
var Hook = require("./hooks")

// nodeJS dependencies
var fs = require("fs");
var path = require("path");

/**
 * managerAPI:
 * This API becomes the main module interface.
 */
var managerAPI = {

    /**
     * PluginManager.plugin:
     * imports plugin from file or function, or recalls from registry.
     * @param {*} source 
     * @param {*} context 
     * @returns {Plugin}
     */
    plugin(source, context) {
        // if we're passed a function, import it directly
        if (typeof source === 'function') {
            let plg = new _Plugin(source, null, context);
            return new Plugin(plg);
        }

        // if we're passed a string, look it up,
        else if (registry.pluginNames.includes(source)) {
            // and  return it
            return new Plugin(registry.getPluginByName(source))
        } else {
            // or import a file
            return managerAPI.import(source, context)
        }
    },

    /**
     * PluginManager.import:
     * Read a file from the disk.
     * @param {*} source Path to file
     * @param {*} context Execution context, passed to plugin code
     * @returns {Plugin}
     */
    import(source, context) {
        var filePath = path.join(registry.directory, source)
        var module = require(filePath)

        // plugin name is file name, unless overwritten inside plugin code
        var name = path.basename(source, ".js")

        let plg = new _Plugin(module, name, context)
        return new Plugin(plg)
    },

    /**
     * PluginManager.importAll:
     * Imports all plugins from working directory, delivering `context` to plugin code.
     * @param {*} context 
     * @param {*} dir
     * @returns {self} 
     */
    importAll(context = null, dir = registry.directory) {
        var files = fs.readdirSync(dir)

        files.forEach(file => managerAPI.import(file, context))

        return this;
    },


    plugins: {
        listActive() {

        },
        listInactive() {

        },
        listAll() {

        }
    },

    /**
     * PluginManager.hook:
     * Use to makr hook with hookName. Args are delivered to plugin code when the hook is run.
     * @param {string} hookName 
     * @param  {...any} args 
     */
    hook(hookName, ...args) {
        var hook;

        // if hook already exists, fetch it
        if (registry.hooks[hookName]) hook = registry.hooks[hookName]
        else {
            // otherwise, create new one and store it
            hook = new Hook(hookName)
            registry.hooks[hookName] = hook;
        }

        // run
        return hook.inParallel(...args);
    },

    /**
     * PluginManager.manageHook:
     * Fetches hook by name. Linguistically suited for administration.
     * @param {string} hookName 
     */
    manageHook(hookName) {
        // either fetch existing hook or create new one
        return registry.hooks[hookName] || new Hook(hookName);

    },

    /**
     * PluginManager.runHook:
     * Fetches hook by name. Linguistically suited for executing hooks.
     * @param {string} hookName 
     */
    runHook(hookName) {
        // runHook and manageHook are identical. The difference is linguistic clarity.
        return this.manageHook(hookName)
    },

    /**
     * PluginManager.reset:
     * Clear registry information
     * @returns {object} PluginManager
     */
    reset() {
        registry.reset()
        return this;
    },

    /**
     * PluginManager.initAll:
     * Initialize all loaded plugins.
     * @param {function} callback
     * @returns {Promise}
     */
    initAll(callback, ...args) {
        // sort by priorities
        registry.plugins.sort(function (a, b) {
            return a.priority > b.priority;
        });

        registry.plugins.forEach(plugin => {
            plugin.init(...args);
            plugin.subscribe();
            plugin.active = true;
        })

        return this;
    }
}


module.exports = managerAPI;



