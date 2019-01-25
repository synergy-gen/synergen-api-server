const httpStatus = require('http-status');
const { ErrorCodes } = require('../../util/error');

function sendQueryResponse(res, status, data) {
    res.status(status).json(data || {});
}

function sendActionResponse(res, status, message, content) {
    res.status(status).json({
        timestamp: Date.now(),
        message: `${message}`,
        content: content || {}
    });
}

function sendErrorResponse(res, err, actionOrMessage) {
    if (typeof err === 'number') {
        return res.status(err).json({
            timestamp: Date.now(),
            message: actionOrMessage
        });
    } else {
        switch (err.code) {
            case ErrorCodes.M_INVALID_FORMAT:
                return res.status(httpStatus.BAD_REQUEST).json({
                    timestamp: Date.now(),
                    message: `Failed to ${actionOrMessage}: improperly formatted request`
                });
            case ErrorCodes.A_AUTH_TOKEN_FAILURE:
                return res.status(httpStatus.UNAUTHORIZED).json({
                    timestamp: Date.now(),
                    message: `Failed to ${actionOrMessage}: invalid token`
                });
            case ErrorCodes.F_FILE_FAILURE:
                return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                    timestamp: Date.now(),
                    message: `Failed to ${actionOrMessage}: file failure`
                });
            default:
                return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                    timestamp: Date.now(),
                    message: `Failed to ${actionOrMessage}`
                });
        }
    }
}

module.exports = {
    sendQueryResponse,
    sendActionResponse,
    sendErrorResponse
};
