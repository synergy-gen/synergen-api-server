const db = require('./db/user.db');
const errors = require('../util/error');
const shortid = require('shortid');
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
        if (this.goals.length > 0 && !(this.goals[0] instanceof Goal)) {
            this.goals = this.goals.map(g => new Goal(g));
        }
        // TODO: add objectives to user model
        this.createDate = props.createDate || Date.now();
    }
}

const aggregateUserQuery = [
    {
        $match: {
            // This value can change
        }
    },
    {
        $unwind: {
            path: '$goals',
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $lookup: {
            from: 'users',
            localField: 'goals.creator',
            foreignField: '_id',
            as: 'goals.creator'
        }
    },
    { $unwind: '$goals.creator' },
    {
        $group: {
            _id: '$_id',
            name: { $first: '$name' },
            username: { $first: '$username' },
            email: { $first: '$email' },
            lastLogin: { $first: '$lastLogin' },
            goals: { $push: '$goals' },
            createDate: { $first: '$createDate' },
            updateDate: { $first: '$updateDate' },
            active: { $first: '$active' }
        }
    }
];

module.exports = {
    User,

    merge: user => {
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
    },

    find: query => {
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
    },

    getUser: id => {
        return new Promise((resolve, reject) => {
            db.findOne({ _id: id })
                .populate('goals.creator', 'username')
                .lean()
                .exec((err, res) => {
                    if (err) return reject(errors.translate(err, 'retrieve user'));
                    return resolve(new User(res));
                });
        });
    },

    getUserByUsername: username => {
        return new Promise((resolve, reject) => {
            db.findOne({ username })
                .populate('goals.creator', 'username')
                .lean()
                .exec((err, res) => {
                    if (err) return reject(errors.translate(err, 'retrieve user'));
                    return resolve(new User(res));
                });
        });
    },

    remove: query => {
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
    },

    addGoalToUser: (id, goal) => {
        return new Promise((resolve, reject) => {
            db.findOneAndUpdate({ _id: id }, { $push: { goals: { ...goal } } }, { new: true })
                .populate('goals.creator', 'username')
                .lean()
                .exec((err, doc) => {
                    if (err) return reject(errors.translate(err, 'add goal to user'));
                    if (!doc) return resolve(undefined);
                    let newGoal = doc.goals.filter(g => g.id === goal.id)[0];
                    return resolve(new Goal(newGoal));
                });
        });
    },

    removeGoalFromUser: (userId, goalId) => {
        return new Promise((resolve, reject) => {
            db.deleteOne({ _id: userId }, { $pull: { goals: { $in: [goalId] } } })
                .lean()
                .exec((err, res) => {
                    if (err) return reject(errors.translate(err, 'remove goal from user'));
                    if (result && result.n === 0) return resolve(false);
                    return resolve(true);
                });
        });
    },

    updateUserGoal: (userId, goal) => {
        return new Promise((resolve, reject) => {
            db.findOneAndUpdate({ _id: userId, goals: goal.id }, { $set: { 'goals.$': { ...goal } } }, { new: true })
                .populate('goals.creator', 'username')
                .lean()
                .exec((err, doc) => {
                    if (err) return reject(errors.translate(err, "update user's goal"));
                    if (!doc) return resolve(undefined);
                    // Extract the goal we just updated
                    let goal = doc.goals.filter(g => g._id === goal.id)[0];
                    return resolve(new Goal(goal));
                });
        });
    }
};
