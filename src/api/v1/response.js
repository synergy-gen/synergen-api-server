const httpStatus = require('http-status');
const ErrorCodes = require('../../util/error').SynergenError.Codes;
const config = require('config').get('server').api;
const apiVersion = 'v1';

const apiBase = `${config.scheme}://${config.host}${config.port ? ':' + config.port : ''}/api/${apiVersion}`;

const _module = (module.exports = {
    resource: path => apiBase + path,

    sendOkResponse: (res, status, message, content = {}) => {
        res.status(status).json({
            api: apiVersion,
            succuess: true,
            status: httpStatus[status],
            code: status,
            timestamp: Date.now(),
            message,
            content
        });
    },
    sendErrorResponse: (res, err, actionOrMessage, content = {}) => {
        let response = {
            api: apiVersion,
            success: false,
            status: 0,
            timestamp: Date.now(),
            content,
            message: ''
        };
        if (typeof err === 'number') {
            response.message = actionOrMessage;
            response.code = err;
            response.status = httpStatus[err];
            return res.status(response.code).json(response);
        } else {
            switch (err.code) {
                case ErrorCodes.M_INVALID_FORMAT:
                    response.code = httpStatus.BAD_REQUEST;
                    response.status = httpStatus[response.code];
                    response.message = `Failed to ${actionOrMessage}: improperly formatted request`;
                    return res.status(response.code).json(response);
                case ErrorCodes.A_AUTH_TOKEN_FAILURE:
                    response.code = httpStatus.UNAUTHORIZED;
                    response.status = httpStatus[response.code];
                    response.message = `Failed to ${actionOrMessage}: invalid token`;
                    return res.status(response.code).json(response);
                case ErrorCodes.F_FILE_FAILURE:
                    response.code = httpStatus.INTERNAL_SERVER_ERROR;
                    response.status = httpStatus[response.code];
                    response.message = `Failed to ${actionOrMessage}: file failure`;
                    return res.status(response.code).json(response);
                default:
                    response.code = httpStatus.INTERNAL_SERVER_ERROR;
                    response.status = httpStatus[response.code];
                    response.message = `Failed to ${actionOrMessage}`;
                    return res.status(response.code).json(response);
            }
        }
    },

    generateUserResponseBody: user => {
        let self = _module.resource('/users/' + user.id);
        return {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            lastLogin: user.lastLogin,
            goals: user.goals.map(goal => _module.generateGoalResponseBody(goal, self + '/goals/' + goal.id)),
            objectives: [],
            createDate: user.createDate,
            updateDate: user.updateDate,
            active: user.active,
            _links: {
                self,
                goals: self + '/goals',
                objectives: self + '/objectives'
            }
        };
    },

    generateGoalResponseBody: (goal, selfUrl) => {
        return {
            id: goal.id,
            title: goal.title,
            description: goal.description,
            tasks: goal.tasks.map(task => _module.generateTaskResponseBody(task, selfUrl + '/tasks/' + task.id)),
            creator: goal.creator,
            public: goal.public,
            adoptions: goal.adoptions,
            parent: goal.parent,
            tags: goal.tags,
            createDate: goal.createDate,
            updateDate: goal.updateDate,
            targetDate: goal.targetDate,
            _links: {
                self: selfUrl,
                tasks: selfUrl + '/tasks',
                adoptions: selfUrl + '/adoptions',
                parent: goal.parent ? _module.resource('/goals/' + goal.parent) : null
            }
        };
    },

    generateTaskResponseBody: (task, selfUrl) => {
        return {
            id: task.id,
            details: task.details,
            type: task.type,
            data: task.data,
            createDate: task.createDate,
            updateDate: task.updateDate,
            _links: {
                self: selfUrl
            }
        };
    },

    generatePublicGoalPackageResponseBody: (goal, latestOnly = true) => {
        let self = _module.resource('/goals/' + goal.id);
        let body = {
            id: goal.id,
            latest: _module.generatePublicGoalResponseBody(goal.latest, self + '/latest'),
            creator: goal.creator,
            tags: goal.tags,
            parent: goal.parent,
            updateDate: goal.updateDate,
            publishDate: goal.publishDate
        };
        if (!latestOnly) {
            body.previous = goal.previous.map((v, i) =>
                _module.generatePublicGoalResponseBody(v, self + '/previous/' + i + 1)
            );
        }
        return body;
    },

    generatePublicGoalResponseBody: goal => {
        return {
            title: goal.title,
            description: goal.description,
            tasks: goal.tasks,
            adoptions: goal.adoptions
        };
    }
});
