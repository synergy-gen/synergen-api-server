const publicGoals = require('../../data-access/goal.dam');
const users = require('../../data-access/user.dam');
const { PublicGoalPackage, Goal } = require('../../model/goal.model');
const logger = require('winstonson')(module);
const response = require('./response');
const status = require('http-status');

const _module = (module.exports = {
    getPublicGoals: async (req, res) => {
        try {
            let goals = [];
            if (req.query.q) {
                // Build the query. For now we are going to let mongo do the heavy lifting with its text indexes.
                let q = req.query.q;
                logger.info('Retrieving public goals with query "' + q + '"');
                goals = await publicGoals.findWithQuery(q);
            } else if (req.query.creator) {
                // The query is for a specific creator, return all of their public goal packages
                let creator = req.query.creator;
                logger.info('Retrieving public goals for creator "' + creator + '"');
                goals = await publicGoals.findByCreatorId(creator);
            }

            // Prep the response
            logger.trace('Found goals. Preparing response');
            let resBody = goals.map(g => response.generatePublicGoalPackageResponseBody(g));

            return response.sendOkResponse(res, status.OK, 'Successfully retrieved public goals', resBody);
        } catch (err) {
            logger.error(err);
            return response.sendErrorResponse(res, err, 'find public goals');
        }
    },

    getPublicGoal: async (req, res) => {
        try {
            logger.info('Retrieving public goal with id ' + req.params.id);
            let package = await publicGoals.find(req.params.id);
            if (!package) {
                logger.info('Public goal not found');
                return sendErrorResponse(res, status.NOT_FOUND, 'Failed to find public goal');
            }

            // Prep the response
            logger.trace('Found public goal. Preparing response');
            let resBody = response.generatePublicGoalPackageResponseBody(package);
            return response.sendOkResponse(res, status.OK, 'Successfully retrieved public goal', resBody);
        } catch (err) {
            logger.error(err);
            return response.sendErrorResponse(res, err, 'retrieve public goal');
        }
    },

    addPublicGoal: async (req, res) => {
        try {
            logger.info('Adding new public goal');
            let package = new PublicGoalPackage({ latest: req.body, creator: req.body.creator, tags: req.body.tags });
            await publicGoals.merge(package);

            logger.trace('Public goal added. Preparing response');
            let resBody = response.generatePublicGoalPackageResponseBody(package, false);
            return response.sendOkResponse(res, status.CREATED, 'Successfully published goal', resBody);
        } catch (err) {
            logger.error(err);
            if (err.details) logger.err(err.details);
            return response.sendErrorResponse(res, err, 'add public goal');
        }
    },

    updatePublicGoal: async (req, res) => {},

    deletePublicGoal: async (req, res) => {},

    adoptPublicGoal: async (req, res) => {
        try {
            // Fetch the goal
            let package = await publicGoals.find(req.params.id);
            if (!package) return response.sendErrorResponse(res, status.NOT_FOUND, 'Failed to find goal to adopt');

            // Fetch the user who wants to update the goal
            let user = await users.find(req.body.uid);
            if (!user) return response.sendErrorResponse(res, status.NOT_FOUND, 'Failed to find user to adopt goal');

            // Add the goal to the user
            let goal = new Goal(package.latest);
            goal.creator = package.creator;
            user.goals.push(goal);
            await users.merge(user);

            // Update the adoptions of the goal
            package.latest.adoptions++;
            await publicGoals.merge(package);

            let body = response.generateGoalResponseBody(goal, `/users/${req.body.uid}/goals/${goal.id}`);

            return response.sendOkResponse(res, status.OK, 'Successfully adopted goal', body);
        } catch (err) {
            logger.error(err);
            if (err.details) logger.error(err.details);
            return response.sendErrorResponse(res, err, 'adopt goal');
        }
    }
});
