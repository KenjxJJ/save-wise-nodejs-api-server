# SaveWise API Server

REST API for personal savings tracking and financial goal management.

## Tech Stack
- **Node.js** & **TypeScript**
- **Express.js**
- **MongoDB Atlas** (Mongoose)

## Setup & Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure `.env`:**
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   CLIENT_URL=http://localhost:3000
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

## API Endpoints (`/api/v1`)

### Authentication & Users

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register new user with email & password | No |
| `POST` | `/api/v1/auth/login` | Authenticate and obtain JWT access & refresh tokens | No |
| `POST` | `/api/v1/auth/refresh-token` | Exchange valid refresh token for a new access token | No |
| `GET` | `/api/v1/users/me` | Fetch authenticated user profile | Yes (Bearer) |
| `PATCH` | `/api/v1/users/me` | Update authenticated user profile | Yes (Bearer) |

## Postman & API Client Testing

A complete Postman v2.1 collection file is provided directly in the root directory:
📁 **[`SaveWise_API_Collection.json`](./SaveWise_API_Collection.json)**

### How to Import into Postman:
1. Open Postman.
2. Click **Import** (top left).
3. Drag & drop or select `SaveWise_API_Collection.json`.
4. The collection comes pre-configured with collection variables (`baseUrl`, `accessToken`, `refreshToken`).
5. Running **Register** or **Login** automatically captures and sets the `accessToken` and `refreshToken` variables for subsequent protected `/me` calls.