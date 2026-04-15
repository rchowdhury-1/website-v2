# Rizwan Web Studio — Frontend

React frontend for the Rizwan Web Studio SaaS platform. Built with Vite and React Router.

**Live:** https://riz-website-v2.netlify.app
**Backend API:** https://full-stack-saas-landing-with-stripe.onrender.com

---

## Pages & features

| Page | Route | Auth required | Description |
|---|---|---|---|
| Home | `/` | No | Marketing landing page with services, pricing, and CTAs |
| Register | `/register` | No | Create an account |
| Login | `/login` | No | Log in to existing account |
| Dashboard | `/dashboard` | Yes | Welcome screen showing user info |
| Customers | `/customers` | Yes | Add, view, and delete customers (CRM) |
| Billing | `/billing` | Yes | View plan and upgrade to Pro via Stripe |

### Plan-based behaviour
- Logged-out users see marketing CTAs (Get started, Log in)
- Free plan users see upgrade prompts in pricing and billing
- Pro plan users see dashboard links and a "You're on Pro" confirmation

---

## Tech stack

- React 18
- Vite
- React Router v6
- Fetch API (via `src/apiClient.js`)
- Deployed on Netlify

---

## Running locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file:
   ```
   VITE_API_URL=http://localhost:4000
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5173`.

---

## Environment variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | URL of the backend API — set to your Render URL in production |

> Vite bakes env vars in at build time. After changing env vars in Netlify, always trigger a manual redeploy.

---

## Deploying to Netlify

1. Push to GitHub
2. Connect the repo in Netlify → set **Base directory** to `apps/web/saas-landing-v2`
3. Set **Build command** to `npm run build`
4. Set **Publish directory** to `dist`
5. Add environment variable: `VITE_API_URL=https://full-stack-saas-landing-with-stripe.onrender.com`
6. Deploy
