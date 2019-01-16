"use strict";

var Hook = require("../src/hooks");
var registry = require("../src/registry");

beforeEach(() => {
    registry.reset();
})

test("hooks exists", () => {
    expect(Hook).toBeTruthy();
})

test("Hook constructor", () => {
    var hook = new Hook("hook")

    expect(hook instanceof Hook).toBe(true)
    expect(hook.hookName).toBe("hook")
    expect(hook.subscribers).toEqual([])
    // should also add to registry
    expect(registry.hooks["hook"]).toBe(hook)

    // if improper hook argument, should throw
    expect(() => new Hook()).toThrow()
    expect(() => new Hook({})).toThrow();
})


test("Hook checkEmpty", () => {
    var hook = new Hook("hook");

    expect(hook.checkEmpty()).toBe(true)

    hook.subscribers.push(function () { })
    expect(hook.checkEmpty()).toBe(false)
})


test("Hook reset", () => {
    var hook = new Hook("hook");
    hook.subscribers.push(function () { })

    hook.reset()

    expect(hook.subscribers).toEqual([])
});


test("Hook subscribe", () => {
    var hook = new Hook("hook");
    var pluginName = "plugin"
    var hookPriority = 999
    var hookFn = function () { }

    var result = hook.subscribe(hookFn, hookPriority, pluginName)

    expect(result).toBe(hook) // returns self
    expect(hook.subscribers).toContain(hookFn)
    expect(hookFn.priority).toBe(hookPriority)
    expect(hookFn.pluginName).toBe(pluginName)

    // test argument validation
    expect(() => hook.subscribe()).toThrow();
    expect(() => hook.subscribe("the")).toThrow();
    expect(() => hook.subscribe(hookFn, "the")).toThrow();
    expect(() => hook.subscribe(hookFn, hookPriority, {})).toThrow();
})


test("Hook unsubscribe", () => {
    var hook = new Hook("hook");
    var pluginName = "plugin"
    var hookPriority = 999
    var hookFn = function () { }

    hook.subscribe(hookFn, hookPriority, pluginName)
    var result = hook.unsubscribe(hookFn)

    expect(result).toBe(hook) // returns self
    expect(hook.subscribers).not.toContain(hookFn)

    // argument validation
    expect(() => hook.unsubscribe()).toThrow();
})


test("Hook inSeries", async () => {
    expect.assertions(9)

    var hook = new Hook("hook");

    // returns false if no subscribers
    expect(hook.inSeries()).toBe(false)

    var hookFn = jest.fn()
    hook.subscribe(hookFn)

    var result = hook.inSeries();

    expect(result).toBeInstanceOf(Promise)
    expect(await result).toBe(true)
    expect(hookFn.mock.calls.length).toBe(1)

    var arg1 = {}
    var arg2 = {}
    await hook.inSeries(arg1, arg2)

    // arguments should get delivered
    expect(hookFn.mock.calls[1][0]).toBe(arg1)
    expect(hookFn.mock.calls[1][1]).toBe(arg2)

    // multiple subscribers.
    hook.subscribe(hookFn)
    await hook.inSeries()
    expect(hookFn.mock.calls.length).toBe(4)

    // returning false should stop the sequence
    var stopFn = jest.fn(() => false);
    hook.reset()
    hook.subscribe(stopFn, 100, "first")
    hook.subscribe(hookFn, 100, "second")

    try {
        await hook.inSeries()
    }
    catch (e) {
        expect(e).toBe("first")
    }

    // sorts priority
    var log = []
    var fn1 = jest.fn(() => log.push(1))
    var fn2 = jest.fn(() => log.push(2))
    hook.reset()
    hook.subscribe(fn2, 100)
    hook.subscribe(fn1, 99)

    await hook.inSeries()

    expect(log).toEqual([1, 2])
})


test("Hook inParallel", async () => {
    expect.assertions(9)

    var hook = new Hook("hook");

    // returns false if no subscribers
    expect(hook.inParallel()).toBe(false)

    var hookFn = jest.fn((arg = 0) => arg + 1)
    hook.subscribe(hookFn)

    var result = hook.inParallel();

    expect(result).toBeInstanceOf(Promise)
    expect(await result).toEqual([1])
    expect(hookFn.mock.calls.length).toBe(1)

    var arg1 = 1
    var arg2 = {}
    result = await hook.inParallel(arg1, arg2)

    // arguments should get delivered
    expect(hookFn.mock.calls[1][0]).toBe(arg1)
    expect(hookFn.mock.calls[1][1]).toBe(arg2)

    // multiple subscribers.
    hook.subscribe(hookFn)
    await hook.inParallel()
    expect(hookFn.mock.calls.length).toBe(4)

    // returning false should stop the sequence
    var stopFn = jest.fn(() => false);
    hook.reset()
    hook.subscribe(stopFn, 100, "first")
    hook.subscribe(hookFn, 100, "second")

    try {
        await hook.inParallel()
    }
    catch (e) {
        expect(e).toBe("first")
    }

    // sorts priority
    var log = []
    var fn1 = jest.fn(() => log.push(1))
    var fn2 = jest.fn(() => log.push(2))
    hook.reset()
    hook.subscribe(fn2, 100)
    hook.subscribe(fn1, 99)

    await hook.inParallel()

    expect(log).toEqual([1, 2])
})


test("Hook inWaterfall", async () => {
    expect.assertions(11)

    var hook = new Hook("hook");

    // returns false if no subscribers
    expect(hook.inWaterfall()).toBe(false)

    var hookFn = jest.fn((arg = 0) => arg + 1)
    hook.subscribe(hookFn)

    var result = hook.inWaterfall();

    expect(result).toBeInstanceOf(Promise)
    expect(await result).toEqual(1)
    expect(hookFn.mock.calls.length).toBe(1)

    var arg1 = 1
    var arg2 = {}
    result = await hook.inWaterfall(arg1, arg2)

    // arguments should get delivered
    expect(hookFn.mock.calls[1][0]).toBe(arg1)
    expect(hookFn.mock.calls[1][1]).toBe(arg2)

    // multiple subscribers.
    hook.subscribe(hookFn)
    var result = await hook.inWaterfall()
    expect(result).toBe(2)
    expect(hookFn.mock.calls.length).toBe(4)
    expect(hookFn.mock.calls[3][0]).toBe(hookFn.mock.results[2].value)

    // returning false should stop the sequence
    var stopFn = jest.fn(() => false);
    hook.reset()
    hook.subscribe(stopFn, 100, "first")
    hook.subscribe(hookFn, 100, "second")

    try {
        await hook.inWaterfall()
    }
    catch (e) {
        expect(e).toBe("first")
    }

    // sorts priority
    var log = []
    var fn1 = jest.fn(() => log.push(1))
    var fn2 = jest.fn(() => log.push(2))
    hook.reset()
    hook.subscribe(fn2, 100)
    hook.subscribe(fn1, 99)

    await hook.inWaterfall()

    expect(log).toEqual([1, 2])
})

