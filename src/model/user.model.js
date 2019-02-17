const shortid = require('shortid');
const db = require('../util/db-connection');
const { validate, userCollectionName } = require('./db/user.db');
const { SynergenError } = require('../util/error');
const GoalModel = require('./goal.model');
const { Goal } = GoalModel;

class User {
    constructor(props) {
        if (!props) props = {};
        this.id = props.id || props._id || shortid.generate();
        this.username = props.username;
        this.name = props.name;
        this.email = props.email;
        this.lastLogin = props.lastLogin;
        this.goals = props.goals || [];
        if (this.goals.length > 0 && !(this.goals[0] instanceof Goal)) {
            this.goals = this.goals.map(g => new Goal(g));
        }
        // TODO: add objectives to user model
        this.createDate = props.createDate || Date.now();
    }
}

const _module = (module.exports = {
    User,

    merge: async user => {
        try {
            let userObj = { ...user, goals: [] };
            userObj._id = userObj.id;
            delete userObj.id;
            userObj.goals = user.goals.map(g => {
                let goal = { ...g, tasks: [] };
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
            for (let goal of doc.goals) {
                if (doc._id !== id) {
                    let creator = await _module.find(goal.creator);
                    goal.creator = creator.username;
                } else {
                    goal.creator = doc.username;
                }
            }
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
            for (let goal of doc.goals) {
                if (doc.username !== username) {
                    let creator = await _module.find(goal.creator);
                    goal.creator = creator.username;
                } else {
                    goal.creator = username;
                }
            }
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
