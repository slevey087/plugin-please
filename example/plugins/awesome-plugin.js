// In awesome-plugin.js
module.exports = function awesomePlugin() {
    // setup code here, runs when plugin is imported
    console.log("there will be awesome later")
    return {
        init() {
            console.log("hope you're ready for awesome")
            // code to run when plugin is initialized
        },
        hooks: {
            "before-load"() {
                // code to run at the 'before-load' hook
                console.log("awesome")
            },
            "after-load"() {
                // code to run at the 'after-load' hook
                console.log("still awesome")
            }
        },

        stop() {
            // tear down
            console.log("the awesome is over. go home.")
        }
    }
}