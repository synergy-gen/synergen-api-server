const express = require('express');
const handlers = require('./goals.handlers');

const goalsRouter = express.Router();

goalsRouter.get('/goals')


module.exports = goalsRouter;
