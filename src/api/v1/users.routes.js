const express = require('express');
const handlers = require('./users.handlers');
const passport = require('passport');

const usersRouter = express.Router();

usersRouter.post('/users', handlers.addNewUser);
usersRouter.get('/users/:id', passport.authenticate('jwt', { session: false }), handlers.getUser);
usersRouter.patch('/users/:id', passport.authenticate('jwt', { session: false }), handlers.updateUser);
usersRouter.delete('/users/:id', passport.authenticate('jwt', { session: false }), handlers.deleteUser);

module.exports = usersRouter;
