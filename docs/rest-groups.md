# Synergen REST Responses for Groups

The Group data type will be transformed and returned as the value of the `content` JSON property as follows:

## Group Resource
```json5
{
    "id": "",
    "name": "",
    "description": "",
    "goals": [
      // Array of goal objects (see accompanying rest-goals.md file)
    ],
    "objectives": [
      // Array of objective objects (see accompanying rest-objectives.md file)
    ],
    "creator": "", // the username of the creator
    "members": [""], // array of usernames of the members of the group
    "owners": [""], // array of usernames of the owners of the group
    "tags": [""],
    "createDate": 0,
    "updateDate": 0,
    "_links": {
        "self": "",
        "goals": "",
        "objectives": "",
        "members": "",
        "owners": "",
    }
}
```

## Group Members Link Response
```json5
{
    "total": 0,
    "members": [
        {
            "name": "",
            "username": "",
            "owner": false
        }
    ],
    "_links": {
        "self": ""
    } 
}
```

## Group Goals Link Response

```json5
{
  "total": 0,
  "goals": [
    // Array of RESTful goal objects (see accompanying documentation)
  ],
  "_links": {
    "self": ""
  }
}
```

## Group Objectives Link Response

```json5
{
  "total": 0,
  "objectives": [
    // Array of RESTful objective objects (see accompanying documentation)
  ],
  "_links": {
    "self": ""
  }
}
```