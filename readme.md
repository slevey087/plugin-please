# Plugin-Please

A straightforward but versatile plugin manager. Use __Plugin-Please__ to add the ability to use plugins to your existing Node.js projects. Code heavily inspired (read: stolen) from [polite-plugin-manager](https://github.com/PoliteJS/polite-plugin-manager).

Simply add hooks at various points in your project where you'd like plugins to be able to interrupt functionality.

<!-- toc -->

- [Install](#install)
- [Quick Start](#quick-start)
- [Much More Detail](#much-more-detail)
- [`Plugin` API](#plugin-api)
  * [Basic API](#basic-api)
  * [Misc. Additional `Plugin` API](#misc-additional-plugin-api)
- [Hooks](#hooks)
  * [`.hook()`](#hook)
  * [`.runHook()`](#runhook)
  * [`.manageHook()`](#managehook)
- [Building a plugin](#building-a-plugin)

<!-- tocstop -->

## Install

```
npm install plugin-please
```

## Quick Start

```js
// In application

var PluginManager = require("plugin-please")("/path/to/plugins")

// Import all plugins in plugins directory, then initialize them
PluginManager.importAll().initAll();

// ...

// At various locations in your application, mark hooks
PluginManager.hook("before-load")
// ...
PluginManager.hook("after-load")
```

```js
// In awesome-plugin.js
module.exports = function awesomePlugin(){
    // setup code here
    return {
        init(){
            // code to run when plugin is activated
        },
        hooks:{
            "before-load"(){
                // code to run at the 'before-load' hook
            },
            "after-load"(){
                // code to run at the 'after-load' hook
            }
        }
    }
}
```

Easy!

## Much More Detail

Be sure to `require` the PluginManager
```js
var PluginManager = require("plugin-please");
```

To use a custom directory, run on import:
```js
var directory = "/path/to/plugins"
var PluginManager = require("plugin-please")(directory);
```

Then you can load plugins using a file name

```js
var filename = "awesome-plugin";
PluginManager.import(filename); // imports awesome-plugin.js
```
This will return a `plugin` object. To fetch the `plugin` object for a plugin that you've already imported, use `.plugin`:
```js
PluginManager.plugin("awesome-plugin") // retrieves previously imported
```
(If `.plugin` can't find a plugin, it will try importing a file)

To load a whole folder, use `.importAll()`, then you can `initAll` or fetch plugins individually
```js
PluginManager.importAll()
PluginManager.plugin("some-plugin") // do something with the plugin

// or
PluginManager.importAll().initAll();
```
To stop all plugins, you can use `.stopAll()`
```js
PluginManager.stopAll();
```
And you can use `.activePlugins`, `inactivePlugins`, and `allPlugins` to return arrays of plugins.
```js
PluginManager.activePlugins() // returns an array of active plugins
PluginManager.inactivePlugins() // returns an array of inactive plugins
PluginManager.allPlugins() // returns an array of all imported plugins regardless of whether they're active or not.
```

## `Plugin` API

### Basic API

Here is the basic plugin API that you'll use most of the time. In addition to this, and the less common API methods down below, the plugin can also expose properties/methods, which you can call from the `plugin` object in the same fashion.

Note: any arguments you pass to any of these functions will get passed along to the plugin itself.

To start the plugin, run `.require`:
```js
// Initialize plugin if not already active
PluginManager.plugin("awesome-plugin").require();
```
`.require` will initialize the plugin, or skip initialization if the plugin is already running. 

If you want to force initialization, use `.init`
```js
// Force initialization
PluginManager.plugin("awesome-plugin").init();
```

To deactivate a plugin after it's running, use `.stop`
```js
// Halt plugin
PluginManager.plugin("awesome-plugin").stop()
```

To change the settings for a plugin, use `.settings()`
```js
var awesomeSettings = { /* settings here */ }
PluginManager.plugin("awesome-plugin").settings(awesomeSettings;)
```

### Misc. Additional `Plugin` API



To see if the plugin is currently active, use `.active()`
```js
PluginManager.plugin("awesome-plugin").require();
PluginManager.plugin("awesome-plugin").active(); // returns true
PluginManager.plugin("awesome-plugin").stop();
PluginManager.plugin("awesome-plugin").active(); // returns false
```


If you'd like to see the priority level for this plugin, use `.priority`
```js
PluginManager.plugin("awesome-plugin").priority(); // returns, eg. 100
```

If for some reason you should need to fetch the name of the plugin, use `.name()`
```js
PluginManager.plugin("awesome-plugin").name() // returns "awesome-plugin"
```

## Hooks

Hooks are the primary way by which plugins can extend an application. Place them in your project at various key locations, and give them a helpful name. Plugins can subscribe to them by providing code that will run when the hook is invoked.

### `.hook()`

Code registered to a hook can be executed in parallel using 

```js
var hookName = /* eg. */ "on-load";
var args = [/* arguments will be passed to subscribers */]
PluginManager.hook(hookName, args);
```

This will run the hooks in parallel, then return a `Promise`, whose value will be an array of the return values of the subscribers. Therefore you can use `.then`
```js
PluginManager.hook("after-loading").then(function(results){
    // code here won't run until all subscribers have completed execution
})
.catch(function(error){
    // handle errors here
})
```
or you can use `async`/`await`:
```js
try{
    var results = await PluginManager.hook("display-interface");
    // code here won't run until all subscribers have completed executionn
}
catch(error){
    // handle errors here
}
```

### `.runHook()`

Hooks using `.hook` will run their subscribers in parallel, all at once, but parallel isn't the only way to execute a hook. You can also choose _series_ or _waterfall_. To use these, instead of `.hook()`, use `.runHook()`

```js
// run in series
PluginManager.runHook("on-load").inSeries(...args);
// or as a waterfall
PluginManager.runHook("on-load").inWaterfall(...args);
// or as parallel. This is identical to .hook() 
PluginManager.runHook("on-load").inParallel(...args);
```

Each of these returns a Promise. 

_Waterfall_ is like series, except that the result of each subscriber is passed as the first argument to the next subscriber, and the final result is returned as the value of the Promise. For series, a successful completion of the series will return `true` as the value of the Promise.

### `.manageHook()`

Use `manageHook` if you need one of the administrative methods. You can add a subscriber
```js
var hookFn = // some code to run when the hook is called
var hookPriority = 101 // optional, default 100
var pluginName // optional. In event of an error, while running, pluginName will be included in the error message
PluginManager.manageHook("on-load").subscribe(hookFn, hookPriority, pluginName)
```
remove a subscriber
```js
PluginManager.manageHook("on-load").unsubscribe(hookFn)
```
check whether there are any subscribers
```js
PluginManager.manageHook("on-load").checkEmpty(); // returns true if no subscribers, false otherwise
```
or clear all subscribers
```js
PluginManager.manageHook("on-load").reset();
```
## Building a plugin

A plugin is a Node module, which exports a function. When that function is run, it returns an object. 
```js
// awesome-plugin.js
"use strict";

var awesome = function(){
    // function body code here

    return {
        // return object here
    }
}

module.exports = awesome;
```

The function body code will be run one time, when the plugin is first loaded into the manager (i.e. `PluginManager.plugin("awesome-plugin")`). It should be used to define any module-wide variables that your plugin will need, such as a variable to store settings, or object classes.

The return object is the meat of the plugin. Its entries can contain the metadata on the plugin (its name and priority), the basic API methods (`init`, `require`, `stop`, and `settings`), any hooks it's subscribing to, plus any other public variables it wants to expose. All fields are optional.

Here's a more flushed out example:

```js
// awesome-plugin.js
"use strict";

var awesome = function(){
    var settings = {} // use this to store settings

    return {
        name: "awesome-plugin", // defaults to filename
        priority: 101, // default is 100
        
        init(...args){
            // this function will be run when .init() is called, and when .require() is called and the plugin isn't already active
        },

        require(...args){
            // this will only be run if .require() is called but the plugin is already active. It WILL NOT be run if .require() is called while the plugin is inactive - init will be called instead.
        },

        stop(...args){
            // this will run when .stop() is called. Do any teardown here, 
        },

        settings(...args){
            // this will run when .settings() is called. Use it to change your stored settings, eg.
            settings[args[0]] = args[1]
            // and execute the change
        },

        public:{
            // any keys in this object will be exposed on the plugin user interface.
        },

        publicIfActive:{
            // any keys in this object will be exposed on the plugin user interface, but only if the plugin is active. 
        },

        // Use remaining keys to add hook subscriptions. Eg.,
        hooks:{
            "on-load": function(...args){
                // do stuff when the application loads
            }

            // If you'd like to assign a hook-specific priority, use an object
            "finish-loading":{
                priority: 99, // default 100
                subscriber: function(...args){
                    // do stuff when the application finishes loading.
                }
            }
        }
    }
}

module.exports = awesome;
```
