var registry = require("../src/registry")

test("registry has all properties", () => {
    expect(registry).toHaveProperty("hooks");
    expect(registry).toHaveProperty("packages");
    expect(registry).toHaveProperty("packageNames");
    expect(registry).toHaveProperty("getPackageByName");
    expect(registry).toHaveProperty("subscribe");
})


test("getPackageByName returns package", () => {
    let pkg1 = { name: "pkg1" }
    let pkg2 = { name: "pkg2" }
    let pkgNameDuplicate = { name: "pkg1" }
    registry.packages.push(pkg1, pkg2, pkgNameDuplicate)

    // check single fetch
    expect(registry.getPackageByName("pkg2")).toBe(pkg2)
    // check duplicate names
    expect(registry.getPackageByName("pkg1")).toEqual([pkg1, pkgNameDuplicate])
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