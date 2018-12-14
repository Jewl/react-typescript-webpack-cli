let plugins = [
    require('postcss-preset-env')({
        stage: 2,
        browsers: 'last 2 versions'
    })
];

module.exports = {
    plugins
};
