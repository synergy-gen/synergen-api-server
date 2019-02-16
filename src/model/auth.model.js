const shortid = require('shortid');
const { validate, authCollectionName } = require('./db/auth.db');
const db = require('../util/db-connection');
const { SynergenError } = require('../util/error');

class AuthInfo {
    constructor(properties) {
        this.id = properties.id || properties._id || shortid.generate();
        this.user = properties.user || '';
        this.salt = properties.salt || '';
        this.hash = properties.hash || '';
        this.algo = properties.algo || AuthInfo.Algorithm.SHA256;
    }
}

AuthInfo.Algorithm = {
    SHA256: 'sha256'
};

module.exports = {
    AuthInfo,

    merge: async info => {
        try {
            let authObj = { ...info };
            authObj._id = authObj.id;
            delete authObj.id;
            let errors = validate(authObj);
            if (errors) {
                throw new SynergenError(
                    'Failed to save auth information: invalid format',
                    SynergenError.Codes.M_INVALID_FORMAT,
                    errors
                );
            }

            // Everything looks good, start persisting
            await db.collection(authCollectionName).updateOne({ _id: info.id }, { $set: authObj }, { upsert: true });

            return true;
        } catch (err) {
            if (err instanceof SynergenError) throw err;
            throw new SynergenError('Failed to save auth information: ' + err.message);
        }
    },

    find: async id => {
        try {
            let doc = await db.collection(authCollectionName).findOne({ _id: id });
            if (!doc) return null;
            return new AuthInfo(doc);
        } catch (err) {
            throw new SynergenError('Failed to retrieve auth info: ' + err.message);
        }
    },

    findByUserId: async userId => {
        try {
            let doc = await db.collection(authCollectionName).findOne({ user: userId });
            if (!doc) return null;
            return new AuthInfo(doc);
        } catch (err) {
            throw new SynergenError('Failed to retrieve auth info: ' + err.message);
        }
    }
};
