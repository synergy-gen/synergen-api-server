const joi = require('joi');
const uuid = require('uuid/v4');
const moment = require('moment');
const SynergenError = require('../util/synergen-error');
const Goal = require('./goal.model');

/**
 * The schema for a User in the Synergen service
 */
const UserSchema = joi.object().keys({
    _id: joi.string(),
    username: joi.string().alphanum(),
    validated: joi.boolean(),
    seenSystemMessage: joi.number().integer(),
    name: joi.string(),
    slogan: joi.string().allow(null),
    email: joi.string().email(),
    phone: joi.string(),
    avatar: joi.object().keys({
        mime: joi.string(),
        file: joi.string()
    }),
    friends: joi.array().items(joi.string()),
    goals: joi.array().items(Goal.schema),
    createDate: joi.date(),
    updateDate: joi.date().allow(null),
    lastLogin: joi.date()
});

/**
 * Represents information associated with a user object in the Synergen service. When properties are passed to the
 * constructor, thos properties will be strictly validated against a schema. Strict means that all fields in the
 * schema are required for validation to pass.
 * @param {Object} props the object containing the data to validate and populate the instance of the User object with
 * @throws {SynergenError}
 */
class User {
    constructor(props) {
        if (props) {
            let errors = User.validate(props);
            if (errors) {
                throw new SynergenError('Invalid format for user props', errors);
            }
        }
        this.id = props._id || uuid();
        this.username = props.username || null;
        this.validated = props.validated || false;
        this.seenSystemMessage = props.seenSystemMessage || 0;
        this.name = props.name || null;
        this.slogan = props.slogan || null;
        this.email = props.email || null;
        this.phone = props.phone || null;
        this.avatar = {
            mime: (props.avatar && props.avatar.mime) || null,
            file: (props.avatar && props.avatar.file) || null
        };
        this.friends = props.friends || [];
        this.goals = (props.goals && props.goals.map(g => new Goal(g))) || [];
        this.createDate = props.createDate || new Date();
        this.updateDate = props.updateDate || null;
        this.lastLogin = props.lastLogin || null;
    }

    /**
     * Returns a plain JSON representation of the User object to send in the body of an HTTP request/response
     * @param {String} url the url pointing to the location of the User resource
     * @returns {Object}
     */
    serialize(url) {
        let body = {
            id: this.id,
            username: this.username,
            validated: this.validated,
            seenSystemMessage: this.seenSystemMessage,
            name: this.name,
            slogan: this.slogan,
            email: this.email,
            phone: this.phone,
            friends: this.friends,
            goals: this.goals.map(g => g.serialize(url ? url + '/goals/' + g.id : undefined)),
            createDate: moment(this.createDate).format('YYYY-MM-DD'),
            updateDate: this.updateDate ? moment(this.updateDate).format('YYYY-MM-DD') : null,
            lastLogin: this.updateDate ? moment(this.lastLogin).format('YYYY-MM-DD') : null
        };
        if (url) {
            body._links = {
                self: url,
                avatar: url + '/avatar'
            };
        }
        return body;
    }

    /**
     * Validate a plain object against the User schema. Useful for validating incoming HTTP request bodies and
     * objects retrieved from the database.
     * @param {Object} body the object to validate against the User schema
     * @param {Boolean} strict indicates whether schema properties are required or optional
     * @returns {Array|null} an array of schema violations if present, null otherwise
     */
    static validate(body, strict = true) {
        let options = {
            presence: strict ? 'required' : 'optional'
        };
        let result = joi.validate(body, UserSchema, options);
        if (result) return result.error.details.map(d => d.message);
        return null;
    }
}

module.exports = User;
