const db = require('./db/task.db');
const shortid = require('shortid');
const errors = require('../util/error');

class Task {
    constructor(props = {}) {
        this.id = props.id || props._id || shortid.generate();
        this.details = props.details || null;
        this.type = props.type || Task.Types.CHECK;
        this.complete = props.complete || false;
        this.repeated = props.repeated || Task.Repeat.NO;
        this.data = props.data || null;
        this.createDate = props.createDate || Date.now();
    }
}

Task.Types = {
    CHECK: 'check'
};

Task.Repeat = {
    NO: 'no',
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly'
};

function merge(task) {
    return new Promise((resolve, reject) => {
        db.findOneAndUpdate({ _id: task.id }, task, { upsert: true, new: true })
            .lean()
            .exec((err, doc) => {
                if (err) return reject(errors.translate(err, 'save task'));
                if (!doc) {
                    return resolve(undefined);
                }
                return resolve(new Task(doc));
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
                if (err) return reject(errors.translate(err, 'retrieve task information'));
                if (!docs || docs.length === 0) {
                    return resolve(undefined);
                }
                if (docs.length == 1) {
                    return resolve(new Task(docs[0]));
                }
                return resolve(docs.map(doc => new Task(doc)));
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
                if (err) return reject(errors.translate(err, 'remove task information'));
                if (result && result.n === 0) {
                    return resolve(false);
                }
                return resolve(true);
            });
    });
}

module.exports = {
    Task,
    merge,
    find,
    remove
};
