const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true },
        details: String,
        type: String,
        complete: Boolean,
        repeated: { type: String, enum: ['no', 'daily', 'weekly', 'monthly'], required: true},
        data: Object,
        createDate: { type: Number, required: true }
    },
    {
        strict: 'throw'
    }
);

module.exports = mongoose.model('Task', TaskSchema);
