const joi = require('joi');
const uuid = require('uuid/v4');
const moment = require('moment');
const SynergenError = require('../util/synergen-error');

/**
 * The schema for a Task in the Synergen service
 */
const TaskSchema = joi.object().keys({
    _id: joi.string(),
    details: joi.string(),
    createDate: joi.date(),
    updateDate: joi.date().allow(null)
});

/**
 * Represents information associated with a task object in the Synergen service. When properties are passed to the
 * constructor, thos properties will be strictly validated against a schema. Strict means that all fields in the
 * schema are required for validation to pass.
 * @param {Object} props the object containing the data to validate and populate the instance of the Task object with
 * @throws {SynergenError}
 */
class Task {
    constructor(props) {
        if (props) {
            let errors = Task.validate(props);
            if (errors) {
                throw new SynergenError('Invalid format for task', errors);
            }
        }
        this.id = props._id || uuid();
        this.details = props.details || null;
        this.createDate = props.createDate || new Date();
        this.updateDate = props.updateDate || null;
    }

    /**
     * Returns a plain JSON representation of the Task object to send in the body of an HTTP request/response
     * @param {String} url the url pointing to the location of the task resource
     * @returns {Object}
     */
    serialize(url) {
        let body = {
            id: this.id,
            details: this.details,
            createDate: moment(this.createDate).format('YYYY-MM-DD'),
            updateDate: this.updateDate ? moment(this.updateDate).format('YYYY-MM-DD') : null,
            _links: {}
        };
        if (url) body._links.self = url;
        return body;
    }

    /**
     * Validate a plain object against the Task schema. Useful for validating incoming HTTP request bodies and
     * objects retrieved from the database.
     * @param {Object} body the object to validate against the Task schema
     * @param {Boolean} strict indicates whether schema properties are required or optional
     * @returns {Array|null} an array of schema violations if present, null otherwise
     */
    static validate(body, strict = true) {
        let options = {
            presence: strict ? 'required' : 'optional'
        };
        let result = joi.validate(body, TaskSchema, options);
        if (result) {
            return result.error.details.map(d => d.message);
        }
        return null;
    }
}

// Expose the schema to use in other model schemas
Task.schema = TaskSchema;

module.exports = Task;
