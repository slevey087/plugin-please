# Plugin-Please

A straightforward but versatile plugin manager. Use __Plugin-Please__ to add the ability to use plugins to your existing Node.js projects. Code heavily inspired (read: stolen) from [polite-plugin-manager](https://github.com/PoliteJS/polite-plugin-manager).

Simply add hooks at various points in your project where you'd like plugins to be able to interrupt functionality, eg.

```js
var PluginManager = require("plugin-please")

PluginManager.plugin("AwesomePlugin").require()

PluginManager.run("before-load") // If AwesomePlugin has code assigned to before-load, it'll run here

// code to load your project

PluginManager.run("after-load") // If AwesomePlugin has code assigned to after-load, it'll run here
```

Easy!

## Install

```
npm install plugin-please
```

## Loading

Be sure to `require` the PluginManager
```js
var PluginManager = require("plugin-please");
```

To use a custom directory, run on import:
```js
var directory = "//path/to/plugins"
var PluginManager = require("plugin-please")(directory);
```

Then you can load plugins using a file name

```js
var filename = "awesome-plugin";
PluginManager.plugin(directory); // imports awesome-plugin.js
```

This will return a `plugin` object. (You can run this command multiple times to return a new instance of the object.)

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

Hooks are the primary way by which plugins can extend an application. Place them in your project at various key locations, and give them a helpful name. 

Code registered to a hook can be executed using 

```js
PluginManager.hook
```

TODO: continue here

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

module.exports = awesome;
```
