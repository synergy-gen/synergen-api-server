const express = require('express');
const db = require('./src/util/db-connection');
const files = require('./src/util/files');
const config = require('config');
const api = require('./src/api/v1/routes');
const morgan = require('morgan');
const logger = require('winstonson')(module);

logger.setDateFormat('YYYY-MM-DD HH:MM:ss.SSS');
const serverConfig = config.get('server');
process.title = 'synergen-api-server';

db.connect(err => {
    if (err) throw err;

    const app = express();

    // Add trace logging on HTTP requests with Morgan
    app.use(
        morgan('---> :remote-addr :remote-user :method :url HTTP/:http-version', {
            immediate: true,
            stream: logger.stream('trace')
        })
    );
    app.use(
        morgan('<--- :method :url :status :res[content-length]', {
            immediate: false,
            stream: logger.stream('trace')
        })
    );

    app.use(api);

    // Set up static file serving dynamically based on configuration
    files.init();

    app.use((req, res) => {
        res.status(400).send('Bad request');
    });

    let server = app.listen(serverConfig.port, err => {
        if (err) return console.log(err);
        console.log('Express app listening on port ' + serverConfig.port);
    });

    process.on('SIGINT', () => {
        console.log('\nClosing server');
        server.close();
        console.log('Closing database connection');
        db.close();
        console.log('Goodbye');
        process.exit(0);
    });
});
