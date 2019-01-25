"use strict";
var debug = require("./debug")

// --------------------------------- //
// ---[[   H O O K S   A P I   ]]--- //
// --------------------------------- //

debug("Building hooks class");

var registry = require("./registry")

/**
 * Hook class:
 * manages hooks, which are markers in an application where plugins can run code.
 */
class Hook {

    /**
     * Create a new Hook, and add it to the registry.
     * @param {*} hookName 
     */
    constructor(hookName) {
        if (!hookName) throw new Error("must have hook name!")
        if (typeof hookName !== 'string') throw new Error("hook name must be string")

        this.hookName = hookName
        this.subscribers = [];

        debug("hooks: registering new hook %s", hookName)
        registry.hooks[hookName] = this;
    }


    /**
     * hook.checkEmpty
     * returns false if a hook has subscribers, true otherwise
     * @param {string} hookName 
     * @returns {boolean}
     */
    checkEmpty() {
        debug("hook: checkEmpty")
        if (this.subscribers.length === 0) return true;
        else return false;
    }


    /**
     * hook.reset
     * removes all subscribers
     */
    reset() {
        debug("hook: resetting")
        this.subscribers = [];
    }


    /**
     * hook.subscribe()
     * adds a function supplied by a plugin to the hook
     * @param {*} hookFn 
     * @param {*} hookPriority 
     * @param {*} pluginName 
     * @returns {Hook} self
     */
    subscribe(hookFn, hookPriority = 100, pluginName = null) {
        if (!hookFn || typeof hookFn !== 'function') throw new Error("first argument must be a function")
        if (isNaN(hookPriority)) throw new Error("hookPriority must be number")
        if (pluginName && typeof pluginName !== 'string') throw new Error("pluginName must be string")

        hookFn.priority = hookPriority;
        hookFn.pluginName = pluginName;

        debug("hook: subscribing listener to %s, priority %d, pluginName %s", this.hookName, hookPriority, pluginName)
        this.subscribers.push(hookFn)
        return this;
    }


    /**
     * hook.unsubscribe:
     * removes subscribed function from hook
     * @param {function} hookFn 
     * @returns {Hook} self
     */
    unsubscribe(hookFn) {
        if (!hookFn || typeof hookFn !== 'function') throw new Error("argument must be a function")
        if (this.subscribers.includes(hookFn)) {
            this.subscribers = this.subscribers.filter(fn => !(fn === hookFn))
            debug("hook: unsubscribing from %s", this.hookName)
        }
        return this;
    }


    /**
     * hook.inSeries:
     * Execute any plugin code subscribed to a hook, in asynchronous series
     * Args will get passed to the plugin function
     * 
     * @param  {...any} args 
     * @return {Promise}
     */
    inSeries(...args) {
        debug("hook: running %s in Series", this.hookName)

        // Return false if no subscribers
        if (this.subscribers.length == 0)
            return false;

        // Sort hooks by priority
        this.subscribers.sort((a, b) => a.priority > b.priority)

        // construct promise chain
        var promise = Promise.resolve();
        this.subscribers.forEach(subscriber => promise = promise.then(function () {
            debug("hook.inSeries: executing subscriber %s", subscriber.pluginName)
            var result = subscriber(...args);

            // If subscriber returns false, halt sequence
            if (result === false) return Promise.reject(subscriber.pluginName)
            else return result;
        }));

        // if all goes well, return true
        promise = promise.then(() => true)

        return promise;
    }


    /**
     * Hook.inParallel:
     * Execute any plugin code subscribed to a hook, in parallel
     * @param {string} hookName 
     * @param  {...any} args 
     * @returns {Promise}
     */
    inParallel(...args) {
        debug("hook: running %s in Parallel", this.hookName)

        // Return false if no subscribers
        if (this.subscribers.length == 0)
            return false;

        // Sort hooks by priority
        this.subscribers.sort((a, b) => a.priority > b.priority)

        // construct promises
        var promises = this.subscribers.map(subscriber => new Promise(function (resolve, reject) {
            debug("hook.inParallel: executing subscriber %s", subscriber.pluginName)
            var result = subscriber(...args)
            result === false ? reject(subscriber.pluginName) : resolve(result)
        }));

        return Promise.all(promises)
    }


    /**
     * Hook.inWaterfall:
     * Execute any plugin code subscribed to a hook, in a series where the result of 
     * each subscriber is fed as the first argument to the next subscriber
     * @param {*} hookName 
     * @param  {...any} args 
     * @returns {Promise}
     */
    inWaterfall(...args) {
        debug("hook: running %s in Waterfall", this.hookName)


        // Return false if no subscribers
        if (this.subscribers.length == 0)
            return false;

        // Sort hooks by priority
        this.subscribers.sort((a, b) => a.priority > b.priority)

        // construct promise chain
        var promise = Promise.resolve();
        this.subscribers.forEach((subscriber, index) => promise = promise.then(function (previousResult) {
            debug("hook.inWaterfall: executing subscriber %s", subscriber.pluginName)

            // on first call, use args. On subsequent calls, first argument will be value returned from previous subscriber
            var result = index === 0 ? subscriber(...args) : subscriber(previousResult, ...args);
            // If subscriber returns false, halt sequence
            if (result === false) return Promise.reject(subscriber.pluginName)
            else return result;
        }));

        // Return promise with final result
        return promise;
    }
}


module.exports = Hook;