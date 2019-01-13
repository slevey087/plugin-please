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
    'settings'
]

/**
 * Backend class for packages.
 * 
 */
class _Package {
    /**
     * Create new backend package class.
     * Supply a module, which returns an object of package properties/methods.
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

        // Package-defined values and hooks (module code is run here, overwriting default 
        // properties assigned above)
        Object.assign(this, module(context || {}))

        // At this point, the package must have a name
        if (!this.name) throw new Error("Cannot load module without a name.")

        // Add to registry
        // Check to see if it's the same module being loaded twice, or different modules with the same name
        if (registry.packageNames.includes(this.name)) {
            if (this.module === registry.getPackageByName(this.name).module) {
                // Same module. Do nothing
            } else {
                // Different modules with same name, throw error
                throw new Error("Plugin name collision. Multiple plugins named " + this.name)
            }
        }
        // No name conflict, add to registry
        else {
            registry.packages.push(this);
            registry.packageNames.push(this.name)
        }
    }


    /**
     * _package.subscribe:
     * adds listeners from plugin for all specificed hooks
     * @returns {object} self
     */
    subscribe() {
        var pkg = this;
        for (var prop in pkg) {
            if (skipProps.indexOf(prop) === -1 && typeof pkg[prop] == 'function') {
                registry.subscribe(prop, pkg[prop]);
            }
        }
        return this;
    }

}


/**
 * User-interface for packages
 * 
 */
class Package {
    /**
     * Package:
     * User-interface for plugin modules.
     * @param {_Package} pkg 
     */
    constructor(pkg) {
        // Include public properties
        Object.assign(this, pkg.public)

        // Include wrapper properties
        Object.assign(this, {
            name: function () { return pkg.name },
            priority: function () { return pkg.priority },
            active: function () { return pkg.active }
        })

        // Include package methods
        Object.assign(this, {

            init: function (...args) {
                pkg.init(...args);
                pkg.subscribe();
                pkg.active = true;
                return Object.assign(this, pkg.publicIfActive);
            },

            require: function (...args) {
                if (pkg.active) pkg.require(...args);
                else {
                    pkg.init(...args);
                    pkg.subscribe();
                    Object.assign(this, pkg.publicIfActive);
                }
                pkg.active = true;

                return this;
            },

            stop: function (...args) {
                if (pkg.active) pkg.stop(...args);
                pkg.active = false;
                // remove public properties
                Object.keys(pkg.publicIfActive).forEach(prop => delete this[prop])
            },

            settings: function (...args) {
                return pkg.settings(...args);
            }
        })

        // Include publicIfActive properties
        if (pkg.active)
            Object.assign(this, pkg.publicIfActive)
    }

}

module.exports = { Package, _Package };
