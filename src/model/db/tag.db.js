const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema(
    {
        _id: false,
        name: String
    },
    {
        strict: 'throw'
    }
);

module.exports = mongoose.model('Tag', TagSchema);
