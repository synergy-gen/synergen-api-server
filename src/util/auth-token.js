const jwt = require('jsonwebtoken');
const fs = require('fs');
const config = require('config');
const path = require('path');
const { SynergenError, ErrorCodes } = require('./error');
const { Strategy } = require('passport-jwt');

let _config = config.get('security');
let _key = path.join(process.cwd(), _config.jwt.secretKey);
let _secret = null;
let _issuer = _config.jwt.issuer;
let _audience = _config.jwt.audience;

function _retrieveSecret(cb) {
    fs.readFile(_key, 'utf8', (err, secret) => {
        if (err) return cb(new SynergenError(ErrorCodes.F_FILE_FAILURE, 'Failed to read secret: ' + err.message));
        _secret = secret;
        cb();
    });
}

function createPassportStrategy(cb) {
    if (!_secret) {
        _retrieveSecret(err => {
            if (err) return cb(err);
            let strategy = _generateStrategy(_audience);
            return cb(null, strategy);
        });
    } else {
        let strategy = _generateStrategy(_audience);
        return cb(null, strategy);
    }
}

function _generateStrategy() {
    return new Strategy(
        {
            jwtFromRequest: function(req) {
                let token = null;
                if (req && req.cookies) {
                    token = req.cookies.auth;
                }
                return token;
            },
            issuer: _issuer,
            audience: _audience,
            secretOrKey: _secret
        },
        (payload, done) => {
            // Will appear on 'req' as 'user'
            done(null, payload);
        }
    );
}

function generate(subject) {
    let payload = {
        iss: _issuer,
        sub: subject,
        aud: _audience,
        exp: Math.floor(Date.now() / 1000) + 60 * 60
    };
    return new Promise((resolve, reject) => {
        if (!_secret) {
            _retrieveSecret(err => {
                if (err) return reject(err);
                jwt.sign(payload, _secret, (err, token) => {
                    if (err) return reject(err);
                    return resolve(token);
                });
            });
        } else {
            jwt.sign(payload, _secret, (err, token) => {
                if (err) return reject(err);
                return resolve(token);
            });
        }
    });
}

function verify(token, subject) {
    let options = { subject, audience: _audience, issuer: _issuer };
    return new Promise((resolve, reject) => {
        if (!_secret) {
            _retrieveSecret(err => {
                if (err) return reject(err);
                _verifyToken(token, options, resolve, reject);
            });
        } else {
            _verifyToken(token, options, resolve, reject);
        }
    });
}

function _verifyToken(token, options, resolve, reject) {
    jwt.verify(token, _secret, options, (err, decoded) => {
        if (err)
            return reject(
                new SynergenError(ErrorCodes.A_AUTH_TOKEN_FAILURE, `Failed to validate token: ${err.message}`)
            );
        return resolve(decoded);
    });
}

module.exports = {
    generate,
    verify,
    createPassportStrategy
};
