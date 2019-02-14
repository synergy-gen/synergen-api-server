const express = require('express');
const handlers = require('./users.handlers');
const passport = require('passport');
const validate = require('./validate');
const joi = require('joi');

const usersRouter = express.Router();

const authentictionMiddleware = passport.authenticate('jwt', { session: false });

const nameRegex = /^[a-zA-Z\s\-]$/;

usersRouter.post(
    '/users',
    validate(
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
    validate(
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
                .optional(),
            password: joi.string().required()
        })
    ),
    handlers.updateUser
);

usersRouter.delete('/users/:id', authentictionMiddleware, handlers.deleteUser);

usersRouter.post(
    '/users/:id/goals',
    authentictionMiddleware,
    validate(
        'add new goal to user',
        joi.object().keys({
            title: joi
                .string()
                .alphanum()
                .required(),
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
            targetDate: joi
                .number()
                .integer()
                .optional(),
            parent: joi.string().optional(),
            public: joi.bool().optional()
        })
    ),
    handlers.addGoalToUser
);

usersRouter.patch(
    '/users/:uid/goals/:gid',
    authentictionMiddleware,
    validate(
        "update user's goal",
        joi.object().keys({
            title: joi
                .string()
                .alphanum()
                .optional(),
            description: joi.string().required(),
            tags: joi
                .array()
                .items(joi.string())
                .optional(),
            targetDate: joi
                .number()
                .integer()
                .optional()
        })
    ),
    handlers.updateUserGoal
);

module.exports = usersRouter;
