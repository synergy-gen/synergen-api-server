const fs = require('fs');
const readline = require('readline');
const config = require('config');
const mongoose = require('mongoose');
const path = require('path');
const UserModel = require('../../src/model/user.model');
const GoalModel = require('../../src/model/goal.model');
const { Task } = require('../../src/model/task.model');
const TagModel = require('../../src/model/tag.model');

const userFile = path.join(__dirname, 'users.txt');
const goalsFile = path.join(__dirname, 'goals.txt');

// Keep track of users and tags we can use them later
let users = [];
let tags = new Set();
let promises = [];
// Connect to the database
const databaseConfig = config.get('database');
const mongoUrl = `mongodb://${databaseConfig.host}:${databaseConfig.port}/${databaseConfig.name}`;
mongoose.connect(mongoUrl, { useNewUrlParser: true, useFindAndModify: false });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB at ' + mongoUrl);
    seed()
        .then(() => Promise.all(promises))
        .then(() => db.close())
        .catch(err =>
            console.log(
                'Failed to seed database entirely: ' + err.message + '. The database may have been partially seeded',
                err
            )
        );
});

async function seed() {
    console.log('Beginning database seed...');
    console.log('   Seeding users');
    await seedUsers();
    // We have users to use. Seed the goals
    console.log('   Seeding goals');
    await seedGoals();
    // Use the tags from the goals to seed a tag list
    console.log('   Seeding tags');
    await seedTags();
}

function seedUsers() {
    let interface = readline.createInterface({
        input: fs.createReadStream(userFile)
    });
    return new Promise((resolve, reject) => {
        interface.on('line', line => {
            let user = new UserModel.User({
                name: line,
                username: 'dtest' + line.toLowerCase().replace(/[\s\.\-\_]/, '')
            });
            let p = UserModel.merge(user).catch(err => reject(err));
            promises.push(p);
            users.push(user);
        });
        interface.on('close', () => resolve());
    });
}

function seedGoals() {
    let interface = readline.createInterface({
        input: fs.createReadStream(goalsFile)
    });
    return new Promise((resolve, reject) => {
        let state = 0;
        let goal = new GoalModel.Goal();
        let error = false;
        interface.on('line', line => {
            if (line !== '') {
                switch (state) {
                    case 0: // Reading the title
                        goal.title = line;
                        state++;
                        break;
                    case 1: // Reading the description
                        goal.description = line;
                        state++;
                        break;
                    case 2: // Reading the tags
                        goal.tags = line.split(',');
                        state++;
                        break;
                    case 3: // Reading tasks
                        let parts = line.split('|');
                        let details = parts[0].trim();
                        let type = parts.length > 1 ? parts[1].trim() : Task.Types.CHECK;
                        let task = new Task({ details, type });
                        goal.tasks.push(task);
                        break;
                    default:
                        // Should never get here
                        error = true;
                        interface.close();
                        return reject(new Error('State corruption: entered state ' + state));
                }
            } else {
                // We finished parsing a goal. Save it and its tags
                goal.tags.forEach(t => tags.add(t));
                // Pick a random user to be the creator for the goal
                let i = Math.floor(Math.random() * users.length);
                goal.creator = users[i].id;
                // Pick a random number of adoptions
                goal.adoptions = Math.floor(Math.random() * 50);
                // Write the goal
                let p = GoalModel.merge(goal).catch(err => reject(err));
                promises.push(p);
                // Reset the state
                state = 0;
                goal = new GoalModel.Goal();
            }
        });
        interface.on('close', () => {
            if (!error) return resolve();
        });
    });
}

function seedTags() {
    // We gathered all our tags from the goals. Add them to the database
    return TagModel.mergeAll(Array.from(tags));
}
