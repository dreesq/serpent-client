const {get: getValue} = require('./utils');

class Config {
    constructor() {
        this.storage = {};
    }

    store(data) {
        this.storage = data;
    }

    get(key, defaultValue) {
        return getValue(this.storage, key, defaultValue);
    }
}

export default new Config();