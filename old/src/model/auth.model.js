const shortid = require('shortid');

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
    AuthInfo
};
