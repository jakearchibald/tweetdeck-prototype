class Request {
    constructor(account, cursor, data) {
        this.account = account;
        this.cursor = cursor;
        this.data = data;
    }
}

class RequestResult {
    constructor(request, result, data) {
        this.request = request;
        this.result = result;
        this.data = data;
    }
}

module.exports =  { Request, RequestResult };
