const express = require('express');
const stripe = require('stripe');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static('.'));

// In-memory storage (replace with database in production)
const users = new Map();
const subscriptions = new Map();

// Subscription configuration
const SUBSCRIPTION_PRICE = 49.99;
const SUBSCRIPTION_INTERVAL = 'month';

// Helper functions
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const verifyToken = (req, res, next) => {
    const token = req.cookies.auth_token;
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};

const checkSubscription = (req, res, next) => {
    const userId = req.userId;
    const subscription = subscriptions.get(userId);
    
    if (!subscription || subscription.status !== 'active') {
        return res.status(403).json({ error: 'Active subscription required.' });
    }
    
    next();
};

// Routes

// Register/Login (simplified for demo)
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (users.has(email)) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = Date.now().toString();
        
        users.set(email, {
            userId,
            email,
            password: hashedPassword,
            createdAt: new Date()
        });
        
        const token = generateToken(userId);
        res.cookie('auth_token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
        
        res.json({ success: true, userId });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = users.get(email);
        
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        const token = generateToken(user.userId);
        res.cookie('auth_token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
        
        res.json({ success: true, userId: user.userId });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Create Stripe Checkout Session
app.post('/api/create-checkout-session', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        
        // Create or retrieve Stripe customer
        const customer = await stripeClient.customers.create({
            metadata: {
                userId: userId
            }
        });
        
        // Create checkout session
        const session = await stripeClient.checkout.sessions.create({
            customer: customer.id,
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'TCOLE Study Guide - Monthly Subscription',
                        description: 'Access to all TCOLE study materials and practice tests'
                    },
                    unit_amount: Math.round(SUBSCRIPTION_PRICE * 100), // Convert to cents
                    recurring: {
                        interval: SUBSCRIPTION_INTERVAL
                    }
                },
                quantity: 1
            }],
            success_url: `${req.headers.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/cancel.html`,
            metadata: {
                userId: userId
            }
        });
        
        res.json({ url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

// Check subscription status
app.get('/api/subscription-status', verifyToken, (req, res) => {
    const userId = req.userId;
    const subscription = subscriptions.get(userId);
    
    res.json({
        hasActiveSubscription: subscription && subscription.status === 'active',
        subscription: subscription || null
    });
});

// Stripe webhook handler
app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    
    try {
        event = stripeClient.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.log(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle the event
    switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
            const subscription = event.data.object;
            const userId = subscription.metadata.userId;
            
            subscriptions.set(userId, {
                subscriptionId: subscription.id,
                customerId: subscription.customer,
                status: subscription.status,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                updatedAt: new Date()
            });
            break;
            
        case 'customer.subscription.deleted':
            const deletedSub = event.data.object;
            const userIdDeleted = deletedSub.metadata.userId;
            subscriptions.delete(userIdDeleted);
            break;
            
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    
    res.status(200).json({ received: true });
});

// Cancel subscription
app.post('/api/cancel-subscription', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const subscription = subscriptions.get(userId);
        
        if (!subscription) {
            return res.status(404).json({ error: 'No active subscription found' });
        }
        
        await stripeClient.subscriptions.update(subscription.subscriptionId, {
            cancel_at_period_end: true
        });
        
        res.json({ success: true, message: 'Subscription cancelled. Access continues until the end of your current billing period. No refund will be provided.' });
    } catch (error) {
        console.error('Error canceling subscription:', error);
        res.status(500).json({ error: 'Failed to cancel subscription' });
    }
});

// Protected content endpoint
app.get('/api/protected-content', verifyToken, checkSubscription, (req, res) => {
    res.json({ message: 'Access granted to protected content' });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('auth_token');
    res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend accessible at http://localhost:${PORT}`);
});
