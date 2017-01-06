const config = require('@ionic/app-scripts/config/copy.config');

module.exports = Object.assign(config, {
    copyProdConfig: {
        src: ['config/config.prod.ts'],
        dest: '{{SRC}}/app/config.ts'
    }
});
