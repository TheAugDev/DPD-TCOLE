# TCOLE Study Guide - Commercial Subscription Platform

A comprehensive, subscription-based study guide for the Texas Commission on Law Enforcement (TCOLE) certification exam.

## Subscription Model

- **Price**: $49.99/month
- **Billing**: Automatic monthly renewal
- **Cancellation**: Users can cancel anytime
- **Access**: Immediate upon subscription, maintained until end of billing period after cancellation
- **Refund Policy**: All sales are final and non-refundable
- **No Commitment**: No long-term contracts required

## Features

- 30+ comprehensive TCOLE study topics
- Interactive study materials
- Mobile-optimized responsive design
- Progress tracking
- Regular content updates
- Secure payment processing via Stripe

## Payment Processing

- Powered by Stripe for secure, PCI-compliant payment processing
- Supports all major credit cards
- Automatic subscription management
- Webhook-based real-time subscription status updates

## Tech Stack

- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Backend**: Node.js, Express
- **Authentication**: JWT-based session management
- **Payments**: Stripe Checkout and Subscriptions API
- **Security**: bcrypt password hashing, HTTP-only cookies

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Stripe keys and JWT secret
   ```

3. **Start the Server**
   ```bash
   npm start
   ```

4. **Access the Application**
   - Navigate to `http://localhost:3000`
   - Register/login to access subscription page
   - Complete Stripe checkout to access study materials

## Stripe Configuration

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Set up webhook endpoints for subscription events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Configure webhook URL: `https://yourdomain.com/api/webhook`

## File Structure

```
├── index.html          # Main study guide interface
├── login.html          # User authentication
├── subscription.html   # Stripe checkout page
├── success.html        # Post-subscription success page
├── cancel.html         # Subscription cancellation page
├── server.js          # Backend API and authentication
├── package.json       # Node.js dependencies
├── .env.example       # Environment variables template
└── topics/            # Individual study topic HTML files
```

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/create-checkout-session` - Create Stripe checkout
- `GET /api/subscription-status` - Check subscription status
- `POST /api/cancel-subscription` - Cancel subscription
- `POST /api/webhook` - Stripe webhook handler

## Production Deployment

For production deployment:

1. Replace in-memory storage with a persistent database (PostgreSQL, MongoDB, etc.)
2. Set up proper environment variables
3. Configure SSL/HTTPS
4. Set up production Stripe webhook endpoints
5. Implement proper error logging and monitoring
6. Add email verification and password recovery
7. Set up automated backups

## Support

For user support and subscription management:
- Email: support@tcolestudyguide.com
- Users can cancel subscriptions through the application or Stripe customer portal

## License

Commercial license - All rights reserved