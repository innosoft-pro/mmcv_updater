var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    devtool: 'eval',
    entry: [
        './src/index'
    ],
    output: {
        path: path.join(__dirname, '..', 'static'),
        filename: 'bundle.js',
    },
    resolve: {
        extensions: ['', '.js', '.jsx'],
        modules: ['node_modules']
    },
    module: {
        loaders: [
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
            },
            {
                test: /\.jsx?$/,
                loaders: ['babel'],
                include: path.join(__dirname, 'src')
            },
            {
                test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                include: path.join(__dirname, 'images'),
                loader: 'file?name=images/[name].[ext]',
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('[name].css')
    ]
};
