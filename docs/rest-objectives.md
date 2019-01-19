# Synergen REST Responses for Objectives

The Objectives data type will be transformed and returned as the value of the `content` JSON property as follows:

## Objectives Resource

```json
{
  "id": "",
  "title": "",
  "description": "",
  "creator": "",
  "adoptions": "",
  "_links": {
    "self": "",
    "goals": ""
  }
}
```

## Objective Goals Link Response

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
