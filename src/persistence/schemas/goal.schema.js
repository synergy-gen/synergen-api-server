const joi = require('joi');
const { TaskSchema } = require('./task.schema');

const GoalSchema = joi.object().keys({
    _id: joi.string().required(),
    title: joi.string().required(),
    description: joi.string().required(),
    tasks: joi
        .array()
        .items(TaskSchema)
        .required(),
    creator: joi.string().required(),
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

const PublicGoalSchema = joi.object().keys({
    title: joi.string().required(),
    description: joi.string().required(),
    tasks: joi
        .array()
        .items(joi.string())
        .required(),
    adoptions: joi.number().integer()
});

const PublicGoalPackageSchema = joi.object().keys({
    _id: joi.string().required(),
    latest: PublicGoalSchema.required(),
    previous: joi
        .array()
        .items(PublicGoalSchema)
        .allow([])
        .required(),
    creator: joi.string().required(),
    tags: joi.array().items(joi.string()),
    parent: joi.string().allow(['', null]),
    publishDate: joi
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
        let result = joi.validate(obj, PublicGoalPackageSchema);
        if (result.error) {
            return result.error.details.map(detail => detail.message);
        }
        return null;
    },
    GoalSchema,
    PublicGoalSchema,
    PublicGoalPackageSchema,
    goalCollectionName: 'goals'
};
