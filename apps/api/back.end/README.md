# SaaSify API

Express.js REST API backend for SaaSify. Uses PostgreSQL (via Supabase) for data storage and Stripe for payments.

## Stack

- Node.js + Express
- PostgreSQL (`pg`)
- JWT authentication
- Stripe Checkout
- Deployed on Render

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

## Environment variables

| Variable | Description |
|---|---|
| `PORT` | Port to run the server on (default: 4000) |
| `JWT_SECRET` | Secret used to sign and verify JWT tokens — use a long random string |
| `DATABASE_URL` | PostgreSQL connection string from Supabase |
| `CORS_ORIGIN` | Allowed frontend origin (e.g. your Netlify URL) |
| `STRIPE_SECRET_KEY` | Stripe secret key (starts with `sk_live_` or `sk_test_`) |
| `STRIPE_PRICE_ID` | Stripe Price ID for the Pro plan product |
| `FRONTEND_URL` | Frontend URL used for Stripe success/cancel redirects |

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
| POST | `/billing/checkout` | Yes | Create a Stripe Checkout session |
| POST | `/billing/upgrade` | Yes | Upgrade user plan to PRO |

### Health
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/health` | No | Returns `{ status: "ok" }` — used by Render health checks |

## Deploying to Render

1. Push this repo to GitHub
2. Create a new **Web Service** on Render, pointing to this directory
3. Set the **Build Command** to `npm install`
4. Set the **Start Command** to `npm start`
5. Add all environment variables from the table above in the Render dashboard
6. Set `NODE_ENV=production` so SSL is enabled for the database connection
