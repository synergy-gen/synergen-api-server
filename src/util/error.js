class SynergenError extends Error {
    constructor(code, message) {
        if (!message) {
            message = code;
            code = ErrorCodes.EXTERNAL;
        }
        super(message);
        this.code = code;
    }
}

const ErrorCodes = Object.freeze({
    EXTERNAL: 1,
    M_INVALID_FORMAT: 100,
    A_AUTH_TOKEN_FAILURE: 200,
    F_FILE_FAILURE: 300
});

/**
 * Translates a third-party library error into an error recognizable by the PlayBook backend.
 * 
 * @param {object} err the error from the MongoDB query (or another source)
 * @param {string} action the action that was being performed when the error occured
 */
function translate(err, action) {
    switch (err.name) {
        case 'StrictModeError':
            return new SynergenError(ErrorCodes.M_INVALID_FORMAT, `Failed to ${action}: invalid format`);
        default:
            return new SynergenError(`Failed to ${action}: ${err.message}`);
    }
}

module.exports = {
    SynergenError,
    ErrorCodes,
    translate
};
