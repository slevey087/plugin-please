"use strict";

// --------------------------------- //
// ---[[   H O O K S   A P I   ]]--- //
// --------------------------------- //

var registry = require("./registry")

class Hook {
    constructor(hookName) {
        if (!hookName) throw new Error("must have hook name!")

        this.hookName = hookName
        if (!registry.hooks[hookName]) registry.hooks[hookName] = [];
    }

    /**
     * PluginManager.isEmpty
     * returns false if a hook has subscribers, true otherwise
     * @param {string} hookName 
     * @returns {boolean}
     */
    isEmpty() {
        let hookName = this.hookName;
        if (registry.hooks[hookName] && registry.hooks[hookName].length) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * Hook.series:
     * Execute any plugin code subscribed to a hook, in asynchronous series
     * Args after hookName will get passed to the plugin function
     * @param {string} hookName 
     * @param  {...any} args 
     * @return {Promise}
     */
    series(...args) {
        let hookName = this.hookName

        // Return false if no subscribers
        if (!hooks[hookName] || !hooks[hookName].length)
            return false;

        // Sort hooks by priority
        hooks[hookName].sort((a, b) => a.priority > b.priority)

        // construct promise chain
        var promise = Promise.resolve();
        hooks[hookName].forEach(subscriber => promise = promise.then(function () {
            var result = subscriber(...args);
            // If subscriber returns false, halt sequence
            if (result === false) return Promise.reject(subscriber.pluginName)
            else return result;
        }));

        // if all goes well, return true
        promise = promise.then(() => { true })

        return promise;
    }

    /**
     * Hook.parallel:
     * Execute any plugin code subscribed to a hook, in parallel
     * @param {string} hookName 
     * @param  {...any} args 
     * @returns {Promise}
     */
    parallel(...args) {
        let hookName = this.hookName;

        // Return false if no subscribers
        if (!hooks[hookName] || !hooks[hookName].length)
            return false;

        // Sort hooks by priority
        hooks[hookName].sort((a, b) => a.priority > b.priority)

        // construct promises
        var promises = hooks[hookName].map(subscriber => new Promise(function (resolve, reject) {
            var result = subscriber(...args)
            result ? resolve(result) : reject(subscriber.pluginName)
        }));

        return Promise.all(promises)
    }


    /**
     * Hook.waterfall:
     * Execute any plugin code subscribed to a hook, in a series where the result of 
     * each subscriber is fed as the first argument to the next subscriber
     * @param {*} hookName 
     * @param  {...any} args 
     * @returns {Promise}
     */
    waterfall(...args) {
        // Must have hook name.
        if (!hookName) throw new Error('missing plugin name!');

        // Return false if no subscribers
        if (!hooks[hookName] || !hooks[hookName].length)
            return false;

        // Sort hooks by priority
        hooks[hookName].sort((a, b) => a.priority > b.priority)

        // construct promise chain
        var promise = Promise.resolve();
        hooks[hookName].forEach(subscriber => promise = promise.then(function (previousResult) {
            var result = subscriber(previousResult, ...args);
            // If subscriber returns false, halt sequence
            if (result === false) return Promise.reject(subscriber.pluginName)
            else return result;
        }));

        // Return promise with final result
        return promise;
    }
}


module.exports = Hook;