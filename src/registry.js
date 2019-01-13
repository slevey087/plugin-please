"use strict";

// ------------------------------- //
// ---[[   R E G I S T R Y   ]]--- //
// ------------------------------- //


/**
 * registry:
 * tracks module-wide variables: hooks, packages, packageNames, and the directory
 */
var registry = {
    hooks: {},
    packages: [],
    packageNames: [],

    /**
     * getPackageByName:
     * fetch registered package, using identifier 
     * @param {string} name 
     */
    getPackageByName(name) {
        var list = registry.packages.filter(pkg => (pkg.name === name))
        if (list.length == 1) return list[0]
        else return list;
    },

    /**
     * reset:
     * clear registry data.
     */
    reset() {
        registry.hooks = {};
        registry.packages = [];
        registry.packageNames = [];
    },

    /**
     * subscribe:
     * Add a listener function to a hook-string.
     * @param {string} hookName 
     * @param {function} hookFn 
     * @param {number} hookPriority 
     */
    subscribe(hookName, hookFn, hookPriority = 100) {
        hookFn.priority = hookPriority;

        if (!registry.hooks[hookName]) {
            registry.hooks[hookName] = [];
        }

        registry.hooks[hookName].push(hookFn);
        return hookName
    }
};

module.exports = registry
