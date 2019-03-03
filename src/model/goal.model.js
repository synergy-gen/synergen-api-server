const shortid = require('shortid');
const { Task } = require('./task.model');

class Goal {
    constructor(props = {}) {
        this.id = props.id || props._id || shortid.generate();
        this.title = props.title || null;
        this.description = props.description || null;
        this.tasks = props.tasks || [];
        if (this.tasks.length > 0 && !(this.tasks[0] instanceof Task)) {
            this.tasks = this.tasks.map(t => new Task(t));
        }
        this.creator = {
            id: props.creator ? props.creator.id || null : null,
            username: props.creator ? props.creator.username || null : null
        };
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
        if (props.previous && Array.isArray(props.previous)) {
            this.previous = props.previous.map(g => new PublicGoal(g));
        }
        this.creator = {
            id: props.creator ? props.creator.id || null : null,
            username: props.creator ? props.creator.username || null : null
        };
        this.tags = props.tags || [];
        this.parent = props.parent || null;
        this.publishDate = props.publishDate || Date.now();
        this.updateDate = props.updateDate || null;
    }
}

module.exports = {
    Goal,
    PublicGoal,
    PublicGoalPackage
};
