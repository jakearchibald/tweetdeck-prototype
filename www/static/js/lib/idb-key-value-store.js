var IndexedDouchebag = require('./indexeddouchebag');

class IDBKeyValueStore {
    constructor() {
        this.store = new IndexedDouchebag('tweet-store', 1, function(db, oldVersion) {
            if (oldVersion < 1 || oldVersion === 9223372036854776000) {
                db.createObjectStore('tweet-store');
            } 
        });
    }

    get(key) {
        return this.store.get('tweet-store', key)
            .catch(why => { throw Error('Not found') });
    }

    getMany(keys) {
        return Promise.all(keys.map(this.get, this));
    }

    put(key, value) {
        return this.store.put('tweet-store', key, value)
            .then(_ => value);
    }
}

module.exports = IDBKeyValueStore;
