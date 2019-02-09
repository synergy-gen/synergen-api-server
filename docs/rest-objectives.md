# Synergen REST Responses for Objectives

The Objectives data type will be transformed and returned as the value of the `content` JSON property as follows:

## Objectives Resource

```json5
{
  "id": "",
  "title": "",
  "description": "",
  "goals": [
    // Array of goal objects (see accompanying rest-goals.md file)
  ],
  "creator": "", // the username of the creator
  "public": false,
  "adoptions": 0,
  "tags": [""],
  "createDate": 0,
  "updateDate": 0,
  "targetDate": 0,
  "_links": {
    "self": "",
    "goals": "",
    "adoptions": "",
    "parent": "", // the resource URL representing the objective this was adopted from (if adopted)
  }
}
```
