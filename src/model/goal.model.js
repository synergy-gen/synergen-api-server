const joi = require('joi');
const uuid = require('uuid/v4');
const moment = require('moment');
const SynergenError = require('../util/synergen-error');
const Task = require('./task.model');

/**
 * The schema for a Goal in the Synergen service
 */
const GoalSchema = joi.object().keys({
    _id: joi.string(),
    title: joi.string(),
    description: joi.string(),
    tasks: joi.array().items(Task.schema),
    creator: joi.string(),
    parent: joi.object().keys({
        id: joi.string(),
        version: joi.number().integer()
    }),
    tags: joi.array().items(joi.string()),
    createDate: joi.date(),
    updateDate: joi.date()
});

/**
 * Represents information associated with a goal object in the Synergen service. When properties are passed to the
 * constructor, thos properties will be strictly validated against a schema. Strict means that all fields in the
 * schema are required for validation to pass.
 * @param {Object} props the object containing the data to validate and populate the instance of the Goal object with
 * @throws {SynergenError}
 */
class Goal {
    constructor(props) {
        if (props) {
            let errors = Goal.validate(props);
            if (errors) {
                throw new SynergenError('Invalid format for goal props', errors);
            }
        }
        this.id = props._id || uuid();
        this.title = props.title || null;
        this.description = props.description || null;
        this.tasks = (props.tasks && props.tasks.map()) || [];
        this.creator = props.creator || null;
        this.parent = {
            id: (props.parent && props.parent.id) || null,
            version: (props.parent && props.parent.version) || null
        };
        this.tags = props.tags || [];
        this.createDate = props.createDate || new Date();
        this.updateDate = props.updateDate || null;
    }

    /**
     * Returns a plain JSON representation of the Goal object to send in the body of an HTTP request/response
     * @param {String} url the url pointing to the location of the Goal resource
     * @returns {Object}
     */
    serialize(url) {
        let body = {
            id: this.id,
            title: this.title,
            description: this.description,
            tasks: this.tasks.map(t => t.serialize(`${url}/tasks/${t.id}`)),
            creator: this.creator,
            parent: this.parent,
            tags: this.tags,
            createDate: moment(this.createDate).format('YYYY-MM-DD'),
            updateDate: this.updateDate ? moment(this.updateDate).format('YYYY-MM-DD') : null,
            _links: {}
        };
        if (url) body._links.self = url;
        return body;
    }

    /**
     * Validate a plain object against the Goal schema. Useful for validating incoming HTTP request bodies and
     * objects retrieved from the database.
     * @param {Object} body the object to validate against the Goal schema
     * @param {Boolean} strict indicates whether schema properties are required or optional
     * @returns {Array|null} an array of schema violations if present, null otherwise
     */
    static validate(body, strict = true) {
        let options = {
            presence: strict ? 'required' : 'optional'
        };
        let result = joi.validate(body, GoalSchema, options);
        if (result) {
            return result.error.details.map(d => d.message);
        }
        return null;
    }
}

// Expose the schema for use in other models
Goal.schema = GoalSchema;

module.exports = Goal;
