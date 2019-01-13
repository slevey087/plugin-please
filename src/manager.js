"use strict";

// --------------------------------------------------- //
// ---[[   P L U G I N   M A N A G E R   A P I   ]]--- //
// --------------------------------------------------- //

// Local dependencies
var registry = require("./registry")
var { _Package, Package } = require("./package")


/**
 * PluginManager:
 * Main module interface.
 */
var PluginManager = {

    /**
     * 
     * @param {*} source 
     * @param {*} context 
     */
    package(source, context) {
        if (packageNames.includes(source)) {
            // Already loaded module, just return it
            return new Package(getPackageByName(source))
        } else {
            var name = path.basename(source),
                module = require(pluginDirectoryPath + source + '.js')

            // obtain package informations and apply some default values
            var pkg = new _Package(module, name, context)
            return new Package(pkg)
        }
    },

    /**
     * PluginManager.isEmpty
     * returns false if a hook has subscribers, true otherwise
     * @param {string} hookName 
     * @returns {boolean}
     */
    isEmpty(hookName) {
        if (registry.hooks[hookName] && registry.hooks[hookName].length) {
            return false;
        } else {
            return true;
        }
    },

    /**
     * PluginManager.reset:
     * Clear registry information
     * @returns {object} PluginManager
     */
    reset() {
        registry.hooks = {}
        registry.packages = []
        registry.packageNames = []
        return this;
    },

    /**
     * PluginManager.start:
     * Initialize all loaded packages.
     * @param {function} callback
     * @returns {Promise}
     */
    start(callback) {
        var self = this,
            inits = [];

        // sort by priorities
        packages.sort(function (a, b) {
            return a.priority > b.priority;
        });

        // register init & hooks
        // hooks are all functions who are not special properties
        // identified by "skipProps" list
        packages.forEach(function (pkg) {
            if (pkg.init) {
                inits.push(pkg.init);
            }
            for (var prop in pkg) {
                if (skipProps.indexOf(prop) === -1 && typeof pkg[prop] == 'function') {
                    PluginManager.registerHook(prop, pkg[prop]);
                }
            }
        });

        // run all package.init() method in series!
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

var loader = function (directory) {
    registry.directory = directory
    return loader
}

Object.assign(loader, PluginManager)

module.exports = loader

