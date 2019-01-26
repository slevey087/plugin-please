"use strict";

var managerAPI = require("../src/manager");
var { _Plugin, Plugin } = require("../src/plugins");
var registry = require("../src/registry");
var Hook = require("../src/hooks");

// sample plugin path
var path = require("path")
registry.directory = path.join(process.cwd(), "/test/plugins")

// mocks
var initfn = jest.fn()
var reqfn = jest.fn()
var stopfn = jest.fn()
var settfn = jest.fn()

var mockPlugin = jest.fn(function (context = {}) {
    let obj = {}

    context.name ? obj.name = context.name : null;
    context.priority ? obj.priority = context.priority : null;
    context.public ? obj.public = context.public : null

    if (context.fns) {
        obj.init = initfn
        obj.require = reqfn
        obj.stop = stopfn
        obj.settings = settfn
    }

    if (context.hooks) {
        obj.hooks = {}
        Object.assign(obj.hooks, context.hooks)
    }

    return obj
})


beforeEach(() => {
    registry.reset();
})


test("manager plugin", () => {
    // imports functions directly
    var context = { name: "test" }
    expect(managerAPI.plugin(mockPlugin, context)).toBeInstanceOf(Plugin)
    expect(registry.pluginNames).toContain("test")

    // look up plugin by string
    expect(managerAPI.plugin("test")).toBeInstanceOf(Plugin)
    expect(managerAPI.plugin("test").name()).toBe("test")

    // import file if not found
    expect(managerAPI.plugin("sample-plugin").name()).toBe("sample-plugin")
})


test("manager import", () => {
    // test without internal name
    var context = {
        name: false
    }
    var result = managerAPI.import("sample-plugin", context)

    expect(result).toBeInstanceOf(Plugin)
    expect(registry.pluginNames).toContain("sample-plugin")

    // test with internal name
    managerAPI.reset()

    context = {
        name: "sample"
    }
    result = managerAPI.import("sample-plugin", context)

    expect(registry.pluginNames).toContain("sample")
})


test("manager importAll", () => {
    var context = {}
    var result = managerAPI.importAll(context)

    // returns self
    expect(result).toBe(managerAPI)

    // if it imports one, it's probably working
    expect(registry.pluginNames).toContain("sample-plugin")

    // check that it feeds context
    context = {
        name: "sample"
    }
    result = managerAPI.importAll(context)
    expect(registry.pluginNames).toContain("sample")
})


test("manager hook", async () => {
    let hookfn = jest.fn(() => {
        return "hi"
    })
    let context = {
        name: "test2",
        hooks: { ['on-load']: hookfn }
    }

    managerAPI.plugin(mockPlugin, context).init()
    var args = [{}, {}]

    var result = await managerAPI.hook("on-load", ...args)

    // result should be array of results
    expect(result).toEqual(["hi"])

    // should run hook, with the given args
    expect(hookfn.mock.calls.length).toBe(1)
    expect(hookfn.mock.calls[0][0]).toBe(args[0])
    expect(hookfn.mock.calls[0][1]).toBe(args[1])

    // should work even if hook doesn't exist
    expect(() => managerAPI.hook("zzz")).not.toThrow();
})


test("manager runHook, manageHook", () => {
    var hook = new Hook("hook");

    expect(managerAPI.manageHook("hook")).toBe(hook);
    expect(managerAPI.runHook("hook")).toBe(hook);
})


test("manager reset", () => {
    registry.hooks = 8

    var result = managerAPI.reset()

    // calls registry reset
    expect(registry.hooks).toEqual({})
    // returns self
    expect(result).toBe(managerAPI)
})


test("manager initAll", () => {
    let hookfn = jest.fn(() => {
        return "hi"
    })
    let context = {
        fns: true,
        name: "test2",
        hooks: { ['on-load']: hookfn }
    }

    managerAPI.plugin(mockPlugin, context)

    var result = managerAPI.initAll()

    expect(result).toBe(managerAPI);
    expect(initfn.mock.calls.length).toBe(1)
    expect(registry.getPluginByName("test2").active).toBe(true)
    expect(registry.hooks["on-load"].subscribers.length).toBe(1)
})


