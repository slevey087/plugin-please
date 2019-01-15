"use strict";

// --------------------------------------- //
// ---[[   P A C K A G E S   A P I   ]]--- //
// --------------------------------------- //

var registry = require("./registry");

// Properites to ignore when subscribing to hooks.
var skipProps = [
    'module',
    'name',
    'priority',
    'active',
    'init',
    'require',
    'stop',
    'public',
    'publicIfActive',
    'settings'
]

/**
 * Backend class for plugins.
 * 
 */
class _Plugin {

    /**
     * Create new backend plugin class.
     * Supply a module, which returns an object of plugin properties/methods.
     * 
     * @param {function} module 
     * @param {string} name 
     * @param {*} context 
     */
    constructor(module, name = null, context = null) {
        // Basic assignment and default values
        Object.assign(this, {
            module,
            name,
            priority: 100,
            active: false,
            init: function () { },
            require: function () { },
            stop: function () { },
            settings: function () { },
            public: {}
        })

        // Plugin-defined values and hooks (module code is run here, overwriting default 
        // properties assigned above)
        Object.assign(this, module(context || {}))

        // At this point, the plugin must have a name
        if (!this.name) throw new Error("Cannot load module without a name.")

        // Add to registry
        // Check to see if it's the same module being loaded twice, or different modules with the same name
        if (registry.pluginNames.includes(this.name)) {
            if (this.module === registry.getPluginByName(this.name).module) {
                // Same module. Do nothing
            } else {
                // Different modules with same name, throw error
                throw new Error("Plugin name collision. Multiple plugins named " + this.name)
            }
        }
        // No name conflict, add to registry
        else {
            registry.plugins.push(this);
            registry.pluginNames.push(this.name)
        }
    }


    /**
     * _plugin.subscribe:
     * adds listeners from plugin for all specificed hooks
     * @returns {object} self
     */
    subscribe() {
        var plg = this;
        for (var prop in plg) {
            // Don't include the API properties
            if (skipProps.indexOf(prop) === -1) {

                // inherit priority
                if (typeof plg[prop] == 'function')
                    registry.subscribe(prop, plg[prop], plg.priority, plg.name);

                // individual subscriber priority
                else if (typeof plg[prop] == 'object')
                    registry.subscribe(prop, plg[prop].subscriber, plg[prop].priority)
            }
        }
        return this;
    }

    /**
     * _plugin.unsubscribe
     * removes listeners from plugin for all specified hooks
     * @returns {object} self
     */
    unsubscribe() {
        var plg = this;
        for (var prop in plg) {
            if (skipProps.indexOf(prop) === -1 && typeof plg[prop] == 'function')
                registry.unsubscribe(prop, plg[prop])
        }
        return this;
    }

}


/**
 * User-interface for plugins
 * 
 */
class Plugin {

    /**
     * Plugin:
     * User-interface for plugin modules.
     * @param {_Plugin} plg 
     */
    constructor(plg) {
        // Include public properties
        Object.assign(this, plg.public)

        // Include wrapper properties
        Object.assign(this, {
            name: function () { return plg.name },
            priority: function () { return plg.priority },
            active: function () { return plg.active }
        })

        // Include plugin methods
        Object.assign(this, {

            init: function (...args) {
                plg.init(...args);
                plg.subscribe();
                plg.active = true;
                return Object.assign(this, plg.publicIfActive);
            },

            require: function (...args) {
                if (plg.active) plg.require(...args);
                else {
                    plg.init(...args);
                    plg.subscribe();
                    Object.assign(this, plg.publicIfActive);
                }
                plg.active = true;

                return this;
            },

            stop: function (...args) {
                if (plg.active) {
                    plg.stop(...args);
                    plg.unsubscribe();
                }
                plg.active = false;
                // remove public properties
                Object.keys(plg.publicIfActive).forEach(prop => delete this[prop])
            },

            settings: function (...args) {
                return plg.settings(...args);
            }
        })

        // Include publicIfActive properties
        if (plg.active)
            Object.assign(this, plg.publicIfActive)
    }

}

module.exports = { Plugin, _Plugin };
