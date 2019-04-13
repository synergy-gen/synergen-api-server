const SynergenError = require('../../util/synergen-error');

module.exports = (err, req, res, next) => {
    if(res.headersSent) {
        return next(err);
    }

    let message = 'Unable to handle the request';
    let content = {};
    if(!(err instanceof SynergenError )){
        // Some unknown error occured that we have not handled before
        res.status(500)
    } else {
        res.status(err.code);
        message = err.message;
        if(err.details && err.shareDetails) content.details = err.details;
    }
    
    res.json({
        success: false,
        code: res.statusCode,
        status: res.statusMessage,
        message,
        content
    });
}