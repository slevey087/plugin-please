var registry = require("../src/registry")
var { _Plugin, Plugin } = require("../src/plugin")

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

    context.hooks ? Object.assign(obj, context.hooks) : null;

    return obj
})

beforeEach(() => {
    registry.reset();
})

test("_Plugin exists", () => {
    expect(_Plugin).toBeDefined();
})


test("_Plugin constructor defaults", () => {
    // should throw error without name
    expect(() => new _Plugin(mockPlugin)).toThrow();

    let plg = new _Plugin(mockPlugin, "test1")


    expect(plg.module).toBe(mockPlugin)
    expect(mockPlugin.mock.calls.length).toBe(2)
    expect(plg.name).toBe("test1")
    expect(plg.priority).toBe(100)
    expect(plg.active).toBe(false)
    expect(plg.init).toBeInstanceOf(Function)
    expect(plg.require).toBeInstanceOf(Function)
    expect(plg.stop).toBeInstanceOf(Function)
    expect(plg.settings).toBeInstanceOf(Function)
    expect(plg.public).toBeInstanceOf(Object)

    // check that plugin got added to registry
    expect(registry.pluginNames).toContain("test1")
    expect(registry.plugins).toContain(plg)
})


test("_Plugin constructor non-defaults", () => {
    let hookfn = jest.fn()
    let context = {
        name: "test2",
        priority: 99,
        public: { on: true },
        fns: true,
        hooks: { ['on-load']: hookfn }
    }

    let plg = new _Plugin(mockPlugin, null, context)

    // these will also verify that context got delivered
    expect(plg.module).toBe(mockPlugin)
    expect(plg.name).toBe("test2")
    expect(plg.priority).toBe(99)
    expect(plg.active).toBe(false)
    expect(plg.init).toBe(initfn)
    expect(plg.require).toBe(reqfn)
    expect(plg.stop).toBe(stopfn)
    expect(plg.settings).toBe(settfn)
    expect(plg.public).toBe(context.public)
    expect(plg["on-load"]).toBe(context.hooks['on-load'])
})

test("_Plugin name conflict", () => {
    let hookfn = jest.fn()
    let context = {
        priority: 99,
        public: { on: true },
        fns: true,
        hooks: { ['on-load']: hookfn }
    }

    // exact same module, shouldn't throw
    let plg1 = new _Plugin(mockPlugin, "test3", context)
    let plg2 = new _Plugin(mockPlugin, "test3", context)

    // different modules, should throw
    let plg3 = new _Plugin(mockPlugin, "test4", context)
    expect(() => new _Plugin(function () { }, "test4")).toThrow()
})


test("_Plugin subscribe", () => {
    let hookfn1 = jest.fn()
    let hookfn2 = jest.fn()
    let context = {
        hooks: { ['on-load']: hookfn1, ['after-load']: hookfn2 }
    }

    let plg = new _Plugin(mockPlugin, "test5", context)

    // returns self
    expect(plg.subscribe()).toBe(plg)

    expect(registry.hooks['on-load']).toBeDefined()
    expect(registry.hooks['on-load']).toContain(hookfn1)
    expect(registry.hooks['after-load']).toBeDefined()
    expect(registry.hooks['after-load']).toContain(hookfn2)
})


// Plugin
test("Plugin exists", () => {
    expect(Plugin).toBeDefined();
})


test("Plugin constructor", () => {

})