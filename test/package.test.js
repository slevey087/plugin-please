var registry = require("../src/registry")
var { _Package, Package } = require("../src/package")

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

test("_Package exists", () => {
    expect(_Package).toBeDefined();
})


test("_Package constructor defaults", () => {
    // should throw error without name
    expect(() => new _Package(mockPlugin)).toThrow();

    let pkg = new _Package(mockPlugin, "test1")


    expect(pkg.module).toBe(mockPlugin)
    expect(mockPlugin.mock.calls.length).toBe(2)
    expect(pkg.name).toBe("test1")
    expect(pkg.priority).toBe(100)
    expect(pkg.active).toBe(false)
    expect(pkg.init).toBeInstanceOf(Function)
    expect(pkg.require).toBeInstanceOf(Function)
    expect(pkg.stop).toBeInstanceOf(Function)
    expect(pkg.settings).toBeInstanceOf(Function)
    expect(pkg.public).toBeInstanceOf(Object)

    // check that package got added to registry
    expect(registry.packageNames).toContain("test1")
    expect(registry.packages).toContain(pkg)
})


test("_Package constructor non-defaults", () => {
    let hookfn = jest.fn()
    let context = {
        name: "test2",
        priority: 99,
        public: { on: true },
        fns: true,
        hooks: { ['on-load']: hookfn }
    }

    let pkg = new _Package(mockPlugin, null, context)

    // these will also verify that context got delivered
    expect(pkg.module).toBe(mockPlugin)
    expect(pkg.name).toBe("test2")
    expect(pkg.priority).toBe(99)
    expect(pkg.active).toBe(false)
    expect(pkg.init).toBe(initfn)
    expect(pkg.require).toBe(reqfn)
    expect(pkg.stop).toBe(stopfn)
    expect(pkg.settings).toBe(settfn)
    expect(pkg.public).toBe(context.public)
    expect(pkg["on-load"]).toBe(context.hooks['on-load'])
})

test("_Package name conflict", () => {
    let hookfn = jest.fn()
    let context = {
        priority: 99,
        public: { on: true },
        fns: true,
        hooks: { ['on-load']: hookfn }
    }

    // exact same module, shouldn't throw
    let pkg1 = new _Package(mockPlugin, "test3", context)
    let pkg2 = new _Package(mockPlugin, "test3", context)

    // different modules, should throw
    let pkg3 = new _Package(mockPlugin, "test4", context)
    expect(() => new _Package(function () { }, "test4")).toThrow()
})


test("_Package subscribe", () => {
    let hookfn1 = jest.fn()
    let hookfn2 = jest.fn()
    let context = {
        hooks: { ['on-load']: hookfn1, ['after-load']: hookfn2 }
    }

    let pkg = new _Package(mockPlugin, "test5", context)

    // returns self
    expect(pkg.subscribe()).toBe(pkg)

    expect(registry.hooks['on-load']).toBeDefined()
    expect(registry.hooks['on-load']).toContain(hookfn1)
    expect(registry.hooks['after-load']).toBeDefined()
    expect(registry.hooks['after-load']).toContain(hookfn2)
})


test("Package exists", () => {
    expect(Package).toBeDefined();
})