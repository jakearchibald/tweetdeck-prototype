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
        return keys.map(this.get, this);
    }

    put(key, value) {
        this.store[key] = value;
        return value;
    }
}

module.exports = MemoryKeyValueStore;
