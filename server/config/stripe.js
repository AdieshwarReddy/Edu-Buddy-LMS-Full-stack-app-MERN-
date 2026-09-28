const Stripe = require('stripe');

const isStripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

const stripe = isStripeConfigured
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
  : null;

module.exports = {
  stripe,
  isStripeConfigured
};
