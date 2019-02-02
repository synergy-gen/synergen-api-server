const shortid = require('shortid');
const db = require('./db/goal.db');
const errors = require('../util/error');

class Goal {
    constructor(props = {}) {
        this.id = props.id || props._id || shortid.generate();
        this.title = props.title || null;
        this.description = props.description || null;
        this.tasks = props.tasks || [];
        this.creator = props.creator || null;
        this.adoptions = props.adoptions || 0;
        this.tags = props.tags || [];
        this.createDate = props.createDate || Date.now();
    }
}

function merge(goal) {
    return new Promise((resolve, reject) => {
        db.findOneAndUpdate({ _id: goal.id }, goal, { upsert: true, new: true })
            .lean()
            .exec((err, doc) => {
                if (err) return reject(errors.translate(err, 'save goal'));
                if (!doc) {
                    return resolve(undefined);
                }
                return resolve(new Goal(doc));
            });
    });
}

function find(query) {
    q = {};
    if (query && query.id) {
        q._id = query.id;
    }
    return new Promise((resolve, reject) => {
        db.find(q)
            .lean()
            .exec((err, docs) => {
                if (err) return reject(errors.translate(err, 'retrieve goal information'));
                if (!docs || docs.length === 0) {
                    return resolve(undefined);
                }
                if (docs.length == 1) {
                    return resolve(new Goal(docs[0]));
                }
                return resolve(docs.map(doc => new Goal(doc)));
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
                if (err) return reject(errors.translate(err, 'remove goal information'));
                if (result && result.n === 0) {
                    return resolve(false);
                }
                return resolve(true);
            });
    });
}

module.exports = {
    Goal,
    merge,
    find,
    remove
};
