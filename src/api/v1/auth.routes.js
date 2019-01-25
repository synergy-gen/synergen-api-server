const express = require('express');
const passport = require('passport');
const handlers = require('./auth.handlers');

const authRouter = express.Router();

authRouter.get('/auth', passport.authenticate('jwt', { session: false }), handlers.verifyAuthorized);
authRouter.put('/auth', handlers.login);

module.exports = authRouter;
