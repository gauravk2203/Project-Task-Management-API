# Project & Task Management API

REST API for registering users, managing their projects and tasks, filtering and paginating tasks, and reading dashboard statistics.

Users and projects are stored in MySQL. Tasks are stored in MongoDB with Mongoose. A project id in MySQL is stored on each task so the two databases stay linked. Callers only see and change their own records.

## Technologies

- Node.js 20+ (ES modules)
- Express 4
- MySQL 8 via `mysql2` (parameterized SQL, no ORM)
- MongoDB via Mongoose
- Zod for request validation
- bcrypt for password hashes
- JSON Web Tokens (`jsonwebtoken`) for authentication
- pnpm

## Installation

1. Install and start [MySQL 8](https://dev.mysql.com/downloads/installer/). During setup, note the host, port, user, and password. The account needs permission to create a database, or you can create `project_task_db` yourself before the setup script runs.
2. Install and start [MongoDB Community Server](https://www.mongodb.com/try/download/community). On this machine the MongoDB Windows service is enough. The default URI has no username.
3. Install dependencies:

```bash
pnpm install
```

4. Create the environment file:

```bash
copy .env.example .env
```

On macOS or Linux, use `cp .env.example .env`.

5. Edit `.env`. Set `MYSQL_PASSWORD` to the password you chose for MySQL. Replace `JWT_SECRET` with a random string of at least 32 characters. The app refuses to start while the secret is still the placeholder from `.env.example`.

6. Create the MySQL database and tables:

```bash
pnpm db:setup
```

That runs `database/schema.sql`. It is safe to run again.

7. Start the API:

```bash
pnpm dev
```

`pnpm start` runs it without reload. The API listens on `http://localhost:3000` unless `PORT` is set.

Check both databases:

```bash
curl http://localhost:3000/api/health
```

```json
{
  "success": true,
  "message": "OK",
  "data": { "mysql": "up", "mongo": "up" }
}
```

## Environment variables

| Variable | Purpose |
| --- | --- |
| `PORT` | HTTP port. Default `3000`. |
| `NODE_ENV` | `development`, `production`, or `test`. |
| `MYSQL_HOST` | MySQL host. |
| `MYSQL_PORT` | MySQL port. Default `3306`. |
| `MYSQL_USER` | MySQL user. |
| `MYSQL_PASSWORD` | MySQL password. Can be empty for a local root account with no password. |
| `MYSQL_DATABASE` | Database name. The schema script creates `project_task_db`. |
| `MONGODB_URI` | Mongo connection string. Default `mongodb://127.0.0.1:27017/project_task_db`. |
| `JWT_SECRET` | HMAC secret. At least 32 characters. Never commit a real value. |
| `JWT_EXPIRES_IN` | Token lifetime. Default `7d`. |
| `BCRYPT_SALT_ROUNDS` | bcrypt cost. Default `12`. Allowed range is 10–15. |

Do not commit `.env`. `.gitignore` already excludes it.

## MySQL

`database/schema.sql` creates:

- `users` — `id`, `name`, `email` (unique), `password_hash`, timestamps
- `projects` — `id`, `user_id` (foreign key to `users`, cascade delete), `title`, `description`, `status` (`active`, `completed`, `archived`), timestamps

Passwords are never stored in plain text and are never returned by the API.

You can also load the file yourself:

```bash
mysql -u root -p < database/schema.sql
```

## MongoDB

Tasks are documents in the database named by `MONGODB_URI`. Mongoose creates the `tasks` collection and indexes on first use. Each task stores `projectId` and `ownerId` as numbers that match the MySQL ids.

Task `status` is `todo`, `in_progress`, or `completed`. Task `priority` is `low`, `medium`, or `high`.

## Response format

Success:

```json
{ "success": true, "message": "Project created", "data": {} }
```

Task lists add pagination:

```json
{
  "page": 1,
  "limit": 10,
  "totalRecords": 42,
  "totalPages": 5
}
```

Error:

```json
{ "success": false, "message": "Project not found" }
```

Validation errors add `errors`:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "title", "message": "String must contain at least 1 character(s)" }]
}
```

A resource the caller does not own returns **404**, the same as a missing one. Invalid ids and invalid bodies return **400**. A missing or bad token returns **401**. A duplicate email returns **409**.

Send the token as `Authorization: Bearer <token>`.

## APIs

### POST `/api/auth/register`

```json
{ "name": "Asha Rao", "email": "asha@example.com", "password": "Password1" }
```

`201`

```json
{
  "success": true,
  "message": "User registered",
  "data": {
    "user": {
      "id": 1,
      "name": "Asha Rao",
      "email": "asha@example.com",
      "createdAt": "2026-10-12T10:00:00.000Z",
      "updatedAt": "2026-10-12T10:00:00.000Z"
    },
    "token": "<jwt>"
  }
}
```

Duplicate email is `409`. A short password or a bad email is `400`.

### POST `/api/auth/login`

```json
{ "email": "asha@example.com", "password": "Password1" }
```

`200` with the same `user` and `token` shape. A wrong email or password is `401` with message `Invalid email or password`.

### GET `/api/auth/me`

Requires a token. `200` with the user object (no password) in `data`.

### PUT `/api/auth/profile`

Requires a token. Send `name`, `email`, or both. This route does not change the password.

```json
{ "name": "Asha R." }
```

`200` with the updated user in `data`. Using another account's email is `409`.

### POST `/api/projects`

```json
{
  "title": "Album launch",
  "description": "Ship the first single",
  "status": "active"
}
```

`description` is optional. `status` is optional and defaults to `active`. Allowed values: `active`, `completed`, `archived`.

`201`

```json
{
  "success": true,
  "message": "Project created",
  "data": {
    "id": 1,
    "userId": 1,
    "title": "Album launch",
    "description": "Ship the first single",
    "status": "active",
    "createdAt": "2026-10-12T10:00:00.000Z",
    "updatedAt": "2026-10-12T10:00:00.000Z"
  }
}
```

### GET `/api/projects`

`200`. `data` is an array of the caller's projects, newest first.

### GET `/api/projects/:id`

`200` with one project, or `404`.

### PUT `/api/projects/:id`

Send at least one of `title`, `description`, `status`. `description: null` or `""` clears it.

```json
{ "status": "completed" }
```

`200` with the updated project.

### DELETE `/api/projects/:id`

`200`

```json
{
  "success": true,
  "message": "Project deleted",
  "data": { "id": 1 }
}
```

Tasks in MongoDB for that project and owner are deleted first.

### POST `/api/tasks`

```json
{
  "title": "Write liner notes",
  "description": "Short bio and credits",
  "status": "todo",
  "priority": "high",
  "projectId": 1,
  "dueDate": "2026-11-01T00:00:00.000Z"
}
```

`projectId` is required and must be a project the caller owns. `status` defaults to `todo`. `priority` defaults to `medium`. `description` and `dueDate` are optional.

`201`

```json
{
  "success": true,
  "message": "Task created",
  "data": {
    "id": "671234567890abcdef123456",
    "title": "Write liner notes",
    "description": "Short bio and credits",
    "status": "todo",
    "priority": "high",
    "projectId": 1,
    "ownerId": 1,
    "dueDate": "2026-11-01T00:00:00.000Z",
    "createdAt": "2026-10-12T10:00:00.000Z",
    "updatedAt": "2026-10-12T10:00:00.000Z"
  }
}
```

A `projectId` the caller does not own is `404`.

### GET `/api/tasks`

Query parameters:

| Param | Default | Rule |
| --- | --- | --- |
| `page` | `1` | Integer, at least 1 |
| `limit` | `10` | Integer from 1 to 100 |
| `status` | none | `todo`, `in_progress`, or `completed` |
| `priority` | none | `low`, `medium`, or `high` |
| `projectId` | none | A project the caller owns |

```http
GET /api/tasks?page=1&limit=10&status=todo&priority=high
```

`200`

```json
{
  "success": true,
  "message": "Tasks fetched",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalRecords": 0,
    "totalPages": 0
  }
}
```

A page past the last page returns an empty `data` array and the real totals. Pending work is not a filter value. Filter `todo` and `in_progress` separately. The dashboard treats both as pending.

### GET `/api/tasks/:id`

`200` with one task, or `404`. A non-ObjectId is `400`.

### PUT `/api/tasks/:id`

Send at least one of `title`, `description`, `status`, `priority`, `projectId`, `dueDate`. A new `projectId` must belong to the caller. `dueDate: null` clears the date.

```json
{ "status": "in_progress" }
```

`200` with the updated task.

### DELETE `/api/tasks/:id`

`200` with `{ "id": "<task id>" }` in `data`.

### GET `/api/dashboard`

`200`

```json
{
  "success": true,
  "message": "Dashboard statistics fetched",
  "data": {
    "totalProjects": 2,
    "activeProjects": 1,
    "completedProjects": 1,
    "totalTasks": 4,
    "pendingTasks": 3,
    "completedTasks": 1,
    "highPriorityTasks": 2
  }
}
```

- `totalProjects` includes `archived`. `activeProjects` and `completedProjects` do not.
- `pendingTasks` is `todo` plus `in_progress`.
- `highPriorityTasks` counts every high-priority task, including completed ones.
- Project counts come from MySQL. Task counts come from MongoDB.

### GET `/api/health`

No token. `200` when MySQL and MongoDB both answer. `503` when one of them does not.

## Postman

Import `postman/project-task-api.postman_collection.json`. The collection variable `baseUrl` is `http://localhost:3000`.

Run the whole collection with the Collection Runner, top to bottom. Register and login save `token`. Creating a project saves `projectId`. Creating a task saves `taskId`. A second user is stored in `otherToken` and is used for the "not your resource" checks. The last requests delete the task and the project.

A full run of that collection is below: 53 tests passed and 0 failed. The visible requests cover health (`200`), invalid registration (`400`), a new user (`201`), a duplicate email (`409`), and a bad login (`401`).

![Postman Collection Runner results for the Project and Task Management API, 53 passed and 0 failed](assests/postman_log%20image.png)

## If startup cannot reach MySQL

Set `MYSQL_USER` and `MYSQL_PASSWORD` in `.env` to an account that can create a database, then run:

```bash
pnpm db:setup
pnpm dev
```

A rejected login means the user or password is wrong. A connection error means the MySQL service is stopped. A missing database or missing tables is fixed by `pnpm db:setup`.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start with nodemon |
| `pnpm start` | Start once |
| `pnpm db:setup` | Apply `database/schema.sql` |

