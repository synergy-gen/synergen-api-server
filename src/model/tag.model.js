const db = require('./db/tag.db');
const errors = require('../util/error');

class Tag {
    constructor(tag) {
        this.name = tag;
    }
}

module.exports = {
    mergeAll: tags =>
        new Promise((resolve, reject) => {
            let ts = tags.map(t => new Tag(t));
            db.insertMany(ts, err => {
                if (err) return reject(errors.translate(err, 'save all tags'));
                return resolve();
            });
        }),
    all: () =>
        new Promise((resolve, reject) => {
            db.find()
                .lean()
                .exec((err, res) => {
                    if (err) return reject(errors.translate(err, 'retrieve all tags'));
                    if (!res) return resolve([]);
                    return resolve(res);
                });
        })
};
