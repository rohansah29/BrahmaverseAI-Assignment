# CRM API testing guide (Windows PowerShell)

This guide is based on the checked-in route definitions in `src/app.js`, `src/routes/userRoutes.js`, and `src/routes/enquiryRoutes.js`. It uses `curl.exe` (not PowerShell's `curl` alias) and does not use real credentials.

## Before testing

There is no `.env.example` in `apps/crm-api`. The code reads these environment variables:

- `MONGO_URL` is required by `src/config/db.js`.
- `JWT_SECRET` is required by `src/server.js` and must contain at least 32 characters.
- `PORT` is optional; the default is `4000`.
- `JWT_EXPIRES_IN` is optional; the default token lifetime is `1d`.
- `CORS_ORIGIN` is optional; its default is `http://localhost:5173`. Multiple origins can be comma-separated.

Set up those values in your local `.env` without sharing them. Start the API in a separate PowerShell window from the repository root:

```powershell
npm run dev --workspace @assignment/crm-api
```

The server only listens after MongoDB connects and the JWT secret passes the startup check. In the PowerShell window used for requests, set the base URL. Change the port if your `PORT` differs:

```powershell
$baseUrl = "http://localhost:4000"
```

## Implemented endpoints

| Method | Path | Authentication | Purpose |
| --- | --- | --- | --- |
| `GET` | `/health` | None | API health |
| `POST` | `/api/auth/register` | None | Register employee/counselor |
| `POST` | `/api/auth/login` | None | Log in and issue JWT |
| `POST` | `/api/enquiries` | None | Submit a public enquiry |
| `GET` | `/api/enquiries/public` | Bearer JWT | List unclaimed enquiries |
| `PATCH` | `/api/enquiries/:id/claim` | Bearer JWT | Claim one enquiry |
| `GET` | `/api/enquiries/my` | Bearer JWT | List enquiries claimed by the JWT user |

No controller files, user-list endpoint, logout endpoint, or other API routes are present in `apps/crm-api/src`.

## Run requests in this order

### 1. Health check

```powershell
curl.exe -i "$baseUrl/health"
```

Expected: `200 OK`

```json
{"status":"ok","service":"crm-api"}
```

### 2. Register a test counselor

Change the email if you have already registered it. The route trims the name/email, lowercases the email, and hashes the password before saving it.

```powershell
curl.exe -i -X POST "$baseUrl/api/auth/register" -H "Content-Type: application/json" --data-raw '{"name":"CRM Test Counselor","email":"crm.tester@example.com","password":"TestPassword123"}'
```

Required JSON fields: `name` (string, at least 2 characters), `email` (valid email string), and `password` (string, 8–72 characters).

Expected: `201 Created`

```json
{"msg":"Employee registered successfully","user":{"id":"<user-id>","name":"CRM Test Counselor","email":"crm.tester@example.com"}}
```

### 3. Log in and save the JWT token

Use the same email/password as registration. This PowerShell pipeline parses the JSON response and stores its `token` field in `$token` for the later requests.

```powershell
$loginResponse = curl.exe -sS -X POST "$baseUrl/api/auth/login" -H "Content-Type: application/json" --data-raw '{"email":"crm.tester@example.com","password":"TestPassword123"}' | ConvertFrom-Json
$token = $loginResponse.token
$loginResponse | ConvertTo-Json -Depth 5
```

Expected: `200 OK`

```json
{"msg":"Logged in successfully","token":"<JWT>","user":{"id":"<user-id>","name":"CRM Test Counselor","email":"crm.tester@example.com"}}
```

If not using the PowerShell pipeline, copy the `token` value from the login JSON and set it manually with `$token = "<JWT>"`. Protected routes require `Authorization: Bearer <JWT>`.

### 4. Submit a public enquiry and save its actual ID

No authentication is required. `phone` and `message` are optional strings; `name`, `email`, and `courseInterest` are required and validated.

```powershell
$enquiryResponse = curl.exe -sS -X POST "$baseUrl/api/enquiries" -H "Content-Type: application/json" --data-raw '{"name":"Postman Test Lead","email":"lead.tester@example.com","phone":"9876543210","courseInterest":"React Development","message":"Please contact me about the course."}' | ConvertFrom-Json
$enquiryId = $enquiryResponse.enquiry.id
$enquiryResponse | ConvertTo-Json -Depth 5
```

Expected: `201 Created`

```json
{"msg":"Enquiry submitted successfully","enquiry":{"id":"<enquiry-id>","name":"Postman Test Lead","email":"lead.tester@example.com","courseInterest":"React Development","status":"public"}}
```

`$enquiryId` is taken from the response's actual `enquiry.id`; the next claim request uses that value.

### 5. Fetch unclaimed public enquiries

Requires the login token. `limit` is optional; the server defaults it to 20 and clamps it to the range 1–100.

```powershell
curl.exe -i "$baseUrl/api/enquiries/public?limit=20" -H "Authorization: Bearer $token"
```

Expected: `200 OK`

```json
{"enquiries":[{"_id":"<enquiry-id>","name":"Postman Test Lead","email":"lead.tester@example.com","phone":"9876543210","courseInterest":"React Development","message":"Please contact me about the course.","claimedBy":null,"claimedAt":null,"createdAt":"<timestamp>","updatedAt":"<timestamp>"}]}
```

The query returns enquiries where `claimedBy` is `null`, newest first, and omits `__v`.

### 6. Claim the test enquiry

Requires the login token and the `$enquiryId` saved in step 4.

```powershell
curl.exe -i -X PATCH "$baseUrl/api/enquiries/$enquiryId/claim" -H "Authorization: Bearer $token"
```

Expected: `200 OK`

```json
{"msg":"Enquiry claimed successfully","enquiry":{"_id":"<enquiry-id>","name":"Postman Test Lead","email":"lead.tester@example.com","courseInterest":"React Development","claimedBy":"<user-id>","claimedAt":"<timestamp>"}}
```

### 7. Fetch enquiries for the logged-in counselor

Requires the login token. The authenticated user's ID comes from the verified JWT.

```powershell
curl.exe -i "$baseUrl/api/enquiries/my" -H "Authorization: Bearer $token"
```

Expected: `200 OK`, with `{ "enquiries": [...] }` ordered by `claimedAt` descending. The enquiry claimed in step 6 should be in this array.

## Authentication and validation checks

### 8. Try protected routes without a token

Each request should return `401 Unauthorized` with `{"error":"Please login to continue"}`.

```powershell
curl.exe -i "$baseUrl/api/enquiries/public"
curl.exe -i "$baseUrl/api/enquiries/my"
curl.exe -i -X PATCH "$baseUrl/api/enquiries/$enquiryId/claim"
```

An invalid, expired, or malformed bearer token also returns `401`, with `{"error":"Invalid or expired token"}`. A verified token without a `userID` claim returns `401` with `{"error":"Invalid token"}`.

### 9. Try invalid credentials and request bodies

Login with the wrong password or an unregistered email: `401` with `{"error":"Invalid email or password"}`.

```powershell
curl.exe -i -X POST "$baseUrl/api/auth/login" -H "Content-Type: application/json" --data-raw '{"email":"crm.tester@example.com","password":"WrongPassword123"}'
```

Login missing either string field: `400` with `{"error":"Email and password are required"}`.

```powershell
curl.exe -i -X POST "$baseUrl/api/auth/login" -H "Content-Type: application/json" --data-raw '{"email":"crm.tester@example.com"}'
```

Registration invalid name: `400` with `{"error":"Name must contain at least 2 characters"}`. Invalid email: `400` with `{"error":"Valid email is required"}`. Password outside 8–72 characters: `400` with `{"error":"Password must be 8–72 characters"}`. Existing email: `409` with `{"error":"Employee already exists"}`.

```powershell
curl.exe -i -X POST "$baseUrl/api/auth/register" -H "Content-Type: application/json" --data-raw '{"name":"A","email":"another@example.com","password":"TestPassword123"}'
curl.exe -i -X POST "$baseUrl/api/auth/register" -H "Content-Type: application/json" --data-raw '{"name":"Valid Name","email":"not-an-email","password":"TestPassword123"}'
curl.exe -i -X POST "$baseUrl/api/auth/register" -H "Content-Type: application/json" --data-raw '{"name":"Valid Name","email":"another@example.com","password":"short"}'
curl.exe -i -X POST "$baseUrl/api/auth/register" -H "Content-Type: application/json" --data-raw '{"name":"CRM Test Counselor","email":"crm.tester@example.com","password":"TestPassword123"}'
```

Enquiry invalid name returns `400` with `{"error":"Name must contain at least 2 characters"}`; invalid email returns `400` with `{"error":"Valid email is required"}`; invalid/missing course interest returns `400` with `{"error":"Course interest is required"}`.

```powershell
curl.exe -i -X POST "$baseUrl/api/enquiries" -H "Content-Type: application/json" --data-raw '{"name":"A","email":"valid@example.com","courseInterest":"React Development"}'
curl.exe -i -X POST "$baseUrl/api/enquiries" -H "Content-Type: application/json" --data-raw '{"name":"Valid Name","email":"not-an-email","courseInterest":"React Development"}'
curl.exe -i -X POST "$baseUrl/api/enquiries" -H "Content-Type: application/json" --data-raw '{"name":"Valid Name","email":"valid@example.com","courseInterest":"x"}'
```

### 10. Try claim error cases

All claim requests below require a valid token. Invalid ObjectId format returns `400`; a valid but nonexistent ObjectId returns `404`; claiming an already claimed enquiry returns `409`.

```powershell
curl.exe -i -X PATCH "$baseUrl/api/enquiries/not-an-id/claim" -H "Authorization: Bearer $token"
curl.exe -i -X PATCH "$baseUrl/api/enquiries/000000000000000000000001/claim" -H "Authorization: Bearer $token"
curl.exe -i -X PATCH "$baseUrl/api/enquiries/$enquiryId/claim" -H "Authorization: Bearer $token"
```

The last command should return `409` after step 6.

## Other implemented behavior

Unknown paths return `404` with `{"error":"Route not found"}`:

```powershell
curl.exe -i "$baseUrl/not-a-route"
```

CORS allows requests without an `Origin` header and configured origins. The default allowed origin is `http://localhost:5173`; a blocked origin returns `403` with `{"error":"Origin not allowed by CORS"}`. This preflight should return `204` when the origin is allowed:

```powershell
curl.exe -i -X OPTIONS "$baseUrl/api/auth/login" -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: Content-Type,Authorization"
curl.exe -i "$baseUrl/health" -H "Origin: http://blocked.example"
```

Database-operation failures generally return `500` with a route-specific message (`Registration failed`, `Login failed`, `Failed to submit enquiry`, `Failed to fetch public enquiries`, `Failed to claim enquiry`, or `Failed to fetch your enquiries`). The global middleware returns `500` with `{"error":"Internal server error"}` for other uncaught server errors. The server refuses to start if `JWT_SECRET` is missing/short or MongoDB cannot connect.
