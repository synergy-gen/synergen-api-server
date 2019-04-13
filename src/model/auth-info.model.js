const joi = require('joi');
const uuid = require('uuid/v4');
const SynergenError = require('../util/synergen-error');

/**
 * The schema for authentication information in the Synergen service
 */
const AuthInfoSchema = joi.object().keys({
    _id: joi.string(),
    id: joi.string(),
    user: joi.string(),
    salt: joi.string(),
    hash: joi.string(),
    mode: joi.string().valid('sha256')
});

/**
 * Represents authentication information for a user. Anytime an instance is constructed where properties are defined,
 * the properties will be validated against a schema to ensure database integrity.
 */
class AuthInfo {
    constructor(props) {
        // Construct and validate each of the properties
        if (props) {
            let results = AuthInfo.validate(props);
            if (results) {
                throw new SynergenError('Invalid format for AuthInfo props', results);
            }
        }
        this.id = props.id || props._id || uuid();
        this.user = props.user || null;
        this.salt = props.user || null;
        this.hash = props.hash || null;
        this.mode = props.mode || null;
    }

    /**
     * Validate a plain object against the AuthInfo schema. In the cause of AuthInfo, we only validate database data,
     * so we always validate in strict mode
     * @param {Object} body the object to validate against the User schema
     * @returns {Array|null} an array of schema violations if present, null otherwise
     */
    static validate(body) {
        let results = joi.validate(body, AuthInfoSchema, { presence: 'required' });
        if (results) {
            return results.error.details.map(d => d.message);
        }
        return null;
    }
}

module.exports = AuthInfo;
