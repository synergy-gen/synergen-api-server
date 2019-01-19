# Synergen REST Responses for Groups

The Group data type will be transformed and returned as the value of the `content` JSON property as follows:

## Group Resource
```json
{
    "id": "",
    "name": "",
    "description": "",
    "creator": {
        "name": "",
        "username": ""
    },
    "createDate": "",
    "_links": {
        "self": "",
        "goals": "",
        "objectives": "",
        "members": ""
    }
}
```

## Group Members Link Response
```json
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

```json
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

```json
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