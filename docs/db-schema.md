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
| `_id` | UUID | |
| `name` | string | the name of the user |
| `username` | string | the username defined by the user that can uniquely identify this user. Mutable. |
| `email` | string | the email address of the user |
| `lastLogin` | UNIX timestamp | a record of the last time the user accessed the service |
| `goals` | Goal[] | an array of goals private to the user. Includes adopted goals. |
| `objectives` | Objective[] | an array of objectives private to the user. Includes adopted goals. |
| `createDate` | number |the date when the user was created |
| `updateDate` | number| the date and time when the user's profile was last updated |
| `active` | boolean | flag to confirm whether the user's email has been verified |

## Task

A task is the smallest unit of data in the Synergen service. It has the following attributes:

| Name | Type | Description |
|:---|:---|:---|
| `_id` | UUID | |
| `details` | string | the details of the task |
| `type` | string | the type of task (defaults to `check`) |
| `createDate` | number | the date when the task was created |
| `updateDate` | number | the date and time when the task was updated |

## Goal

A goal is essentially a collection of tasks. Goals are associated either publically (in the `goals` collection), with a user (in the `users` collection under a User entry), or with a group (in the `groups` collection under a Group entry). A goal has the following attributes:

| Name | Type | Description |
|:---|:---|:---|
| `_id` | UUID | |
| `title` | string | the title of the goal |
| `description` | string | a brief description of the goal |
| `tasks` | Task[] | a list of tasks associated with the goal |
| `creator` | UUID | the id of the user who created the goal (useful for public goals and tracking adoptions) |
| `parent` | UUID | the id of the public goal this goal was adopted from. Helpful for tracking stats and other followers. |
| `tags` | string[] | tags that can be searched when users are looking for goals |
| `createDate` | number | the date and time when the goal was created |
| `updateDate` | number | the date and time when the goal was updated |
| `beginDate` | number | the date and time when the goal was started
| `targetDate` | number | the date (and time) when the goal should be accomplished (set per user or group) |

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