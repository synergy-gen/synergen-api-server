const joi = require('joi');
const { GoalSchema } = require('./goal.db');

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
    lastLogin: joi
        .number()
        .integer()
        .required(),
    goals: joi
        .array()
        .items(GoalSchema)
        .required(),
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
