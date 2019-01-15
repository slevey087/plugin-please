var hooksAPI = require("../src/hooks");
var registry = require("../src/registry");

beforeEach(() => {
    registry.reset();
})

test("hooksAPI exists", () => {
    expect(hooksAPI).toBeTruthy();
})

test("hooksAPI isEmpty", () => {
    registry.subscribe("test1", function () { })

    expect(hooksAPI.isEmpty("test1")).toBe(false)
    expect(hooksAPI.isEmpty("test2")).toBe(true)
})