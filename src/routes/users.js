const express = require('express');
const responseMiddleware = require('./handlers/response');
const handlers = require('./handlers/users');

const usersRouter = express.Router();

const parseJsonBody = express.json();

usersRouter.get('/users', parseJsonBody, responseMiddleware(handlers.getUser));