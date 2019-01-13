# Plugin-Please

A straightforward but versatile plugin manager. Use __Plugin-Please__ to add the ability to use plugins to your existing Node.js projects. Code heavily inspired (read: stolen) from [polite-plugin-manager](https://github.com/PoliteJS/polite-plugin-manager).

Simply add hooks at various points in your project where you'd like plugins to be able to interrupt functionality, eg.

```js
var PluginManager = require("plugin-please")

PluginManager.package("AwesomePlugin").init()

PluginManager.run("before-load") // If AwesomePlugin has code assigned to before-load, it'll run here

// code to load your project

PluginManager.run("after-load") // If AwesomePlugin has code assigned to after-load, it'll run here
```

Easy!

## Install

```
npm install plugin-please
```

## Within Your Project

Be sure to `require` the PluginManager
```js
var PluginManager = require("plugin-please");
```

Then you can load packages using a file directory

```js
var directory = "//path/to/plugins";
PluginManager.package(directory);
```

