# Errors in the Synergen Service

Backend errors extend the JavaScript `Error` class and have the following fields:

-   `message` - the error message
-   `code` - a unique code for the error
-   `details` - additional information about the error (such as validation error arrays)

## Error Codes

Error codes are split into the following code categories:

-   `100` errors: relating to the model
-   `200` errors: relating to authorization and authentication
-   `300` errors: relating to the file system
    See the `errors.js` file for a list of codes.
