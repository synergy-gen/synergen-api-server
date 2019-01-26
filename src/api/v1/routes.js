const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const apiRouter = express.Router();
const passport = require('passport');
const authToken = require('../../util/auth-token');
const users = require('./users.routes');
const auth = require('./auth.routes');

authToken.createPassportStrategy((err, strategy) => {
    if (err) throw new Error('Failed to create passport strategy: ' + err.message);
    passport.use(strategy);
    apiRouter.use(bodyParser.json());
    apiRouter.use(cookieParser());
    apiRouter.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE');
        next();
    });

    let prefix = '/api/v1';

    // For the auth and user routes, not all of them should be authenticated. Otherwise we won't be able to login or
    // add a new user
    apiRouter.use(prefix, auth);
    apiRouter.use(prefix, users);
    
    // All other routes should be protected and require a token
    apiRouter.use(passport.authenticate('jwt', { session: false }));
});

module.exports = apiRouter;
