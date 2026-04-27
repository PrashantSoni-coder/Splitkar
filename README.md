# SplitKar 💸
> Split expenses with friends & groups — effortlessly.

## Tech Stack
| Layer       | Technology                          |
|-------------|-------------------------------------|
| Runtime     | Node.js 18+                         |
| Framework   | Express 4                           |
| Templating  | EJS + express-ejs-layouts           |
| Database    | MongoDB Atlas (Mongoose)            |
| Auth        | express-session + connect-mongo     |
| Email       | Nodemailer + Gmail SMTP             |
| Security    | Helmet, express-rate-limit, bcryptjs|
| Deployment  | Render (free tier)                  |

## Local Development

### 1. Clone & Install
```bash
git clone https://github.com/your-username/splitkar.git
cd splitkar
npm install
```

### 2. Environment Variables
```bash
cp .env.example .env
```
Fill in `.env` with your values (see `.env.example` for guidance).

### 3. Run
```bash
npm run dev     # development (nodemon)
npm start       # production
```

App runs at `http://localhost:3000`

---

## Deployment on Render

### Step 1 — MongoDB Atlas
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → create a free M0 cluster
2. Create a database user (username + password)
3. Add `0.0.0.0/0` to Network Access (allows Render IPs)
4. Copy your connection string:
   `mongodb+srv://<user>:<password>@cluster.mongodb.net/splitkar?retryWrites=true&w=majority`

### Step 2 — Gmail App Password
1. Enable 2FA on your Google Account
2. Go to **Google Account → Security → App Passwords**
3. Generate a password for "Mail" → copy the 16-character password
4. Use this as `EMAIL_PASS` (NOT your Gmail password)

### Step 3 — Deploy on Render
1. Push your project to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repo
4. Render auto-detects `render.yaml` — confirm settings
5. Add Environment Variables in Render dashboard:
   | Key              | Value                        |
   |------------------|------------------------------|
   | `MONGO_URI`      | Your Atlas connection string |
   | `SESSION_SECRET` | A random 32+ char string     |
   | `EMAIL_USER`     | your Gmail address           |
   | `EMAIL_PASS`     | Your 16-char App Password    |
   | `APP_URL`        | https://splitkar.onrender.com|
6. Click **Deploy** — done!

### Step 4 — Verify
- Visit `https://splitkar.onrender.com/health` — should return `{"status":"ok",...}`
- Register an account and check your email

---

## Project Structure
```
SplitKar/
├── config/          # DB + Mailer setup
├── controllers/     # Route handlers
├── middleware/      # Auth, errors, rate limiting, validation
├── models/          # Mongoose schemas
├── routes/          # Express routers
├── utils/           # splitCalculator, sendEmail
├── views/           # EJS templates
│   ├── layouts/     # Base layout
│   ├── partials/    # Navbar, footer, flash, expenseCard
│   ├── auth/        # Login, register
│   ├── dashboard/
│   ├── groups/
│   ├── expenses/
│   └── activity/
├── public/          # Static CSS, JS, images
├── app.js           # Express app
├── server.js        # Entry point
└── render.yaml      # Render deployment config
```

## Health Check
`GET /health` — returns DB status, uptime, environment.
Used by Render to monitor app health.

## Security Features
- Passwords hashed with bcrypt (salt 12)
- Sessions stored in MongoDB (not memory)
- HTTP-only, secure, same-site cookies
- Helmet CSP headers
- Global + auth-specific rate limiting
- Input validation on all POST/PUT routes
- Session regeneration on login (prevents fixation)
- Method override for PUT/DELETE from HTML forms
