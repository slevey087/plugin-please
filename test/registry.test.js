var registry = require("../src/registry")

beforeEach(() => {
    registry.reset();
})

test("registry has all properties", () => {
    expect(registry).toHaveProperty("hooks");
    expect(registry).toHaveProperty("plugins");
    expect(registry).toHaveProperty("pluginNames");
    expect(registry).toHaveProperty("getPluginByName");
    expect(registry).toHaveProperty("subscribe");
})


test("getPluginByName returns plugin", () => {
    let plg1 = { name: "plg1" }
    let plg2 = { name: "plg2" }
    let plgNameDuplicate = { name: "plg1" }
    registry.plugins.push(plg1, plg2, plgNameDuplicate)

    // check single fetch
    expect(registry.getPluginByName("plg2")).toBe(plg2)
    // check duplicate names
    expect(registry.getPluginByName("plg1")).toEqual([plg1, plgNameDuplicate])
})


test("subscribe creates hook and adds subscriber", () => {
    let subscriber = function () { }

    registry.subscribe("on-load", subscriber)
    expect(registry.hooks).toHaveProperty("on-load", [subscriber])

    // default priority
    expect(registry.hooks["on-load"][0].priority).toBe(100)

    // non-default subscriber
    registry.subscribe("on-load", subscriber, 99)
    expect(registry.hooks["on-load"][1].priority).toBe(99)
})


test("unsubscribe removes subscriber", () => {
    let subscriber = function () { }

    registry.subscribe("on-load", subscriber)
    expect(registry.hooks).toHaveProperty("on-load")
    expect(registry.hooks["on-load"]).toContain(subscriber)

    registry.unsubscribe("on-load", subscriber)
    expect(registry.hooks["on-load"]).not.toContain(subscriber)
})