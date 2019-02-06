const db = require('./db/user.db');
const errors = require('../util/error');
const shortid = require('shortid');
const { Task } = require('./task.model');
const { Goal } = require('./goal.model');

class User {
    constructor(props) {
        if (!props) props = {};
        this.id = props.id || props._id || shortid.generate();
        this.username = props.username;
        this.name = props.name;
        this.email = props.email;
        this.lastLogin = props.lastLogin;
        this.goals = props.goals || [];
        if(this.goals.length > 0 && !(this.goals[0] instanceof Goal)) {
            this.goals = this.goals.map(g => new Goal(g));
        }
        // TODO: add objectives to user model
        this.createDate = props.createDate || Date.now();
    }
}

function merge(user) {
    return new Promise((resolve, reject) => {
        db.findOneAndUpdate({ _id: user.id }, user, { upsert: true, new: true })
            .lean()
            .exec((err, doc) => {
                if (err) return reject(errors.translate(err, 'save user'));
                if (!doc) {
                    return resolve(undefined);
                }
                return resolve(new User(doc));
            });
    });
}

function find(query) {
    q = {};
    if (query && query.id) {
        q._id = query.id;
    }
    if (query && query.username) {
        q.username = query.username;
    }
    return new Promise((resolve, reject) => {
        db.find(q)
            .lean()
            .exec((err, docs) => {
                if (err) return reject(errors.translate(err, 'retrieve user information'));
                if (!docs || docs.length === 0) {
                    return resolve(undefined);
                }
                if (docs.length == 1) {
                    return resolve(new User(docs[0]));
                }
                return resolve(docs.map(doc => new User(doc)));
            });
    });
}

function remove(query) {
    let q = {};
    if (query.id) {
        q._id = query.id;
    }
    return new Promise((resolve, reject) => {
        db.deleteMany(q)
            .lean()
            .exec((err, result) => {
                if (err) return reject(errors.translate(err, 'remove user information'));
                if (result && result.n === 0) {
                    return resolve(false);
                }
                return resolve(true);
            });
    });
}

function addGoalToUser(id, goal) {
    return new Promise((resolve, reject) => {
        db.findOneAndUpdate({_id: id}, {$push: { goals: {...goal}}}, {new: true}).lean().exec((err, doc) => {
            if(err) return reject(errors.translate(err, 'add goal to usre'));
            if(!doc) return resolve(undefined);
            return resolve(new User(doc));
        });
    });
}

function removeGoalFromUser(userId, goalId) {
    return new Promise((resolve, reject) => {
        db.deleteOne({_id: userId}, { $pull: { goals: { $in: [goalId]}}}).lean().exec((err, res) => {
            if(err) return reject(errors.translate(err, 'remove goal from user'));
            if(result && result.n === 0) return resolve(false);
            return resolve(true);
        })
    });
}

module.exports = {
    User,
    merge,
    find,
    remove,
    addGoalToUser,
    removeGoalFromUser
};
