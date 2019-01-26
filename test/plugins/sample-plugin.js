// In awesome-plugin.js
module.exports = function awesomePlugin(context) {
    // setup code here
    var name = context.name ? { name: context.name } : {}
    return Object.assign({
        init() {
            // code to run when plugin is activated
        },
        hooks: {
            ["before-load"]() {
                // code to run at the 'before-load' hook
            },
            ["after-load"]() {
                // code to run at the 'after-load' hook
            }
        }
    }, name)
}