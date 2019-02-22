const AuthModel = require('../../model/auth.model');
const UserModel = require('../../model/user.model');
const response = require('./response');
const status = require('http-status');
const logger = require('winstonson')(module);
const security = require('../../util/security');

module.exports = {
    verifyAuthorized,
    login
};

async function login(req, res) {
    try {
        logger.trace('Preparing to authenticate user with username ' + req.body.username);
        let username = req.body.username;
        let user = await UserModel.findByUsername(username);
        if (!user) {
            logger.info('User not found');
            return response.sendErrorResponse(res, status.NOT_FOUND, `Could not find user with username '${username}'`);
        }
        let authInfo = await AuthModel.findByUserId(user.id);
        if (!authInfo) {
            logger.info('Found user, but failed to find authentication entry for user with id ' + user.id);
            return response.sendErrorResponse(res, status.NOT_FOUND, 'Failed to authenticate user');
        }

        logger.trace('Comparing hashes');
        let hashed = security.hash(authInfo.algo, authInfo.salt, req.body.password);
        if (hashed != authInfo.hash) {
            logger.info('Incorrect password supplied for user');
            return response.sendErrorResponse(
                res,
                status.BAD_REQUEST,
                `Incorrect password for user '${req.body.username}'`
            );
        }

        logger.trace('Successfully authenticated user');
        // Authentication succeeded, generate a token and return it to the user
        let token = await security.generateToken(req.body.username);

        // Setting 'httpOnly' to false allows the client to delete the cookie
        res.cookie('auth', token, { httpOnly: false });

        let userBody = response.generateUserResponseBody(user);
        return response.sendOkResponse(res, status.OK, 'Successfully authenticated user', userBody);
    } catch (err) {
        logger.error(err);
        if (err.details) logger.error(err.details);
        return response.sendErrorResponse(res, err, 'authenticate user');
    }
}

async function verifyAuthorized(req, res) {
    // We should not get to this point unless the request came with a valid authorization token. Just return
    // success
    try {
        let user = await UserModel.findByUsername(req.user.sub);
        let body = response.generateUserResponseBody(user);
        return response.sendOkResponse(res, status.OK, 'Token still valid', body);
    } catch (err) {
        logger.error(err);
        return response.sendErrorResponse(
            res,
            status.INTERNAL_SERVER_ERROR,
            'Could not verify if user is authenticated'
        );
    }
}
