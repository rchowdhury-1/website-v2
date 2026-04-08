# Rizwan Web Studio — Backend API

Express.js REST API for the Rizwan Web Studio SaaS platform. Handles authentication, customer CRM, and Stripe billing.

**Live API:** https://full-stack-saas-landing-with-stripe.onrender.com
**Frontend:** https://riz-website-v2.netlify.app

---

## Features

- JWT-based user authentication (register, login, /me)
- Customer CRM — create, list, delete customers
- Free vs Pro plan enforcement (3 customer limit on Free)
- Stripe Checkout integration for Pro plan upgrade
- PostgreSQL database via Supabase
- `/health` endpoint for Render health checks

---

## Tech stack

- Node.js + Express
- PostgreSQL (`pg`) via Supabase connection pooler
- JWT (`jsonwebtoken`) + bcrypt
- Stripe
- Zod for input validation
- Deployed on Render

---

## Running locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the example env file and fill in your values:
   ```bash
   cp .env.example .env
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:4000`.

---

## Environment variables

| Variable | Description |
|---|---|
| `PORT` | Port to run the server on (default: 4000) |
| `NODE_ENV` | Set to `production` on Render to enable SSL for Supabase |
| `JWT_SECRET` | Secret used to sign and verify JWT tokens — use a long random string |
| `DATABASE_URL` | PostgreSQL connection string — use the **Transaction pooler** URL from Supabase (port 6543) |
| `CORS_ORIGIN` | Allowed frontend origin — no trailing slash (e.g. `https://riz-website-v2.netlify.app`) |
| `STRIPE_SECRET_KEY` | Stripe secret key (starts with `sk_live_` or `sk_test_`) |
| `STRIPE_PRICE_ID` | Stripe Price ID for the Pro plan product |
| `FRONTEND_URL` | Frontend URL used for Stripe success/cancel redirects — no trailing slash |

> **Supabase note:** Use the **Transaction pooler** connection string (port 6543), not the direct connection. The direct connection uses IPv6 which is not supported on Render's free tier.

> **CORS note:** Do not include a trailing slash in `CORS_ORIGIN` or `FRONTEND_URL` — it will cause CORS errors.

---

## API routes

### Auth
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Create account, returns JWT |
| POST | `/auth/login` | No | Login, returns JWT |
| GET | `/auth/me` | Yes | Get logged-in user profile |

### Customers
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/customers` | Yes | List all customers for the user |
| POST | `/customers` | Yes | Create a customer (3 max on Free plan) |
| DELETE | `/customers/:id` | Yes | Delete a customer |

### Billing
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/billing/checkout` | Yes | Create a Stripe Checkout session, returns redirect URL |
| POST | `/billing/upgrade` | Yes | Upgrade user plan to PRO in the database |

### Health
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/health` | No | Returns `{ status: "ok" }` — used by Render health checks |

---

## Deploying to Render

1. Push this repo to GitHub
2. Create a new **Web Service** on Render pointing to `apps/api/back.end`
3. Set **Build Command** to `npm install`
4. Set **Start Command** to `npm start`
5. Add all environment variables from the table above
6. Set `NODE_ENV=production`
7. Use the Supabase **Transaction pooler** URL for `DATABASE_URL`

---

## Frontend setup (Netlify)

The frontend lives in `apps/web/saas-landing-v2`. Set this environment variable in Netlify before deploying:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://full-stack-saas-landing-with-stripe.onrender.com` |

> Vite bakes env vars in at build time — always trigger a redeploy after changing environment variables in Netlify.
