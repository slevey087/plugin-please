var registry = require("../src/registry")

beforeEach(() => {
    registry.reset();
})

test("registry has all properties", () => {
    expect(registry).toHaveProperty("hooks");
    expect(registry).toHaveProperty("plugins");
    expect(registry).toHaveProperty("pluginNames");
    expect(registry).toHaveProperty("getPluginByName");
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


test("reset clears values", () => {
    registry.hooks = "the"
    registry.plugins = "hi"
    registry.pluginNames = "me"

    registry.reset();

    expect(registry.hooks).toEqual({})
    expect(registry.plugins).toEqual([])
    expect(registry.pluginNames).toEqual([])

})


