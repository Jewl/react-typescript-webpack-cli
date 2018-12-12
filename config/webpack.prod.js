const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'production',
    plugins: [
        // 为特定library指定环境变量，比如react，以便做出对应的代码优化
        // 代码里面使用插件定义的环境变量，可以在配置文件之外的代码中获取到，配置文件想要获取需要使用cross-env
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        new MiniCssExtractPlugin({
            filename: 'css/[name].min.css'
        }),
        // css压缩
        new OptimizeCSSAssetsPlugin({})
    ],
    // 提取公共代码，test匹配对应文件，name公共代码名称
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                }
            }
        }
    }
});
