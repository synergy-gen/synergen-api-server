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
        tasks: {
            type: Array,
            of: TaskSchema,
            default: []
        },
        goals: {
            type: Array,
            of: GoalSchema,
            default: []
        }
    },
    { strict: 'throw' }
);

module.exports = mongoose.model('User', User);
