# Documentation for Synergen v1.0.0

## Database Schema

See the [schema documentation](./db-schema.md) for details.

## RESTful Data Transformation
We don't want to just dump data directly from out database onto our users. This is not only unsightly, but can also introduce potential security or privacy risks. Instead, the following API endpoints have been defined. Each file contains details as to how the resulting responses will be formatted in JSON:
- [Users](./rest-users.md)
- [Tasks](./rest-tasks.md)
- [Goals](./rest-goals.md)
- [Objectives](./rest-objectives.md)
- [Groups](./rest-groups.md)

### REST Response Format
In addition to the formats specified above, EVERY response will be returned from the api server in the following format:

```json5
{
    "api": "<version>", // The version of the API that responded to the request
    "success": true,    // Whether the request was successful (for convenience)
    "status": "",       // The string HTTP error code
    "code": 0,          // The numerical HTTP error code
    "timestamp": 0,     // The time of the completed request
    "message": "",      // A message from the server
    "content": {}       // The response content, determined by the RESTful objects defined above. The content may also
                        // be an array of errors that occured, such as when validation of a request fails
}
```

In the content body there will always be at least one JSON property with the key`"_links"`. These properties contain API endpoints for additional information about the resource. One link to be aware is the `self` link. The `self` link points to the parent resource object. For example, if the response content is structured as follows:

```json5
{
    "foo": {
        "bar": {
            "_links": {
                "self": "/data/bar"
            }
        },
        "_links": {
            "self": "/data/foo"
        }
    }
}
```

Then the `_links.self` field under `"foo"` refers to the Foo object instance, and the `_links.self` field under `"bar"` refers to the Bar object instance. Having these links is very useful and follows REST protocols. For example, a Task object can be associated with a user, goal, or objectives. Goals and objectives can be a part of users, groups, or be public. This means that a `self` link on a Task could be any one of the following:
- `/users/{id}/tasks/{id}`
- `/users/{id}/goals/{id}tasks/{id}`
- `/users/{id}/objectives/{id}/goals/{id}/tasks/{id}`
- `/goals/{id}/tasks/{id}`
- `/objectives/{id}/goals/{id}/tasks/{id}`
- `/groups/{id}/goals/{id}/tasks/{id}`
- `/groups/{id}/objectives/{id}/goals/{id}/tasks/{id}`

Providing the correct link to the application helps increase the usability of the API.