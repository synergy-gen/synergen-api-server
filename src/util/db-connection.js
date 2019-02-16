const { MongoClient } = require('mongodb');
const config = require('config');
const databaseConfig = config.get('database');

let userPass = '';
try {
    userPass = databaseConfig.get('user') + ':' + databaseConfig.get('pass') + '@';
} catch (err) {
    console.log('No user/password for MongoDB specified. No authentication parameters will be provided in connection');
}
const mongoUrl = `mongodb://${userPass}${databaseConfig.host}:${databaseConfig.port}`;

let _connection = null;
let _client = null;

module.exports = {
    // The reference to the database connection (pooled)
    collection: name => _connection.collection(name),

    connect: cb => {
        MongoClient.connect(mongoUrl, { useNewUrlParser: true }, (err, client) => {
            if (err) return cb(new Error('Failed to establish MongoDB connection: ' + err.message));
            console.log(`Connected to Mongo at ${databaseConfig.host}:${databaseConfig.port}`);
            _client = client;
            _connection = client.db(databaseConfig.name);
            cb(null);
        });
    },

    close: () => {
        _client.close();
        _client = null;
        _connection = null;
    }
};
