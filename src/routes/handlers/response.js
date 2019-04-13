/**
 * @callback ResponseHandler An asynchronous function to handle the HTTP request
 * @param {Request} req a reference to the HTTP Request object
 * @param {Response} res a reference to the HTTP Response object
 * @param {Function} [next] an optional handler callback for the next middleware handler in the Express chain
 * @returns {Function}
 */

/**
 * @param {ResponseHandler} fn the asynchronous function handling the HTTP request
 */
function responseMiddleware(fn) {

    /**
     * @param {Request} req a reference to the HTTP Request object
     * @param {Response} res a reference to the HTTP Response object
     * @param {Function<string>} next callback function to proceed to the next handler in the Express chain
     */
    function middleware(req, res, next) {
        // Add a function to the response object that will allow it send a response
        res.finish = (message, content = {}) => {
            res.json({
                success: true,
                code: res.status(),
                status: res.statusText,
                message,
                content
            });
        };

        // Wrap the asynchronous function passed as an argument inside a Promise to resolve, thus allowing us
        // to cleanly implement async handlers
        return new Promise(fn(req, res, next)).catch(next);
    }

    return middleware;
}

module.exports = responseMiddleware;
