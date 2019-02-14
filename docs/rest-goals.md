# Synergen REST Responses for Goals

The Goal data type will be transformed and returned as the value of the `content` JSON property as follows:

## Goal Resource

```json5
{
  "id": "",
  "title": "",
  "description": "",
  "tasks": [
    // Array of task objects (see accompanying rest-tasks.md file)
  ],
  "creator": "", // the username of the creator
  "public": false,
  "adoptions": 0,
  "parent": "", // the id of the parent goal, if it was adopted
  "tags": [""],
  "createDate": 0,
  "updateDate": 0,
  "targetDate": 0,
  "_links": {
    "self": "",
    "tasks": "",
    "adoptions": "",
    "parent": "", // the URL of the resource representing the public goal this was adopted from (if adopted)
  }
}
```

## New Goal

When the server receives a new goal via a POST request, it will expect it to be in the following format

```json5
{
  "title": "",
  "description": "",
  "tasks": [""], // array of strings containing task details
  "tags": [""], // array of strings containing tag names
  "creator": "", // the user id of the creator (not username)
  "targetDate": 0,
}
```
