const joi = require('joi');
const { GoalSchema } = require('./goal.schema');

const UserSchema = joi.object().keys({
    _id: joi.string().required(),
    username: joi
        .string()
        .alphanum()
        .required(),
    name: joi
        .string()
        .regex(/[a-zA-Z\s\-]/)
        .required(),
    email: joi
        .string()
        .email()
        .required(),
    slogan: joi
        .string()
        .required()
        .allow(null),
    lastLogin: joi
        .number()
        .integer()
        .required(),
    goals: joi
        .array()
        .items(GoalSchema)
        .required(),
    avatar: joi.object().keys({
        file: joi
            .string()
            .required()
            .allow(null),
        mime: joi
            .string()
            .required()
            .allow(null)
    }),
    createDate: joi.number().integer(),
    updateDate: joi
        .number()
        .integer()
        .allow(null)
});

module.exports = {
    validate: obj => {
        let result = joi.validate(obj, UserSchema);
        if (result.error) {
            return result.error.details.map(detail => detail.message);
        }
        return null;
    },
    userCollectionName: 'users'
};
