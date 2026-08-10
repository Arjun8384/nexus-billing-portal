# Nexus Billing Portal

#Live Link: https://nexus-billing-portal.vercel.app

A production-oriented billing and invoice management portal with
**Next.js, React, TypeScript, Express, MongoDB, Stripe, PDFKit, and
Nodemailer**.

## Features

-   Admin and Client authentication
-   Role-based protected routes
-   Login, logout and session persistence
-   Admin invoice dashboard
-   Invoice creation and status management
-   Client-specific invoice access
-   Invoice details page
-   PDF invoice generation and download
-   Stripe Checkout payments
-   Stripe webhook verification
-   Automatic `PAID` invoice status after successful payment
-   Payment receipt email with invoice PDF attachment
-   Payment success/cancelled pages
-   Loading, error and empty states
-   Secure backend middleware with CORS, Helmet, compression and
    centralized errors

## Stack

### Frontend

-   Next.js 16
-   React 19
-   TypeScript
-   Tailwind CSS
-   Lucide React
-   Sonner

### Backend

-   Node.js
-   Express
-   TypeScript
-   MongoDB / Mongoose
-   JWT authentication
-   Stripe
-   PDFKit
-   Nodemailer
-   Helmet
-   CORS
-   Compression
-   Morgan

## Project Structure

``` text
Nexus-billing-portal/
├── client/
│   └── src/
│       ├── app/
│       ├── components/
│       ├── constants/
│       ├── hooks/
│       ├── lib/
│       ├── providers/
│       ├── services/
│       ├── types/
│       └── utils/
│
├── server/
│   └── src/
│       ├── config/
│       ├── constants/
│       ├── middleware/
│       ├── modules/
│       │   ├── auth/
│       │   ├── invoices/
│       │   ├── payments/
│       │   └── users/
│       └── utils/
│
└── README.md
```

## Requirements

Install:

-   Node.js 20+
-   npm
-   MongoDB/MongoDB Atlas
-   Stripe account
-   SMTP/email provider

## Backend Setup

``` bash
cd server
npm install
```

Create `server/.env`:

``` env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>

JWT_SECRET=replace_with_a_long_random_secret

CLIENT_URL=http://localhost:3000

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=Nexus Billing Portal <your-email@example.com>
```

Use the exact variable names expected by the project's environment
configuration.

## Frontend Setup

``` bash
cd client
npm install
```

Create `client/.env.local`:

``` env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

For production:

``` env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

## Run Locally

Backend:

``` bash
cd server
npm run dev
```

Frontend:

``` bash
cd client
npm run dev
```

Frontend:

``` text
http://localhost:3000
```

Backend:

``` text
http://localhost:5000
```

Health check:

``` text
GET /api/health
```

Expected:

``` json
{
  "success": true,
  "message": "Server running successfully"
}
```

## Stripe Configuration

Stripe is required for invoice payments.

### Development

Use Stripe **Test Mode** credentials:

``` env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Never expose either value through the frontend.

### Production

Replace the test credentials with the live credentials:

``` env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Create a production webhook in the Stripe Dashboard pointing to:

``` text
https://your-api-domain.com/api/payments/webhook
```

Enable the event:

``` text
checkout.session.completed
```

Copy the signing secret generated for that **production webhook** into:

``` env
STRIPE_WEBHOOK_SECRET=whsec_...
```

Do not use a test webhook secret with a live Stripe environment.

The backend uses `CLIENT_URL` to create Stripe Checkout return URLs:

``` env
CLIENT_URL=https://your-frontend-domain.com
```

The frontend must provide:

``` text
/client/payment/success
/client/payment/cancelled
```

## Email / Nodemailer

Payment receipts are sent after the Stripe webhook confirms payment.

Configure SMTP:

``` env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=Nexus Billing Portal <your-email@example.com>
```

For production, use a reliable transactional email provider or
authenticated SMTP service.

Never commit SMTP credentials.

The receipt email contains the generated invoice PDF.

## Payment Flow

``` text
Admin
  ↓
Creates invoice
  ↓
Issues invoice
  ↓
Client logs in
  ↓
Client opens invoice
  ↓
Stripe Checkout
  ↓
Successful payment
  ↓
Stripe webhook
  ↓
Backend verifies signature
  ↓
Invoice marked PAID
  ↓
Invoice PDF generated
  ↓
Receipt email sent with PDF
```

The webhook is responsible for changing the invoice payment status. The
frontend must never be trusted to mark an invoice as paid.

## Authentication

The application supports:

``` text
ADMIN
CLIENT
```

Authentication uses secure cookies.

Typical flow:

``` text
Login
 ↓
Backend validates credentials
 ↓
Authentication cookie
 ↓
Protected dashboard
```

Clients only receive invoices associated with their account.

Public client self-registration is intentionally not part of the current
scope. Client accounts may instead be provisioned administratively.

## Invoice Statuses

Invoice status:

``` text
DRAFT
ISSUED
PAID
OVERDUE
CANCELLED
```

Payment status:

``` text
UNPAID
PAID
```

Only eligible issued/unpaid invoices can be sent to Stripe Checkout.

## Production Build

Backend:

``` bash
cd server
npm run build
```

This compiles TypeScript and creates the production `dist` directory.

Frontend:

``` bash
cd client
npm run build
```

Start each application using its configured production start script.

## Production Environment Checklist

### Backend

-   [ ] `NODE_ENV`
-   [ ] `PORT`
-   [ ] `MONGO_URI`
-   [ ] Strong `JWT_SECRET`
-   [ ] Production `CLIENT_URL`
-   [ ] Live `STRIPE_SECRET_KEY`
-   [ ] Production `STRIPE_WEBHOOK_SECRET`
-   [ ] SMTP configuration
-   [ ] HTTPS enabled
-   [ ] CORS restricted to production frontend

### Frontend

-   [ ] Production `NEXT_PUBLIC_API_URL`
-   [ ] Production build succeeds
-   [ ] Login/logout verified
-   [ ] Protected routes verified

### Stripe

-   [ ] Live Stripe mode enabled when ready
-   [ ] Production webhook created
-   [ ] Webhook URL points to deployed backend
-   [ ] `checkout.session.completed` enabled
-   [ ] Production webhook signing secret configured

### Email

-   [ ] SMTP credentials configured
-   [ ] Sender address/domain verified
-   [ ] Receipt email tested
-   [ ] PDF attachment tested

## Security

-   Never commit `.env` or `.env.local`.
-   Never expose `STRIPE_SECRET_KEY` to the frontend.
-   Never expose `STRIPE_WEBHOOK_SECRET` to the frontend.
-   Use strong random JWT secrets.
-   Use HTTPS in production.
-   Restrict CORS to the real frontend origin.
-   Keep MongoDB credentials private.
-   Restrict MongoDB network access appropriately.
-   Use authenticated SMTP.
-   Verify Stripe webhook signatures.
-   Do not use test Stripe credentials in production.

## Health Check

The backend exposes:

``` text
GET /api/health
```

A successful response confirms that the server is running.

## Current Scope

The project is complete for the current billing-portal requirements.

Optional future enhancement:

-   Admin client-management module
-   Client dropdown during invoice creation instead of entering a raw
    MongoDB `clientId`
-   Administrative client account provisioning UI

These are enhancements and are not required for the current core billing
workflow.

## Development Status

The following have been completed:

-   Frontend
-   Backend
-   Authentication
-   Authorization
-   Invoice management
-   PDF generation
-   Stripe Checkout
-   Stripe webhooks
-   Payment status updates
-   Payment receipt email
-   Production builds
-   Error/loading/empty states

Before production launch, configure the production environment
variables, Stripe webhook, SMTP provider and deployment URLs.

## License

Proprietary project unless a separate license agreement states
otherwise.

Do not publish production credentials or environment configuration.
