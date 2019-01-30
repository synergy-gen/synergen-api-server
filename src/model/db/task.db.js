const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true },
        title: String,
        details: String,
        type: String,
        complete: Boolean,
        data: Object
    },
    {
        strict: 'throw'
    }
);

module.exports = mongoose.model('Task', TaskSchema);
