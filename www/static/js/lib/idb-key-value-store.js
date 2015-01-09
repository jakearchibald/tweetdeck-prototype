var IndexedDouchebag = require('./indexeddouchebag');

class IDBKeyValueStore {
    constructor() {
        this.store = new IndexedDouchebag('key-value-store', 1, function(db, oldVersion) {
            if (oldVersion < 1 || oldVersion === 9223372036854776000) {
                db.createObjectStore('key-value-store');
            }
        });
    }

    get(key) {
        return this.store.get('key-value-store', key)
            .catch(why => { throw Error('Not found') });
    }

    getMany(keys) {
        return Promise.all(keys.map(this.get, this));
    }

    put(key, value) {
        return this.store.put('key-value-store', key, value)
            .then(_ => value);
    }
}

module.exports = IDBKeyValueStore;
