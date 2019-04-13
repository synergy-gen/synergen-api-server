const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const handlers = require('./auth.handlers');

const authRouter = express.Router();

const parseJson = bodyParser.json();

authRouter.get('/auth', passport.authenticate('jwt', { session: false }), handlers.verifyAuthorized);
authRouter.put('/auth', parseJson, handlers.login);

module.exports = authRouter;
