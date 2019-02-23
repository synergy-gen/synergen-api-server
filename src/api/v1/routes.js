const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const apiRouter = express.Router();
const passport = require('passport');
const security = require('../../util/security');
const users = require('./users.routes');
const auth = require('./auth.routes');
const goals = require('./goals.routes');

security.createPassportStrategy((err, strategy) => {
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

    apiRouter.use(prefix, auth);
    apiRouter.use(prefix, users);
    apiRouter.use(prefix, goals);
});

module.exports = apiRouter;
