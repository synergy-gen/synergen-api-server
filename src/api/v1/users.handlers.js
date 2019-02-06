const UserModel = require('../../model/user.model');
const AuthModel = require('../../model/auth.model');
const { Goal } = require('../../model/goal.model');
const response = require('./response');
const status = require('http-status');
const logger = require('winstonson')(module);
const crypto = require('crypto');
const config = require('config');
const security = require('../../util/security');
const _config = config.get('security');

function generateResourceUrl(user) {
    return `http://localhost:8080/api/v1/users/${user.id}`;
}

const self = (module.exports = {
    generateUserResponse: user => {
        let self = generateResourceUrl(user);
        let u = { ...user };
        u._links = {
            self,
            goals: self + '/goals',
            objectives: self + '/objectives'
        };
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
    },

    addNewUser: async (req, res) => {
        try {
            if (!req.body.username || !req.body.password) {
                return response.sendErrorResponse(res, status.BAD_REQUEST, 'Missing username and/or password');
            }
            logger.trace('Verifying user does not already exist');
            let user = await UserModel.find({ username: req.body.username });
            if (user !== undefined) {
                return response.sendErrorResponse(
                    res,
                    status.CONFLICT,
                    `User with username '${user.username}' already exists`
                );
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
            let resBody = self.generateUserResponse(user);
            return response.sendOkResponse(res, status.CREATED, 'Successfully created new user', resBody);
        } catch (err) {
            logger.error(err);
            return response.sendErrorResponse(res, err, 'add new user');
        }
    },

    getUser: async (req, res) => {
        try {
            logger.trace('Retrieving user');
            let user = await UserModel.find({ id: req.params.id });
            let resBody = self.generateUserResponse(user);
            return response.sendOkResponse(res, status.OK, 'Successfully retrieved user information', resBody);
        } catch (err) {
            logger.error(err);
            return response.sendErrorResponse(res, err, 'retrieve user');
        }
    },

    updateUser: async (req, res) => {
        try {
            logger.trace('Updating user information for user ' + req.params.id);
            req.body.id = req.params.id;
            let updatedUser = await UserModel.merge(req.body);
            logger.trace('User updated. Preparing and sending response');
            let resBody = self.generateUserResponse(updatedUser);
            return response.sendOkResponse(res, status.OK, 'Successfully saved user', resBody);
        } catch (err) {
            return response.sendErrorResponse(res, err, 'save user');
        }
    },

    deleteUser: async (req, res) => {
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
    },

    addGoalToUser: async (req, res) => {
        try {
            let goal = new Goal(req.body);
            let user = await UserModel.addGoalToUser(req.param.id, goal);
            if (!user) {
                return response.sendErrorResponse(res, status.BAD_REQUEST, 'Failed to add new goal to user');
            }
            let body = generateUserResponse(user);
            return response.sendOkResponse(res, status.CREATED, 'Successfully added new goal to user', body);
        } catch (err) {
            logger.error(err);
            return response.sendErrorResponse(res, err, 'add goal to user');
        }
    },

    removeGoalFromUser: async (req, res) => {
        try {
            let ok = await UserModel.removeGoalFromUser(req.params.uid, req.params.gid);
            if (!ok) return response.sendErrorResponse(res, status.BAD_REQUEST, 'Failed to remove goal from user');
            return response.sendOkResponse(res, status.OK, 'Successfully removed goal from user');
        } catch (err) {
            logger.error(err);
            return response.sendErrorResponse(res, err, 'add goal to user');
        }
    }
});
