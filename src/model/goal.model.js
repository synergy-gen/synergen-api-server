const shortid = require('shortid');
const { validate, goalCollectionName } = require('./db/goal.db');
const db = require('../util/db-connection');
const { SynergenError } = require('../util/error');
const TaskModel = require('./task.model');
const { Task } = TaskModel;

class Goal {
    constructor(props = {}) {
        this.id = props.id || props._id || shortid.generate();
        this.title = props.title || null;
        this.description = props.description || null;
        this.tasks = props.tasks || [];
        if (this.tasks.length > 0 && !(this.tasks[0] instanceof Task)) {
            this.tasks = this.tasks.map(t => new Task(t));
        }
        this.creator = (props.creator && props.creator.username) || props.creator || null;
        this.public = props.public || false;
        this.adoptions = props.adoptions || 0;
        this.parent = props.parent || null;
        this.tags = props.tags || [];
        this.createDate = props.createDate || Date.now();
        this.updateDate = props.updateDate || null;
        this.targetDate = props.targetDate || null;
    }
}

module.exports = {
    Goal,

    merge: async goal => {
        try {
            // Some application-level preparation/validation before persisting in the database
            let goalObj = { ...goal };
            goalObj._id = goalObj.id;
            delete goalObj.id;
            goalObj.tasks = goalObj.tasks.map(task => task.id);
            let errors = validate(goalObj);
            if (errors)
                throw new SynergenError(
                    'Failed to save goal information: invalid format',
                    SynergenError.Codes.M_INVALID_FORMAT,
                    errors
                );

            await db.collection(goalCollectionName).updateOne({ _id: goal.id }, { $set: goalObj }, { upsert: true });

            return true;
        } catch (err) {
            if (err instanceof SynergenError) throw err;
            throw new SynergenError('Failed to save goal information: ' + err.message);
        }
    },

    findMany: async ids => {
        try {
            let docs = await db
                .collection(goalCollectionName)
                .find({ _id: { $in: ids } })
                .toArray();
            if (!docs) return [];
            let goals = [];
            for (let doc of docs) {
                if (doc.tasks && doc.tasks.length > 0) {
                    doc.tasks = await TaskModel.findMany(doc.tasks);
                }
                goals.push(new Goal(doc));
            }
            return goals;
        } catch (err) {
            throw new SynergenError('Failed to retrieve multiple goals: ' + err.message);
        }
    }
};
