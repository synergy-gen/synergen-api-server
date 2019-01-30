const UserModel = require('../../model/user.model');
const AuthModel = require('../../model/auth.model');
const response = require('./response');
const status = require('http-status');
const logger = require('winstonson')(module);
const crypto = require('crypto');
const config = require('config');
const security = require('../../util/security');
const _config = config.get('security');

module.exports = {
    getUser,
    addNewUser,
    updateUser,
    deleteUser,
    generateUserResponse
};

function generateResourceUrl(user) {
    return `http://localhost:8080/api/v1/users/${user.id}`;
}

function generateUserResponse(user) {
    let self = generateResourceUrl(user);
    let u = { ...user };
    u._links = {
        self,
        tasks: self + '/tasks',
        goals: self + '/goals',
        objectives: self + '/objectives'
    };
    u.tasks = u.tasks.map(t => ({
        ...t,
        _links: {
            self: `${self}/tasks/${t.id}`
        }
    }));
    u.goals = u.goals.map(g => ({
        ...g,
        tasks: g.tasks.map(t => ({
            ...t,
            _links: `${self}/goals/${g.id}/tasks/${t.id}`
        })),
        _links: {
            self: `${self}/goals/${g.id}`
        }
    }));
    return u;
}

async function addNewUser(req, res) {
    try {
        if (!req.body.username || !req.body.password) {
            return response.sendErrorResponse(res, status.BAD_REQUEST, 'Missing username and/or password');
        }
        logger.trace('Verifying user does not already exist');
        let user = await UserModel.find({ username: req.body.username });
        if (user !== undefined) {
            return response.sendOkResponse(res, status.OK, 'User already exists', user);
        }
        logger.trace('Adding new user with username ' + req.body.username);
        user = new UserModel.User(req.body);
        user.lastLogin = Date.now();
        user = await UserModel.merge(user);
        logger.trace('Added user. Generating authentication entry');
        let salt = crypto.randomBytes(8).toString('hex');
        let algo = _config.hashAlgo;
        let h = security.hash(algo, salt, req.body.password);
        await AuthModel.merge(new AuthModel.AuthInfo({ user: user.id, salt, algo, hash: h }));
        logger.trace('Authentication entry added. Preparing response');
        let resBody = generateUserResponse(user);
        return response.sendOkResponse(res, status.CREATED, 'Successfully created new user', resBody);
    } catch (err) {
        logger.error(err);
        return response.sendErrorResponse(res, err, 'add new user');
    }
}

async function getUser(req, res) {
    try {
        logger.trace('Retrieving user');
        let user = await UserModel.find({ id: req.params.id });
        let resBody = generateUserResponse(user);
        return response.sendOkResponse(res, status.OK, 'Successfully retrieved user information', resBody);
    } catch (err) {
        logger.error(err);
        return response.sendErrorResponse(res, err, 'retrieve user');
    }
}

async function updateUser(req, res) {
    try {
        logger.trace('Updating user information for user ' + req.params.id);
        req.body.id = req.params.id;
        let updatedUser = await UserModel.merge(req.body);
        logger.trace('User updated. Preparing and sending response');
        let resBody = generateUserResponse(updatedUser);
        return response.sendOkResponse(res, status.OK, 'Successfully saved user', resBody);
    } catch (err) {
        return response.sendErrorResponse(res, err, 'save user');
    }
}

async function deleteUser(req, res) {
    try {
        logger.trace('Removing user ' + req.params.id);
        let removed = await UserModel.remove({ id: req.params.id });
        if (!removed) {
            logger.warn('Failed to remove user: could not find user with id ' + req.params.id);
            return response.sendOkResponse(res, status.NOT_FOUND, 'Failed to find user to remove');
        }
        logger.trace('Removed user');
        return response.sendOkResponse(res, status.OK, 'Successfully removed user');
    } catch (err) {
        logger.error(err);
        return response.sendErrorResponse(res, err, 'remove user');
    }
}
