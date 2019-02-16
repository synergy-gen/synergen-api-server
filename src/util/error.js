class SynergenError extends Error {
    constructor(message, code = SynergenError.Codes.EXTERNAL, details = null) {
        super(message);
        this.code = code;
        this.details = details;
    }
}

SynergenError.Codes = Object.freeze({
    EXTERNAL: 1,
    M_INVALID_FORMAT: 100,
    A_AUTH_TOKEN_FAILURE: 200,
    F_FILE_FAILURE: 300
});

module.exports = {
    SynergenError
};
