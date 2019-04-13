class SynergenError extends Error {
    constructor(code = 500, message = 'Unable to handle request', details = null, shareDetails = false) {
        super(message);
        this.details = details;
        this.code = code;
        this.shareDetails = shareDetails;
    }
}

module.exports = SynergenError;
