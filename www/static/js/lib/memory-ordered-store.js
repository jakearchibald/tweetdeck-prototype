class MemoryOrderedStore {
    constructor() {}

    fetch(request) {
        return new Promise(resolve => {
            throw Error('Not implemented');
        });
        // request interval must be contiguous with items
        // result must not contain a gap
    }

    putMany(x) {
        // TODO
        return x;
    }
}

module.exports = MemoryOrderedStore;
