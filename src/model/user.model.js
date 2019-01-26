const db = require('./db/user.db');
const errors = require('../util/error');
const shortid = require('shortid');

class User {
    constructor(props) {
        if (!props) props = {};
        this.id = props.id || props._id || shortid.generate();
        this.username = props.username;
        this.name = props.name;
        this.email = props.email;
        this.lastLogin = props.lastLogin;
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
    if(query && query.username) {
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

module.exports = {
    User,
    merge,
    find,
    remove
};
