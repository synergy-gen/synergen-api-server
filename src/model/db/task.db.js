const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true },
        details: String,
        type: String,
        data: Object,
        createDate: { type: Number, required: true },
        updateDate: Number
    },
    {
        strict: 'throw'
    }
);

module.exports = mongoose.model('Task', TaskSchema);
