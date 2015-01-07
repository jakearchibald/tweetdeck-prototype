class MemoryKeyValueStore {
    constructor() {
        this.store = {};
    }

    get(key) {
        return new Promise(resolve => {
            if (typeof this.store[key] === 'undefined') {
                throw Error('Not found');
            }
            return resolve(this.store[key]);
        });
    }

    getMany(keys) {
        return Promise.all(keys.map(this.get, this));
    }

    put(key, value) {
        return new Promise(resolve => {
            this.store[key] = value;
            return resolve(value);
        });
    }
}

module.exports = MemoryKeyValueStore;
