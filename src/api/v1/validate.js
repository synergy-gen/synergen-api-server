const response = require('./response');
const status = require('http-status');
const joi = require('joi');

module.exports = (action, schema, query) => (req, res, next) => {
    let result = query ? joi.validate(req.query, schema) : joi.validate(req.body, schema);
    if (result.error) {
        let errors = result.error.details.map(d => d.message);
        return response.sendErrorResponse(res, status.BAD_REQUEST, 'Failed to ' + action, errors);
    }
    next();
};
