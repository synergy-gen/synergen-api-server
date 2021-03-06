const { User } = require('../model/user.model');
const db = require('../util/db-connection');
const { validate, userCollectionName } = require('./schemas/user.schema');
const { SynergenError } = require('../util/error');

const _module = (module.exports = {
    merge: async user => {
        try {
            let userObj = { ...user, goals: [] };
            userObj._id = userObj.id;
            delete userObj.id;
            userObj.goals = user.goals.map(g => {
                let goal = { ...g, tasks: [], creator: g.creator.id };
                goal._id = goal.id;
                delete goal.id;
                goal.tasks = g.tasks.map(t => {
                    let task = { ...t };
                    task._id = task.id;
                    delete task.id;
                    return task;
                });
                return goal;
            });
            let errors = validate(userObj);
            if (errors)
                throw new SynergenError(
                    'Failed to save user data: invalid format',
                    SynergenError.Codes.M_INVALID_FORMAT,
                    errors
                );

            await db.collection(userCollectionName).updateOne({ _id: user.id }, { $set: userObj }, { upsert: true });

            return true;
        } catch (err) {
            if (err instanceof SynergenError) throw err;
            throw new SynergenError(`Failed to save user data: ${err.message}`);
        }
    },

    find: async id => {
        try {
            let doc = await db.collection(userCollectionName).findOne({ _id: id });
            if (!doc) return null;

            // Map the creator IDs to usernames
            let creators = { [id]: doc.username };
            await mapGoalCreatorsToUsernames(doc, creators);

            return new User(doc);
        } catch (err) {
            throw new SynergenError(`Failed to retrieve user information for user with id ${id}: ${err.message}`);
        }
    },

    findByUsername: async username => {
        try {
            let doc = await db.collection(userCollectionName).findOne({ username });
            if (!doc) return null;

            // Map the creator IDs to usernames
            let creators = { [doc._id]: username };
            await mapGoalCreatorsToUsernames(doc, creators);

            return new User(doc);
        } catch (err) {
            throw new SynergenError(
                `Failed to retrieve user information for user with username ${username}: ${err.message}`
            );
        }
    },

    remove: async id => {
        try {
            let res = await db.collection(userCollectionName).deleteOne({ _id: id });
            if (res.deletedCount !== 1) throw new Error('Failed to delete record');
            return true;
        } catch (err) {
            throw new SynergenError(`Failed to remove user with id ${id}: ${err.message}`);
        }
    }
});

async function mapGoalCreatorsToUsernames(doc, creators = {}) {
    try {
        for (let goal of doc.goals) {
            goal.creator = await findCreator(goal.creator, creators);
        }
    } catch (err) {
        throw new SynergenError('Failed to map goal creators to usernames: ' + err.message);
    }
}

async function findCreator(creator, creators) {
    try {
        if (!creators[creator]) {
            let doc = await db.collection(userCollectionName).findOne({ _id: creator });
            if (!doc) doc = await db.collection(userCollectionName).findOne({ username: creator });
            if (!doc) return null;
            creators[creator.id] = creator.username;
            return {
                id: doc._id,
                username: doc.username
            };
        } else {
            return {
                id: creator,
                username: creators[creator]
            };
        }
    } catch (err) {
        throw new SynergenError('Failed to find goal creator with id ' + creator + ': ' + err.message);
    }
}
