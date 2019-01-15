"use strict";

// ------------------------------------- //
// ---[[   M A N A G E R   A P I   ]]--- //
// ------------------------------------- //

// Local dependencies
var registry = require("./registry")
var { _Plugin, Plugin } = require("./plugin")
var hooksAPI = require("./hooks")


/**
 * PluginManager:
 * Main module interface.
 */
var managerAPI = {

    /**
     * PluginManager.plugin:
     * imports plugin from file, or recalls from registry.
     * @param {*} source 
     * @param {*} context 
     * @returns {Plugin}
     */
    plugin(source, context) {
        if (pluginNames.includes(source)) {
            // Already loaded module, just return it
            return new Plugin(getPluginByName(source))
        } else {
            var name = path.basename(source),
                module = require(registry.directory + source + '.js')

            // obtain plugin informations and apply some default values
            var plg = new _Plugin(module, name, context)
            return new Plugin(plg)
        }
    },



    /**
     * PluginManager.reset:
     * Clear registry information
     * @returns {object} PluginManager
     */
    reset() {
        registry.hooks = {}
        registry.plugins = []
        registry.pluginNames = []
        return this;
    },

    /**
     * PluginManager.start:
     * Initialize all loaded plugins.
     * @param {function} callback
     * @returns {Promise}
     */
    start(callback) {
        var self = this,
            inits = [];

        // sort by priorities
        plugins.sort(function (a, b) {
            return a.priority > b.priority;
        });

        // register init & hooks
        // hooks are all functions who are not special properties
        // identified by "skipProps" list
        plugins.forEach(function (plg) {
            if (plg.init) {
                inits.push(plg.init);
            }
            for (var prop in plg) {
                if (skipProps.indexOf(prop) === -1 && typeof plg[prop] == 'function') {
                    PluginManager.registerHook(prop, plg[prop]);
                }
            }
        });

        // run all plugin.init() method in series!
        if (inits.length) {
            var promises = []

            try {
                // for each init,
                inits.forEach(init => {
                    // create a new promise (and save to array)
                    promises.push(new Promise(function (resolve, reject) {
                        // and run the init (this will run one at a time, synchronously)
                        return resolve(init());
                    }))
                })
                // If we make it here, call the callback synchronously
                callback()
            }
            catch (error) {
                // If there were any errors, we made it here
                callback(error)
            }

            // Return Promise.all, so that use can call .then for asynchronous callback.
            return Promise.all(promises)
        }
        else {
            // There were no plugins to init, so just move on.
            callback()
            return Promise.resolve()
        }
    }


}



