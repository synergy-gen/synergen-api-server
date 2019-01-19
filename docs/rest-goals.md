# Synergen REST Responses for Goals

The Goal data type will be transformed and returned as the value of the `content` JSON property as follows:

## Goal Resource

```json
{
  "id": "",
  "title": "",
  "description": "",
  "creator": "",
  "adoptions": 0,
  "_links": {
    "self": "",
    "tasks": ""
  }
}
```

## Goal Tasks Link Response

```json
{
  "total": 0,
  "tasks": [
    // Array of RESTful task objectis (see accompanying documentation)
  ],
  "_links": {
    "self": ""
  }
}
```
