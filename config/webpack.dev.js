const path = require('path');
const WriteFilePlugin = require('write-file-webpack-plugin');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        port: 8888,
        proxy: {
            '/h5': {
                // 末位不加'/'无法转发接口请求
                target: 'http://example.com/',
                changeOrigin: true
            }
        }
    },
    optimization: {
        splitChunks: {
            chunks: 'all'
        }
    },
    plugins: [
        new WriteFilePlugin()
    ]
});
