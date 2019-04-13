const joi = require('joi');

const AuthSchema = joi.object().keys({
    _id: joi.string().required(),
    user: joi
        .string()
        .alphanum()
        .required(),
    salt: joi.string().required(),
    hash: joi.string().required(),
    algo: joi
        .string()
        .valid(['sha256'])
        .required()
});

module.exports = {
    validate: obj => {
        let results = joi.validate(obj, AuthSchema);
        if (results.error) {
            return results.error.details.map(detail => detail.message);
        }
        return null;
    },
    authCollectionName: 'auth'
};
