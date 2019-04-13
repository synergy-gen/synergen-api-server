# Database Schema for Synergen
Synergen uses a NoSQL database to persist user data. This document describes the schema for how that data should be stored. The database will comprise of five collections.
- An `auth` collection for managing authentication data
- A `users` collection containing User data
- A `packages` collection containing public goal and objective data
- A `groups` collection containing available group information
- A `stats` collection housing statistical data for goals and objectives based on user input

There are several schemas defined below:
- AuthInfo
- User
- Package
- Group
- Objective
- Goal
- Task

## AuthInfo
This object contains information required to perform authentication for users when they sign into the service

| Name | Type | Description |
|:---|:---|:---|
| `_id` | UUID | the unique identifier for the info |
| `user` | UUID | the ID of the user associated with the information |
| `salt` | string | the salt used when computing the password hash |
| `hash` | string | the hash computed from the user's password |
| `mode` | string | the name of the hash mode used to compute the hash |


## User
A user is any person using the system. A user has the following attributes:

| Name | Type | Description |
|:---|:---|:---|
| `_id` | UUID | the unique identifier for the user |
| `username` | string | a unique, user-defined string associated with the user |
| `validated` | bool | a flag indicating whether the user identity has been validated |
| `seenSystemMessage` | number | the number of the last system message seen by the user |
| `name` | string | the name of the user |
| `slogan` | string | a slogan set by the user |
| `email` | string | the email address of the user |
| `phone` | string | the phone number of the user |
| `avatar.mime` | string | the MIME type of the avatar image |
| `avatar.file` | string | the location of the avatar image file |
| `goals` | Goal[] | an array of goals private to the user. Includes adopted goals. |
| `objectives` | Objective[] | an array of objectives private to the user. Includes adopted goals. |
| `friends` | UUID[] | a lisit of user IDs corresponding to this user's friends |
| `createDate` | number |the date when the user was created |
| `updateDate` | number| the date and time when the user's profile was last updated |
| `lastLogin` | UNIX timestamp | a record of the last time the user accessed the service |

## Task
A task is the smallest unit of data in the Synergen service. It has the following attributes:

| Name | Type | Description |
|:---|:---|:---|
| `_id` | UUID | the unique identifier for the task |
| `details` | string | the details of the task |
| `createDate` | number | the date when the task was created |
| `updateDate` | number | the date and time when the task was updated |

## Goal
A goal is essentially a collection of tasks. A goal has the following attributes:

| Name | Type | Description |
|:---|:---|:---|
| `_id` | UUID | |
| `title` | string | the title of the goal |
| `description` | string | a brief description of the goal |
| `tasks` | Task[] | a list of tasks associated with the goal |
| `creator` | UUID | the id of the user who created the goal (useful for public goals and tracking adoptions) |
| `parent.id` | UUID | if adopted, the ID of the package from which it was adopted |
| `parent.version` | string | if adopted, the version of the parent from which this goal was adopted |
| `tags` | string[] | tags that can be searched when users are looking for goals |
| `createDate` | date | the date and time when the goal was created |
| `updateDate` | date | the date and time when the goal was updated |

## Package
There is a special format for the `goals` collection that allows a user to rollback changes they have made to a public goal, or for users searching the goal to adopt an earlier version of the goal. As such, the physical `goals` collection in the database is structured as follows:

| Name | Type | Description |
|:---|:---|:---|
| `_id` | UUID | the id of the goal that has been published. This ID is the same as the id of the goal the user created. |
| `latest` | PublicGoal | the latest version. Stored separately so searches are done more efficiently on it |
| `previous` | PublicGoal[] | A list of all previous versions of the goal |
| `creator` | UUID | the id of the user who created the goal |
| `tags` | string[] | an array of strings used when searching for the goal |
| `parent` | UUID | the id of the public goal this goal was templated from (if it was templated) |
| `publishDate` | number | the date and time when the goal was published |
| `updateDate` | number| the date and time when the public goal information was updated |

The schema for a PublicGoal is simply the bare necessities for creating a goal:

| Name | Type | Description |
|:---|:---|:---|
| `title` | string | the title of the goal |
| `description` | string | a description of the goal |
| `tasks` | string[] | the details for each of the tasks associated with the goal |
| `adoptions` | the number of times this version of the goal has been adopted |

## Objective

Objectives are collections of goals and are the highlest level of organization in the Synergen data hierarchy. Objectives are associated either publically (in the `objectives` collection), with a user (in the `users` collection under a User entry), or with a group (in the `groups` collection under a Group entry). An objective has the following attributes:

| Name | Type | Description |
|:---|:---|:---|
| `_id` | UUID | |
| `title` | string | the title of the objective |
| `description` | string | a brief description of the objective |
| `goals` | Goal[] | a list of goals associated with the objective |
| `creator` | UUID | the id of the user who created the objective (useful for public objectives and tracking adoptions) |
| `public` | boolean | flag to determine whether the objective has been published or not |
| `parent` | UUID | the id of the public objective from which this objecive was adopted |
| `adoptions` | number | the number of times the objective has been adopted |
| `tags` | string[] | tags that can be searched when users are looking for objectives |
| `createDate` | number | the date and time when the objective was created |
| `targetDate` | number | the date (and time) when the objective should be accomplished (set per user or group) |
| `updateDate` | number | the date and time when the objective was updated |

## Group

Groups are collections of users. They are currently always public from the moment they are created, but this functionality will most likely be changed in the future to allow for private groups among a known network of friends. Groups have the following attributes:

| Name | Type | Description |
|:---|:---|:---|
| `_id` | UUID | |
| `name` | string | the name of the group |
| `description` | string | a brief description of the group |
| `goals` | Goal[] | a list of goals associated with the group |
| `objectives` | Objective[] | a list of objectives associated with the group |
| `creator` | UUID | the id of the user who created the group |
| `members` | UUID[] | a list of the ids of users belonging to the group |
| `owners` | UUID[] | a list of group members who have special privileges within the group |
| `createDate` | number | the date the group was created |
| `updateDate` | number | the date and time the group was updated |
| `tags` | string[] | tags that can be searched when users are looking for groups |