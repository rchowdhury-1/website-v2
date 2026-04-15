# Rizwan Web Studio — Full Stack SaaS Platform

A full stack SaaS web application built as a live portfolio and service platform for **Rizwan Web Studio** — a freelance web development business offering websites, e-commerce stores, and custom CRM solutions.

**Live site:** https://riz-website-v2.netlify.app
**API:** https://full-stack-saas-landing-with-stripe.onrender.com

---

## What this project is

This is a production-ready SaaS application with:

- A **marketing landing page** showcasing services and pricing
- **User authentication** (register, login, JWT-based sessions)
- A **customer CRM** — add, view, and delete customers
- **Stripe Checkout** integration for plan upgrades
- A **Free vs Pro** tier system with feature gating
- A **PostgreSQL** database hosted on Supabase
- Full **REST API** backend deployed on Render

---

## Features

### Marketing site
- Hero section with dynamic CTAs based on login/plan status
- Services section (Business websites, E-commerce, Custom CRM)
- 3-step process explanation
- Pricing section with three tiers (Starter £450, Business + CRM £850, E-commerce from £1,200)
- Contact/CTA section

### Authentication
- Register and login with email and password
- Passwords hashed with bcrypt
- JWT tokens stored in localStorage
- Protected routes — unauthenticated users are redirected to login

### Customer CRM
- Add customers with name, email, and company
- View all customers in a table
- Delete customers
- **Free plan:** limited to 3 customers
- **Pro plan:** unlimited customers

### Billing & Stripe
- Stripe Checkout integration for one-time Pro plan upgrade
- On successful payment, user plan is upgraded to PRO in the database
- Billing page shows current plan and upgrade button
- Checkout redirects back to the app on success or cancellation

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router |
| Backend | Node.js, Express |
| Database | PostgreSQL via Supabase |
| Auth | JWT + bcrypt |
| Payments | Stripe Checkout |
| Frontend hosting | Netlify |
| Backend hosting | Render |

---

## Project structure

```
apps/
  web/saas-landing-v2/   # React frontend (Vite)
  api/back.end/          # Express REST API
```

---

## Getting started

See the individual READMEs:
- [Frontend README](apps/web/saas-landing-v2/README.md)
- [Backend README](apps/api/back.end/README.md)
