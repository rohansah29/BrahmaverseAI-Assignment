# Full Stack Developer Assignment

This monorepo contains two independent tasks:
- `apps/food-ordering-ui`: React + JavaScript + Vite food ordering UI.
- `apps/crm-api`: Express REST API using MongoDB/Mongoose, JWT and bcrypt.

## Live deployments
- Frontend: [https://brahmaverse-frontend.netlify.app/](https://brahmaverse-frontend.netlify.app/)
- CRM API base URL: [https://brahmaverse-crm-api.onrender.com/](https://brahmaverse-crm-api.onrender.com/)
- CRM API health check: [https://brahmaverse-crm-api.onrender.com/health](https://brahmaverse-crm-api.onrender.com/health)

## Requirements
Node.js 20+, npm, Git, and MongoDB locally or a MongoDB Atlas cluster.

## Install
From the root folder:
```bash
npm install
npm run install:all
```

## Configure CRM API
Create `apps/crm-api/.env` and set `MONGO_URL` and a random `JWT_SECRET` of at least 32 characters. `PORT` is optional (defaults to `4000`); `JWT_EXPIRES_IN` and `CORS_ORIGIN` are also supported.
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
- Frontend: deploy to Netlify from the repository root with build command `npm run build:web` and publish directory `apps/food-ordering-ui/dist`.
- CRM API: deploy `apps/crm-api` to Render as a Node web service (root directory `apps/crm-api`, build `npm install`, start `npm start`). Configure `MONGO_URL`, `JWT_SECRET`, `CORS_ORIGIN=https://brahmaverse-frontend.netlify.app`, and `NODE_ENV=production`. Use MongoDB Atlas for hosted database.
- Never commit `.env`. Test `/health` and all API flows after deployment.

## Test checklist
1. Register two employees and login as both.
2. Submit enquiry without a token.
3. Fetch public enquiries with employee A token and claim one.
4. Confirm employee B no longer sees it in public list.
5. Confirm employee A sees it in `/api/enquiries/my`.
6. Employee B claiming the same lead should receive `409 Conflict`.
7. Protected endpoints without a token should return `401`.
