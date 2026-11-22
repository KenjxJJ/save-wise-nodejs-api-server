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

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Server health & uptime check |
| `GET` | `/api/v1/goals` | Get all savings goals |
| `POST` | `/api/v1/goals` | Create a savings goal |
| `GET` | `/api/v1/goals/:id` | Get single savings goal |
| `PUT` | `/api/v1/goals/:id` | Update savings goal |
| `DELETE` | `/api/v1/goals/:id` | Delete savings goal |
| `GET` | `/api/v1/transactions` | Get transactions list |
| `POST` | `/api/v1/transactions` | Add a deposit/expense |
| `DELETE` | `/api/v1/transactions/:id` | Delete a transaction |
| `GET` | `/api/v1/summary` | Get savings summary & analytics |m