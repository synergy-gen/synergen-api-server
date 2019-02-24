const shortid = require('shortid');
const { Goal } = require('./goal.model');

class User {
    constructor(props) {
        if (!props) props = {};
        this.id = props.id || props._id || shortid.generate();
        this.username = props.username;
        this.name = props.name;
        this.email = props.email;
        this.lastLogin = props.lastLogin;
        this.goals = props.goals || [];
        if (this.goals.length > 0 && !(this.goals[0] instanceof Goal)) {
            this.goals = this.goals.map(g => new Goal(g));
        }
        // TODO: add objectives to user model
        this.createDate = props.createDate || Date.now();
    }
}

module.exports = {
    User
};
