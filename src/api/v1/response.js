const httpStatus = require('http-status');
const { ErrorCodes } = require('../../util/error');
const apiVersion = 'v1';

function sendOkResponse(res, status, message, content = {}) {
    res.status(status).json({
        api: apiVersion,
        succuess: true,
        status: status,
        timestamp: Date.now(),
        message,
        content
    });
}

function sendErrorResponse(res, err, actionOrMessage) {
    let response = {
        api: apiVersion,
        success: false,
        status: 0,
        timestamp: Date.now(),
        content: {},
        message: ''
    };
    if (typeof err === 'number') {
        response.message = actionOrMessage;
        response.status = err;
        return res.status(response.status).json(response);
    } else {
        switch (err.code) {
            case ErrorCodes.M_INVALID_FORMAT:
                response.status = httpStatus.BAD_REQUEST;
                response.message = `Failed to ${actionOrMessage}: improperly formatted request`;
                return res.status(response.status).json(response);
            case ErrorCodes.A_AUTH_TOKEN_FAILURE:
                response.status = httpStatus.UNAUTHORIZED;
                response.message = `Failed to ${actionOrMessage}: invalid token`;
                return res.status(response.status).json(response);
            case ErrorCodes.F_FILE_FAILURE:
                response.status = httpStatus.INTERNAL_SERVER_ERROR;
                response.message = `Failed to ${actionOrMessage}: file failure`;
                return res.status(response.status).json(response);
            default:
                response.status = httpStatus.INTERNAL_SERVER_ERROR;
                response.message = `Failed to ${actionOrMessage}`;
                return res.status(response.status).json(response);
        }
    }
}

module.exports = {
    sendOkResponse,
    sendErrorResponse
};
