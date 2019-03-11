const fs = require('fs');
const readline = require('readline');
const path = require('path');
const db = require('../../src/util/db-connection');
const { User } = require('../../src/model/user.model');
const users = require('../../src/data-access/user.dam');
const { PublicGoalPackage, PublicGoal } = require('../../src/model/goal.model');
const packages = require('../../src/data-access/goal.dam');

const userFile = path.join(__dirname, 'users.txt');
const goalsFile = path.join(__dirname, 'goals-0.txt');

let createdUsers = [];
let promises = [];

db.connect(err => {
    if (err) {
        console.log(err);
        process.exit(1);
    }
    console.log('Connected to DB');
    seed()
        .then(() => Promise.all(promises))
        .then(() => {
            console.log('Successfully seeded the database');
            db.close();
        })
        .catch(err => {
            console.log(
                'Failed to seed database entirely: ' + err.message + '. The database may have been partially seeded',
                err
            );
            db.close();
        });
});

async function seed() {
    console.log('Beginning database seed...');
    console.log('   Seeding users');
    await seedUsers();
    // We have users to use. Seed the goals
    console.log('   Seeding goals');
    await seedGoals();
}

function seedUsers() {
    let interface = readline.createInterface({
        input: fs.createReadStream(userFile)
    });
    return new Promise((resolve, reject) => {
        interface.on('line', line => {
            let user = new User({
                name: line,
                username: 'dv' + line.toLowerCase().replace(/[\s\.\-\_]/, ''),
                email: 'dtest@example.com',
                lastLogin: Date.now()
            });
            let p = users.merge(user).catch(err => reject(err));
            promises.push(p);
            createdUsers.push({ id: user.id, username: user.username });
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
        let goal = new PublicGoalPackage();
        goal.latest = new PublicGoal();
        let error = false;
        interface.on('line', line => {
            if (line !== '') {
                switch (state) {
                    case 0: // Reading the title
                        goal.latest.title = line;
                        state++;
                        break;
                    case 1: // Reading the description
                        goal.latest.description = line;
                        state++;
                        break;
                    case 2: // Reading the tags
                        goal.tags = line.split(',');
                        state++;
                        break;
                    case 3: // Reading tasks
                        let details = line.trim();
                        goal.latest.tasks.push(details);
                        break;
                    default:
                        // Should never get here
                        error = true;
                        interface.close();
                        return reject(new Error('State corruption: entered state ' + state));
                }
            } else {
                // Pick a random user to be the creator for the goal
                let i = Math.floor(Math.random() * createdUsers.length);
                goal.creator = createdUsers[i];
                // Pick a random number of adoptions
                goal.latest.adoptions = Math.floor(Math.random() * 50);
                // Write the goal
                let p = packages.merge(goal).catch(err => {
                    if (!error) {
                        error = true;
                        reject(err);
                    }
                });
                promises.push(p);
                // Reset the state
                state = 0;
                goal = new PublicGoalPackage();
                goal.latest = new PublicGoal();
            }
        });
        interface.on('close', () => {
            if (!error) return resolve();
        });
    });
}
