# BookBase — Backend

REST API for the BookBase Library Management System.

## Tech

Node.js, Express 5, MongoDB with Mongoose, JWT authentication, bcrypt, node-cron.

## Run locally

```bash
npm install
cp .env.example .env     # fill in MONGO_URI and JWT_SECRET
npm run seed             # optional: adds 12 sample books
npm run dev              # or: npm start
```

The API runs on `http://localhost:5000`.

## Environment variables

| Variable                   | Required | Description |
| -------------------------- | -------- | ----------- |
| `MONGO_URI`                | yes      | MongoDB connection string (local or Atlas) |
| `JWT_SECRET`               | yes in production | Long random string used to sign tokens |
| `JWT_EXPIRES_IN`           | no       | Token lifetime, default `7d` |
| `PORT`                     | no       | Default `5000` (hosts usually set it) |
| `NODE_ENV`                 | no       | `production` makes `JWT_SECRET` mandatory |
| `CLIENT_URL`               | recommended | Frontend URL(s), comma-separated, for CORS. Empty = allow all (dev only) |
| `ALLOW_ADMIN_REGISTRATION` | no       | `false` hides admin sign-up from the public form |
| `CUSTOM_DNS`               | no       | `false` turns off the Google DNS workaround for Atlas SRV lookups |

## API overview

| Area | Endpoints |
| ---- | --------- |
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Books (public) | `GET /api/books` (`?category=`), `GET /api/books/:id`, `GET /api/books/search?title=&author=&category=` |
| Books (admin) | `POST/GET /api/admin/books`, `GET/PUT/DELETE /api/admin/books/:id` |
| Profile | `GET/PUT /api/users/profile`, `PUT /api/users/password` |
| Members (admin) | `GET /api/admin/users`, `GET /api/admin/users/:id`, `PUT /api/admin/users/:id/block`, `PUT /api/admin/users/:id/unblock` |
| Borrowing (user) | `POST /api/borrowings/borrow`, `PUT /api/borrowings/:id/return`, `GET /api/borrowings/my-books`, `GET /api/borrowings/history` |
| Borrowing (admin) | `GET /api/admin/borrowings` (`?status=`, `?userId=`), `GET /api/admin/borrowings/overdue`, `GET /api/admin/borrowings/returned`, `PUT /api/admin/borrowings/:id/return` |
| Dashboard & reports | `GET /api/admin/dashboard`, `GET /api/admin/reports/:type` (books, users, borrowings, overdue) |
| Settings | `GET/PUT /api/admin/settings`, `GET /api/settings` (public) |

## Borrowing rules

- A member can hold up to **Maximum books per user** (Settings) and can't borrow the same book twice.
- The due date is today + **Borrow duration** days.
- A daily cron job (and every time loans are viewed) marks loans past their due date as **OVERDUE**.
  Books are not returned automatically; stock only goes back up when the book is actually returned.
- Books that are currently on loan can't be deleted, and a book's quantity can't go below the copies on loan.

## Deploy (e.g. Render)

1. Create a free MongoDB Atlas cluster and copy its connection string.
2. New Web Service → root of this project, build `npm install`, start `npm start`.
3. Add the environment variables above (`NODE_ENV=production`, a strong `JWT_SECRET`,
   `CLIENT_URL` = your frontend URL).
4. In Atlas → Network Access, allow the host's IPs (or `0.0.0.0/0` for a student project).
