# Synergen REST Responses for Users

The User data type will be transformed and returned as the value of the `content` JSON property as follows:

## User Resource

```json
{
  "id": "",
  "name": "",
  "username": "",
  "email": "",
  "lastLogin": "",
  "_links": {
    "self": "",
    "tasks": "",
    "goals": "",
    "objectives": ""
  }
}
```

## User Tasks Link Response

```json
{
  "total": 0,
  "tasks": [
    // Array of RESTful task objects
  ],
  "_links": {
    "self": ""
  }
}
```

## User Goals Link Response

```json
{
  "total": 0,
  "goals": [
    // Array of RESTful goal objects
  ],
  "_links": {
    "self": ""
  }
}
```

## User Objectives Link Response

```json
{
  "total": 0,
  "objectives": [
    // Array of RESTful objective objects
  ],
  "_links": {
    "self": ""
  }
}
```
