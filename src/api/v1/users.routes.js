const express = require('express');
const bodyParser = require('body-parser');
const handlers = require('./users.handlers');
const passport = require('passport');
const validateRequest = require('./validate');
const joi = require('joi');

const usersRouter = express.Router();

const authentictionMiddleware = passport.authenticate('jwt', { session: false });

const parserJson = bodyParser.json();

const parseRawBody = bodyParser.raw({ limit: '2mb', type: 'image/*' });

const nameRegex = /[a-zA-Z\s\-]/;

usersRouter.post(
    '/users',
    parserJson,
    validateRequest(
        'add new user',
        joi.object().keys({
            name: joi
                .string()
                .regex(nameRegex)
                .required(),
            username: joi
                .string()
                .alphanum()
                .required(),
            email: joi
                .string()
                .email()
                .required(),
            password: joi.string().required()
        })
    ),
    handlers.addNewUser
);

usersRouter.get('/users/:id', authentictionMiddleware, handlers.getUser);

usersRouter.patch(
    '/users/:id',
    authentictionMiddleware,
    parserJson,
    validateRequest(
        'update user information',
        joi.object().keys({
            name: joi
                .string()
                .regex(nameRegex)
                .optional(),
            username: joi
                .string()
                .alphanum()
                .optional(),
            email: joi
                .string()
                .email()
                .optional()
        })
    ),
    handlers.updateUser
);

usersRouter.put('/users/:id/avatar', authentictionMiddleware, parseRawBody, handlers.updateUserAvatar);
usersRouter.get('/users/:id/avatar', handlers.getUserAvatar);

usersRouter.post(
    '/users/:id/goals',
    authentictionMiddleware,
    parserJson,
    validateRequest(
        'add new goal to user',
        joi.object().keys({
            title: joi.string().required(),
            description: joi.string().required(),
            tasks: joi
                .array()
                .items(joi.string())
                .required(),
            creator: joi.string().required(),
            tags: joi
                .array()
                .items(joi.string())
                .required(),
            beginDate: joi
                .number()
                .integer()
                .optional(),
            targetDate: joi
                .number()
                .integer()
                .optional(),
            parent: joi.string().optional()
        })
    ),
    handlers.addGoalToUser
);

usersRouter.patch(
    '/users/:uid/goals/:gid',
    authentictionMiddleware,
    parserJson,
    validateRequest(
        "update user's goal",
        joi.object().keys({
            title: joi.string(),
            description: joi.string(),
            tags: joi.array().items(joi.string()),
            tasks: joi.array().items(
                joi.object().keys({
                    id: joi.string(),
                    details: joi.string()
                })
            ),
            beginDate: joi
                .number()
                .integer()
                .optional(),
            targetDate: joi
                .number()
                .integer()
                .optional()
        })
    ),
    handlers.updateUserGoal
);

usersRouter.delete('/users/:uid/goals/:gid', authentictionMiddleware, handlers.removeGoalFromUser);

module.exports = usersRouter;
