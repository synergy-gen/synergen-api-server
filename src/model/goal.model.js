const shortid = require('shortid');
const { validate, goalCollectionName } = require('./db/goal.db');
const db = require('../util/db-connection');
const { SynergenError } = require('../util/error');
const TaskModel = require('./task.model');
const { Task } = TaskModel;
const users = require('./user.model');

class Goal {
    constructor(props = {}) {
        this.id = props.id || props._id || shortid.generate();
        this.title = props.title || null;
        this.description = props.description || null;
        this.tasks = props.tasks || [];
        if (this.tasks.length > 0 && !(this.tasks[0] instanceof Task)) {
            this.tasks = this.tasks.map(t => new Task(t));
        }
        this.creator = props.creator || null;
        this.parent = props.parent || null;
        this.tags = props.tags || [];
        this.createDate = props.createDate || Date.now();
        this.updateDate = props.updateDate || null;
        this.beginDate = props.beginDate || null;
        this.targetDate = props.targetDate || null;
    }
}

class PublicGoal {
    constructor(props) {
        this.title = props.title || '';
        this.description = props.description || '';
        this.tasks = props.tasks || [];
        this.adoptions = props.adoptions || 0;
    }
}

class PublicGoalPackage {
    constructor(props) {
        this.id = props.id || props._id || shortid.generate();
        this.latest = props.latest ? new PublicGoal(props.latest) : null;
        this.previous = [];
        if(props.previous && Array.isArray(props.previous)) {
            this.previous = props.previous.map(g => new PublicGoal(g));
        }
        this.creator = props.creator || null;
        this.tags = props.tags || [];
        this.parent = props.parent || null;
        this.publishDate = props.publishDate || Date.now();
        this.updateDate = props.updateDate || null;
    }
}

module.exports = {
    Goal,
    PublicGoal,
    PublicGoalPackage,

    merge: async publicGoalPackage => {
        try {
            // Some application-level preparation/validation before persisting in the database. Essentially we deep
            // copy the goal before putting it into the database
            let package = { ...publicGoalPackage, previous: [] };
            package._id = package.id;
            delete package.id;
            package.latest = { ...publicGoalPackage.latest, tasks: [] };
            publicGoalPackage.latest.tasks.forEach(t => {
                package.latest.tasks.push(t);
            });
            publicGoalPackage.previous.forEach(g => {
                let goal = { ...g, tasks: [] };
                g.tasks.forEach(t => {
                    goal.tasks.push(t);
                });
                package.previous.push(goal);
            });

            // Validate the goal before we enter it in the database
            let errors = validate(package);
            if (errors)
                throw new SynergenError(
                    'Failed to save public goal information: invalid format',
                    SynergenError.Codes.M_INVALID_FORMAT,
                    errors
                );

            // Everything looks good. Merge the changes.
            await db
                .collection(goalCollectionName)
                .updateOne({ _id: publicGoalPackage.id }, { $set: package }, { upsert: true });

            return true;
        } catch (err) {
            if (err instanceof SynergenError) throw err;
            throw new SynergenError('Failed to save public goal information: ' + err.message);
        }
    },

    find: async id => {
        try {
            let doc = await db.collection(goalCollectionName).findOne({ _id: id });
            if (!doc) return null;
            // Map the creator ID to username
            let creator = await _module.find(doc.creator);
            doc.creator = creator.username;
            
            return new PublicGoalPackage(doc);
        } catch (err) {
            throw new SynergenError(`Failed to retrieve user information for user with id ${id}: ${err.message}`);
        }
    },

    findByCreatorId: async creatorId => {
        try {
            let doc = await db.collection(goalCollectionName).find({ creator: creatorId }).toArray();
            if (!doc) return [];
            let results = [];
            for(let package of doc) {
                // Map the creator ID to username
                let creator = await _module.find(package.creator);
                package.creator = creator.username;
                results.push(new PublicGoalPackage(package));
            }
            return results();
        } catch (err) {
            throw new SynergenError(`Failed to retrieve user information for user with id ${id}: ${err.message}`);
        }
    },

    findWithQuery: async (query, start = 0, end = 10) => {
        try {
            // We will use a few built in MongoDB functions
            // - The build in 'text' index and 'score' to sort the results
            // - the cursor.skip() function to help us paginate
            // For now this works. As the database gets larger, we may need to do range queries to speed up the
            // search
            // TODO: investigate range queries and how they can make the search faster
            let jump = 10;
            if (start % jump !== 0) start = jump * Math.floor(start / jump);
            if (end % jump !== 0) end = jump * Math.floor(end / jump);
            let numRecords = end - start;
            if (numRecords < 0) return [];

            let results = await db
                .collection(goalCollectionName)
                .find({ $text: { $search: query } }, { score: { $meta: 'textScore' } })
                .sort({ score: { $meta: 'textScore' } })
                .skip(start)
                .limit(numRecords)
                .toArray();

            if (!results) return [];

            let docs = [];

            // Format the creator to be the username for each of the results
            // TODO: optimize this process
            for (let res of results) {
                // Map the creator ID to username
                let creator = await _module.find(res.creator);
                res.creator = creator.username;
                docs.push(new PublicGoalPackage(res));
            }

            return docs;

        } catch (err) {
            if (err instanceof SynergenError) throw err;
            throw new SynergenError('Failed to retrieve public goals with query: ' + err.message);
        }
    }
};
