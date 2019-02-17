const UserModel = require('../../model/user.model');
const AuthModel = require('../../model/auth.model');
const { Goal } = require('../../model/goal.model');
const { Task } = require('../../model/task.model');
const response = require('./response');
const status = require('http-status');
const logger = require('winstonson')(module);
const crypto = require('crypto');
const config = require('config');
const security = require('../../util/security');
const _config = config.get('security');

const _module = (module.exports = {
    addNewUser: async (req, res) => {
        try {
            let username = req.body.username;
            logger.trace('Verifying user does not already exist');
            let user = await UserModel.findByUsername(username);
            if (user) {
                return response.sendErrorResponse(
                    res,
                    status.CONFLICT,
                    `User with username '${user.username}' already exists`
                );
            }

            logger.trace('Adding new user with username ' + username);
            user = new UserModel.User(req.body);
            user.lastLogin = Date.now();
            await UserModel.merge(user);

            logger.trace('Added user. Generating authentication entry');
            let salt = crypto.randomBytes(8).toString('hex');
            let algo = _config.hashAlgo;
            let h = security.hash(algo, salt, req.body.password);
            await AuthModel.merge(new AuthModel.AuthInfo({ user: user.id, salt, algo, hash: h }));

            logger.trace('Authentication entry added. Preparing response');
            let resBody = response.generateUserResponseBody(user);
            return response.sendOkResponse(res, status.CREATED, 'Successfully created new user', resBody);
        } catch (err) {
            logger.error(err);
            return response.sendErrorResponse(res, err, 'add new user');
        }
    },

    getUser: async (req, res) => {
        try {
            logger.trace('Retrieving user');
            let user = await UserModel.find(req.params.id);
            if (!user)
                return response.sendErrorResponse(
                    res,
                    status.NOT_FOUND,
                    'Failed to find user with id ' + req.params.id
                );

            let resBody = response.generateUserResponseBody(user);
            return response.sendOkResponse(res, status.OK, 'Successfully retrieved user information', resBody);
        } catch (err) {
            logger.error(err);
            return response.sendErrorResponse(res, err, 'retrieve user');
        }
    },

    updateUser: async (req, res) => {
        try {
            logger.trace('Updating user information for user ' + req.params.id);
            let user = await UserModel.find(req.params.id);
            await UserModel.merge({ ...user, ...req.body });

            logger.trace('User updated. Preparing and sending response');
            let resBody = response.generateUserResponseBody(user);

            return response.sendOkResponse(res, status.OK, 'Successfully saved user', resBody);
        } catch (err) {
            return response.sendErrorResponse(res, err, 'save user');
        }
    },

    addGoalToUser: async (req, res) => {
        try {
            let user = await UserModel.find(req.params.id);
            let goal = new Goal(req.body);
            user.goals.push(goal);
            await UserModel.merge(user);

            goal.creator = user.username;
            let userUrl = response.resource('/users/' + req.params.uid);
            let body = response.generateGoalResponseBody(goal, userUrl + '/goals/' + goal.id);
            return response.sendOkResponse(res, status.CREATED, 'Successfully added new goal to user', body);
        } catch (err) {
            logger.error(err);
            return response.sendErrorResponse(res, err, 'add goal to user');
        }
    },

    updateUserGoal: async (req, res) => {
        try {
            let user = await UserModel.find(req.params.uid);
            if (!user) return sendErrorResponse(res, status.NOT_FOUND, 'Failed to find user to update');

            let goalIndex = user.goals.findIndex(goal => goal.id === req.params.gid);
            if (goalIndex < 0)
                return sendErrorResponse(res, status.NOT_FOUND, 'Failed to find goal with id ' + req.params.gid);

            let goal = user.goals[goalIndex];
            if (req.body.tasks) {
                let tasks = [];
                req.body.tasks.forEach(task => {
                    if (task.id) {
                        let i = goal.tasks.findIndex(t => t.id === task.id);
                        if (i > 0) goal.tasks[i].details = task.details;
                        tasks.push(goal.tasks[i]);
                    } else {
                        tasks.push(new Task(task));
                    }
                });
                // We've finished processing the tasks. Remove them so that we don't merge them with additional
                // changes
                delete req.body.tasks;
                goal.tasks = tasks;
            }

            user.goals[goalIndex] = { ...goal, ...req.body };
            await UserModel.merge(user);

            let userUrl = response.resource('/users/' + req.params.uid);
            let resBody = response.generateGoalResponseBody(user.goals[goalIndex], userUrl + '/goals/' + goal.id);

            return response.sendOkResponse(res, status.OK, "Successfully updated the user's goal", resBody);
        } catch (err) {
            logger.error(err);
            return response.sendErrorResponse(res, err, "update user's goal");
        }
    },

    removeGoalFromUser: async (req, res) => {
        try {
            let user = await UserModel.find(req.params.uid);
            if (!user)
                return response.sendErrorResponse(res, status.NOT_FOUND, 'Failed to find user to remove goal from');

            user.goals = user.goals.filter(goal => goal.id !== req.params.gid);
            await UserModel.merge(user);

            return response.sendOkResponse(res, status.OK, 'Successfully removed goal from user');
        } catch (err) {
            logger.error(err);
            return response.sendErrorResponse(res, err, 'add goal to user');
        }
    }
});
