const mongoose = require('mongoose');
const TaskSchema = require('./task.db').schema;

const GoalSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true },
        title: String,
        description: String,
        tasks: {
            type: Array,
            of: TaskSchema,
            default: []
        },
        creator: String,
        adoptions: { type: Array, of: String, default: [] },
        parent: String,
        tags: [String],
        createDate: { type: Number, required: true },
        updateDate: Number,
        targetDate: Number
    },
    {
        strict: 'throw'
    }
);

module.exports = mongoose.model('Goal', GoalSchema);
