# Full Stack Developer Assignment

This monorepo contains two independent tasks:
- `apps/food-ordering-ui`: React + TypeScript + Vite food ordering UI.
- `apps/crm-api`: Express REST API using MongoDB/Mongoose, JWT and bcrypt.

## Requirements
Node.js 20+, npm, Git, and MongoDB locally or a MongoDB Atlas cluster.

## Install
From the root folder:
```bash
npm install
npm run install:all
```

## Configure CRM API
Copy `apps/crm-api/.env.example` to `apps/crm-api/.env`. Set `MONGO_URL` and a random `JWT_SECRET` of at least 32 characters.
```bash
npm run dev:api
```
Health check: `http://localhost:4000/health`.

## Start frontend
In another terminal:
```bash
npm run dev:web
```

## CRM API endpoints
| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/auth/register` | No |
| POST | `/api/auth/login` | No |
| POST | `/api/enquiries` | No |
| GET | `/api/enquiries/public` | Bearer JWT |
| PATCH | `/api/enquiries/:id/claim` | Bearer JWT |
| GET | `/api/enquiries/my` | Bearer JWT |

Send `Authorization: Bearer <token>` to protected endpoints.

## Example payloads
Employee register: `{"name":"Asha Counselor","email":"asha@example.com","password":"StrongPass123!"}`

Public enquiry: `{"name":"Student Name","email":"student@example.com","courseInterest":"Full Stack Development","phone":"9876543210","message":"Please contact me"}`

## Key implementation details
- Passwords are hashed with bcrypt.
- JWT identifies the logged-in employee; client-supplied owner IDs are not trusted.
- `findOneAndUpdate` conditionally claims only an unclaimed lead, so simultaneous claims cannot both succeed.
- Public enquiries are submitted without authentication. Claimed leads disappear from the public list.
- The food app OTP flow is a UI prototype only; it does not send or verify real SMS.

## Deploy
- Deploy `apps/food-ordering-ui` to Vercel (root directory: `apps/food-ordering-ui`, build command `npm run build`, output `dist`).
- Deploy `apps/crm-api` to Render as a Node web service (root directory `apps/crm-api`, build `npm install`, start `npm start`). Configure `MONGO_URL`, `JWT_SECRET`, `CORS_ORIGIN`, and `NODE_ENV=production`. Use MongoDB Atlas for hosted database.
- Never commit `.env`. Test `/health` and all API flows after deployment.

## Test checklist
1. Register two employees and login as both.
2. Submit enquiry without a token.
3. Fetch public enquiries with employee A token and claim one.
4. Confirm employee B no longer sees it in public list.
5. Confirm employee A sees it in `/api/enquiries/my`.
6. Employee B claiming the same lead should receive `409 Conflict`.
7. Protected endpoints without a token should return `401`.
