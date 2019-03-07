const fs = require('fs');
const path = require('path');
const config = require('config').get('server');

const _files = {};

module.exports = {
    init: () =>
        new Promise((resolve, reject) => {
            // Create all of the directories
            let pending = config.files.length;
            config.files.forEach(file => {
                var filepath;
                // Check to see if we need to create the file in a root directory
                if (file.path.indexOf('/') == 0) {
                    filepath = file.path;
                }
                // We are dealing with a file relative to the cwd() of the node process
                else {
                    filepath = path.join(process.cwd(), file.path);
                }

                // Check to see if the file directory already exists. If it doesn't, create the directory
                fs.exists(filepath, doesExist => {
                    if (!doesExist) {
                        fs.mkdir(filepath, { recursive: true }, err => {
                            if (err)
                                return reject(
                                    new Error('Failed to configure express app for filesystem: ' + err.message)
                                );
                            _files[file.name] = { url: file.url, path: filepath };
                            if (--pending == 0) {
                                return resolve();
                            }
                        });
                    } else {
                        _files[file.name] = { url: file.url, path: filepath };
                        if (--pending == 0) {
                            return resolve();
                        }
                    }
                });
            });
        }),

    getPathFor: name => (_files[name] ? _files[name].path : null),
    getUrlFor: name => (_files[name] ? _files[name].url : null),

    writeStreamToFileIn: (name, file, stream) =>
        new Promise((resolve, reject) => {
            if (!_files[name])
                return reject(
                    new Error('Failed to stream data to file: no file system information for "' + name + '"')
                );

            let out = fs.createWriteStream(path.join(_files[name].path, file));
            out.on('ready', () => {
                stream.on('data', chunk => {
                    out.write(chunk);
                });
            });
            stream.on('end', () => {
                out.end();
                resolve(true);
            });
            stream.on('error', err => {
                reject(new Error('Failed to write stream to file: ' + err.message));
            });
        }),

    readFileToStreamFrom: (name, file, stream) =>
        new Promise((resolve, reject) => {
            if (!_files[name])
                return reject(
                    new Error('Failed to read data to stream: no file system information for "' + name + '"')
                );

            let input = fs.createReadStream(path.join(_files[name].path, file));

            input.on('end', () => {
                resolve(true);
            });
            input.on('error', err => {
                reject(new Error('Failed to read data to stream: ' + err.message));
            });

            input.pipe(stream);
        }),

    writeFileTo: (name, file, data) =>
        new Promise((resolve, reject) => {
            if (!_files[name])
                return reject(new Error('Failed to write data to file: no file system information for "' + name + '"'));

            let location = path.join(_files[name].path, file);

            let output = fs.createWriteStream(location);

            output.on('error', err => {
                reject(new Error('Failed to write data to file: ' + err.message));
            });

            output.on('end', () => {
                resolve(location);
            });

            output.write(data);
            output.end();
        }),

    readFileFrom: (name, file) =>
        new Promise((resolve, reject) => {
            if (!_files[name])
                return reject(
                    new Error('Failed to read data from file: no file system information for "' + name + '"')
                );

            let location = path.join(_files[name].path, file);
            fs.readFile(location, (err, data) => {
                if (err) return reject(new Error('Failed to read data from file: ' + err.message));
                return resolve(data);
            });
        })
};
