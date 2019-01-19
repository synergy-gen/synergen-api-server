# Database Schema for Synergen

Synergen uses a NoSQL database to persist user data. This document describes the schema for how that data should be stored. The database will comprise of four collections.
- A `users` collection containing User data (User[])
- A `goals` collection containing public goal data (Goal[])
- A `objectives` collection containing public objective data (Objective[])
- A `groups` collection containing available group information (Group[])

The schema of the objects stored in each collection are defined below. Additional metadata for each object may be defined as development progresses.

## User

A user is any person using the system. A user has the following attributes:

| Name | Type | Description |
|:---|:---|:---|
| `id` | UUID | |
| `name` | string | the name of the user |
| `username` | string | the username defined by the user that can uniquely identify this user. Mutable. |
| `email` | string | the email address of the user |
| `last_login` | UNIX timestamp | a record of the last time the user accessed the service |
| `tasks` | Task[] | an array of task objects private to the user. Includes adopted goals. |
| `goals` | Goal[] | an array of goals private to the user. Includes adopted goals. |
| `objectives` | Objective[] | an array of objectives private to the user. Includes adopted goals. |

## Task

A task is the smallest unit of data in the Synergen service. It has the following attributes:

| Name | Type | Description |
|:---|:---|:---|
| `id` | UUID | |
| `title` | string | the title of the task |
| `details` | string | the details of the task |
| `type` | string | the type of task (defaults to `check`) |
| `complete` | boolean | flag to indicate if the task has been marked as done |
| `data` | *depends* | additional data associated with the task, determined by the `type` |

## Goal

A goal is essentially a collection of tasks. Goals are associated either publically (in the `goals` collection), with a user (in the `users` collection under a User entry), or with a group (in the `groups` collection under a Group entry). A goal has the following attributes:

| Name | Type | Description |
|:---|:---|:---|
| `id` | UUID | |
| `title` | string | the title of the goal |
| `description` | string | a brief description of the goal |
| `tasks` | Task[] | a list of tasks associated with the goal |
| `creator` | UUID | the id of the user who created the goal (useful for public goals and tracking adoptions) |
| `adoptions` | number | the number of times the goal has been adopted |

## Objective

Objectives are collections of goals and are the highlest level of organization in the Synergen data hierarchy. Objectives are associated either publically (in the `objectives` collection), with a user (in the `users` collection under a User entry), or with a group (in the `groups` collection under a Group entry). An objective has the following attributes:

| Name | Type | Description |
|:---|:---|:---|
| `id` | UUID | |
| `title` | string | the title of the objective |
| `description` | string | a brief description of the objective |
| `goals` | Goal[] | a list of goals associated with the objective |
| `creator` | UUID | the id of the user who created the objective (useful for public objectives and tracking adoptions) |
| `adoptions` | number | the number of times the objective has been adopted |

## Group

Groups are collections of users. They are currently always public from the moment they are created, but this functionality will most likely be changed in the future to allow for private groups among a known network of friends. Groups have the following attributes:

| Name | Type | Description |
|:---|:---|:---|
| `id` | UUID | |
| `name` | string | the name of the group |
| `description` | string | a brief description of the group |
| `goals` | Goal[] | a list of goals associated with the group |
| `objectives` | Objective[] | a list of objectives associated with the group |
| `creator` | UUID | the id of the user who created the group |
| `members` | UUID[] | a list of the ids of users belonging to the group |
| `owners` | UUID[] | a list of group members who have special privileges within the group |
| `create_date` | UNIX timestamp | the date the group was created |