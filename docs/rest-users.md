# Synergen REST Responses for Users

The User data type will be transformed and returned as the value of the `content` JSON property as follows:

## User Resource

```json5
{
  "id": "",
  "name": "",
  "username": "",
  "email": "",
  "lastLogin": "",
  "goals": [
    // An array of goal objects (see accompanying rest-goals.md file)
  ],
  "objectives": [
    // An array of objective objects (see accompanying rest-objectives.md file)
  ],
  "createDate": 0,
  "updateDate": 0,
  "active": false,
  "_links": {
    "self": "",
    "goals": "",
    "objectives": ""
  }
}
```
