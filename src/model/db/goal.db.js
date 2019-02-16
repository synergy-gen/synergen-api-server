const joi = require('joi');
const { TaskSchema } = require('./task.db');

const GoalSchema = joi.object().keys({
    _id: joi.string().required(),
    title: joi.string().required(),
    description: joi.string().required(),
    tasks: joi
        .array()
        .items(TaskSchema)
        .required(),
    creator: joi.string().required(),
    public: joi.bool().required(),
    adoptions: joi.number().integer(),
    parent: joi.string().allow(['', null]),
    tags: joi.array().items(joi.string()),
    createDate: joi
        .number()
        .integer()
        .required(),
    updateDate: joi
        .number()
        .integer()
        .allow(null),
    beginDate: joi
        .number()
        .integer()
        .allow(null),
    targetDate: joi
        .number()
        .integer()
        .allow(null)
});

module.exports = {
    validate: obj => {
        let result = joi.validate(obj, GoalSchema);
        if (result.error) {
            return result.error.details.map(detail => detail.message);
        }
        return null;
    },
    GoalSchema,
    goalCollectionName: 'goals'
};
