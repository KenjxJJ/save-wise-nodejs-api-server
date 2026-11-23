# SaveWise API Server

REST API for personal savings tracking and financial goal management.

## 🚀 Live API Deployment
- **Base URL:** [https://save-wise-nodejs-api-server.onrender.com](https://save-wise-nodejs-api-server.onrender.com)
- **Health Check:** [https://save-wise-nodejs-api-server.onrender.com/health](https://save-wise-nodejs-api-server.onrender.com/health)

## Tech Stack
- **Node.js** & **TypeScript**
- **Express.js**
- **MongoDB Atlas** (Mongoose)

## Setup & Run (Local Development)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure `.env`:**
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   CLIENT_URL=http://localhost:3000
   JWT_ACCESS_SECRET=your_jwt_access_secret
   JWT_REFRESH_SECRET=your_jwt_refresh_secret
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=30d
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

## API Endpoints (`/api/v1`)

### System & Health

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | API Welcome message & endpoint directory | No |
| `GET` | `/health` | Server uptime and timestamp health status | No |

### Authentication & Users

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register new user with email & password | No |
| `POST` | `/api/v1/auth/login` | Authenticate and obtain JWT access & refresh tokens | No |
| `POST` | `/api/v1/auth/refresh-token` | Exchange valid refresh token for a new access token | No |
| `GET` | `/api/v1/users/me` | Fetch authenticated user profile | Yes (Bearer) |
| `PATCH` | `/api/v1/users/me` | Update authenticated user profile | Yes (Bearer) |

## 📖 Front-End Developer Guide & Postman Reference

A comprehensive integration guide for front-end engineers (React, Next.js, Vue, mobile) is available at:
👉 **[`POSTMAN_REFERENCE.md`](./POSTMAN_REFERENCE.md)**

It includes:
- Complete endpoint directory with exact request & response payloads.
- JWT token refresh flow (with an Axios interceptor code snippet).
- Standardized response envelopes and Zod validation error format (`422`).
- Step-by-step instructions for importing and running the collection in Postman.

## 🧪 Postman & Automated Newman Testing

A complete Postman v2.1 collection file is provided directly in the root directory:
📁 **[`SaveWise_API_Collection.json`](./SaveWise_API_Collection.json)**

### How to Import into Your Postman Account Workspace:
1. Open your **Postman** desktop app (or [Postman Web](https://go.postman.co)).
2. Click **Import** (top left).
3. Drag & drop or select `SaveWise_API_Collection.json`.
4. Configure the **`baseUrl`** variable in Collection Variables:
   - **Live Production:** `https://save-wise-nodejs-api-server.onrender.com`
   - **Local Development:** `http://localhost:5000`
5. Running **Register** or **Login** automatically captures and sets `accessToken` and `refreshToken` variables for subsequent protected `/me` calls.
6. The test suite includes 17 test requests covering positive flows, token refresh, and validation/negative test cases.

### Run Newman Automated Test Suite via Terminal:
```bash
# Test against Render live deployment
npm run test:api:live

# Test against local dev server (requires npm run dev running on port 5000)
npm run test:api
```