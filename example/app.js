// In application

var PluginManager = require("../index")("plugins")

// Import all plugins in plugins directory, then initialize them
PluginManager.importAll().initAll();

// ...

// At various locations in your application, mark hooks
PluginManager.hook("before-load")
// ...
PluginManager.hook("after-load")

// ...

// Before your application closes
PluginManager.stopAll();