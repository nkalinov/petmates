module.exports = {
    include: [
        {
            src: 'src/assets/',
            dest: 'www/assets/'
        },
        {
            src: 'src/index.html',
            dest: 'www/index.html'
        },
        {
            src: 'node_modules/ionic-angular/polyfills/polyfills.js',
            dest: 'www/build/polyfills.js'
        },
        {
            src: 'src/vendor/leaflet.markercluster.layersupport-src.js',
            dest: 'www/build/leaflet.markercluster.layersupport-src.js'
        },
        {
            src: 'node_modules/ionicons/dist/fonts/',
            dest: 'www/assets/fonts/'
        }
    ]
};
