// process.traceDeprecation = true; // To find which plugin(s) is causing the warning
// instead google-fonts-webpack-plugin to fix a problem with webpack
const GoogleFontsPlugin = require("@beyonk/google-fonts-webpack-plugin");


module.exports = {
    configureWebpack: {
        plugins: [
            new GoogleFontsPlugin({
                fonts: [
                    {family: "Sedgwick Ave"},
                    {family: "Montserrat"}
                ]
            })
        ]
    },
    publicPath: '/website/'
};