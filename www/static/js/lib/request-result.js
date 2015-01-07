class Request {
    constructor(account, cursor) {
        this.account = account;
        this.cursor = cursor;
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
