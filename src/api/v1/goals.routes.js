const express = require('express');
const handlers = require('./goals.handlers');
const validateRequest = require('./validate');
const joi = require('joi');
const passport = require('passport');

const goalsRouter = express.Router();

const authorizeRequest = passport.authenticate('jwt', { session: false });

goalsRouter.get(
    '/goals',
    authorizeRequest,
    validateRequest(
        'retrieve goals',
        joi.object().keys({
            q: joi.string(),
            creator: joi.string()
        }),
        true
    ),
    handlers.getPublicGoals
);

goalsRouter.post(
    '/goals',
    authorizeRequest,
    validateRequest(
        'publish goal',
        joi.object().keys({
            title: joi.string().required(),
            description: joi.string().required(),
            tasks: joi
                .array()
                .items(joi.string())
                .required(),
            tags: joi
                .array()
                .items(joi.string())
                .required(),
            creator: joi.string().required()
        })
    ),
    handlers.addPublicGoal
);

goalsRouter.post(
    '/goals/:id/adoptions',
    authorizeRequest,
    validateRequest('adopt goal', joi.object().keys({ uid: joi.string().required() })),
    handlers.adoptPublicGoal
);

module.exports = goalsRouter;
