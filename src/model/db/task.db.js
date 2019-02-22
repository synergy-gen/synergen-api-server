const joi = require('joi');

const TaskSchema = joi.object().keys({
    _id: joi.string().required(),
    details: joi
        .string()
        .allow('')
        .required(),
    type: joi.string().valid(['check']),
    data: joi.object().allow(null),
    createDate: joi
        .number()
        .integer()
        .required(),
    updateDate: joi
        .number()
        .integer()
        .allow(null)
});

module.exports = {
    validate: obj => {
        let results = joi.validate(obj, TaskSchema);
        if (results.error) {
            return results.error.details.map(detail => detail.message);
        }
        return null;
    },
    TaskSchema
};
