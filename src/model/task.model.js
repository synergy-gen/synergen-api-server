const shortid = require('shortid');

class Task {
    constructor(props = {}) {
        if (typeof props === 'string') {
            props = { details: props };
        }
        this.id = props.id || props._id || shortid.generate();
        this.details = props.details || null;
        this.type = props.type || Task.Types.CHECK;
        this.data = props.data || null;
        this.createDate = props.createDate || Date.now();
        this.updateDate = props.updateDate || null;
    }
}

Task.Types = {
    CHECK: 'check'
};

module.exports = {
    Task
};
