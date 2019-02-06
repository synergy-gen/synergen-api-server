const mongoose = require('mongoose');
const TaskSchema = require('./task.db').schema;
const GoalSchema = require('./goal.db').schema;

const User = new mongoose.Schema(
    {
        _id: { type: String, required: true },
        username: { type: String, required: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        lastLogin: { type: Number, required: true, default: Date.now() },
        goals: {
            type: Array,
            of: GoalSchema,
            default: []
        },
        // TODO: add objectives
        createDate: { type: Number, required: true }
    },
    { strict: 'throw' }
);

module.exports = mongoose.model('User', User);
