const mongoose = require('mongoose');

const Auth = new mongoose.Schema(
    {
        _id: { type: String, required: true },
        user: { type: String, required: true },
        salt: { type: String, required: true },
        hash: { type: String, required: true },
        algo: { type: String, required: true },
        last: { type: String, required: true }
    },
    {
        strict: 'throw'
    }
);

module.exports = mongoose.model('Auth', Auth);
