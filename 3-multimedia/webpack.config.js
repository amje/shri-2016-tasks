module.exports = {
    devtool: 'source-map',
    entry: {
        main: './src/js/App.js'
    },
    output: {
        path: `${__dirname}/public`,
        filename: 'main.js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel',
                exclude: /node_modules/
            }
        ]
    }
};
