"use strict";
var debug = require("./debug")

// ----------------------------------- //
// ---[[   P L U G I N   A P I   ]]--- //
// ----------------------------------- //

debug("Building plugin classes");

var registry = require("./registry");
var Hook = require("./hooks")


/**
 * Backend class for plugins.
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
        debug("Creating new _plugin %s", name);

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
            hooks: {},
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
                debug("Plugin already imported.")
            } else {
                // Different modules with same name, throw error
                throw new Error("Plugin name collision. Multiple plugins named " + this.name)
            }
        }
        // No name conflict, add to registry
        else {
            debug("Registering plugin %s", this.name)
            registry.plugins.push(this);
            registry.pluginNames.push(this.name)
        }
    }


    /**
     * _plugin.subscribe:
     * adds listeners from plugin for all specificed hooks
     * 
     * @returns {object} self
     */
    subscribe() {
        debug("_plugin: subscribing all hooks")
        var plg = this;
        for (var prop in plg.hooks) {

            var priority
            // inherit priority
            if (typeof plg.hooks[prop] == 'function')
                priority = plg.priority

            // individual subscriber priority
            else if (typeof plg.hooks[prop] == 'object')
                priority = plg.hooks[prop].priority;

            var hook = registry.hooks[prop] || new Hook(prop)
            hook.subscribe(plg.hooks[prop], priority, plg[name]);

        }
        return this;
    }

    /**
     * _plugin.unsubscribe
     * removes listeners from plugin for all specified hooks
     * 
     * @returns {object} self
     */
    unsubscribe() {
        debug("_plugin: unsubscribing hooks")

        var plg = this;
        for (var prop in plg.hooks) {
            if (typeof plg.hooks[prop] == 'function') {
                // If hook doesn't exist (not sure how that could have happened...) then we're done
                if (registry.hooks[prop]) {
                    // otherwise, unsubscribe the subscriber function
                    let hook = registry.hooks[prop]
                    hook.unsubscribe(plg.hooks[prop])
                }
            }
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
        debug("Creating new plugin %s", plg.name)

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
                debug("plugin: init %s", plg.name)
                plg.init(...args);
                plg.subscribe();
                plg.active = true;
                return Object.assign(this, plg.publicIfActive);
            },

            require: function (...args) {
                debug("plugin: require %s", plg.name)

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
                debug("plugin: stop %s", plg.name)

                if (plg.active) {
                    plg.stop(...args);
                    plg.unsubscribe();
                }
                plg.active = false;
                // remove public properties
                Object.keys(plg.publicIfActive).forEach(prop => delete this[prop])
            },

            settings: function (...args) {
                debug("plugin: settings %s", plg.name)
                return plg.settings(...args);
            }
        })

        // Include publicIfActive properties
        if (plg.active)
            Object.assign(this, plg.publicIfActive)
    }

}

module.exports = { Plugin, _Plugin };
