/**
 * Stripe Integration Utilities
 * Server-side Stripe SDK for subscription management
 *
 * SETUP REQUIRED:
 * 1. Create Stripe account at https://stripe.com
 * 2. Complete Israeli business verification
 * 3. Add to .env.local:
 *    STRIPE_SECRET_KEY=sk_test_...
 *    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
 *    STRIPE_WEBHOOK_SECRET=whsec_...
 */

import Stripe from 'stripe';

// Initialize Stripe with API key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
  appInfo: {
    name: 'bioGov',
    version: '1.0.0',
  },
});

// Stripe Price IDs (replace with actual IDs after creating products in Stripe Dashboard)
export const STRIPE_PRICE_IDS = {
  starter_monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || 'price_starter_monthly',
  starter_annual: process.env.STRIPE_PRICE_STARTER_ANNUAL || 'price_starter_annual',
  professional_monthly: process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY || 'price_professional_monthly',
  professional_annual: process.env.STRIPE_PRICE_PROFESSIONAL_ANNUAL || 'price_professional_annual',
  business_monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY || 'price_business_monthly',
  business_annual: process.env.STRIPE_PRICE_BUSINESS_ANNUAL || 'price_business_annual',
};

/**
 * Create or retrieve a Stripe customer
 */
export async function createOrRetrieveCustomer(
  email: string,
  userId: string,
  name?: string
): Promise<string> {
  // Check if customer already exists
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0].id;
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      userId,
    },
  });

  return customer.id;
}

/**
 * Create a Stripe Checkout session for subscription
 */
export async function createCheckoutSession(params: {
  customerId: string;
  priceId: string;
  userId: string;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
  trialDays?: number;
}): Promise<Stripe.Checkout.Session> {
  const session = await stripe.checkout.sessions.create({
    customer: params.customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    subscription_data: params.trialDays
      ? {
          trial_period_days: params.trialDays,
          metadata: {
            userId: params.userId,
          },
        }
      : {
          metadata: {
            userId: params.userId,
          },
        },
    metadata: {
      userId: params.userId,
    },
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    locale: 'auto', // Auto-detect locale based on browser
  });

  return session;
}

/**
 * Create a billing portal session for managing subscription
 */
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

/**
 * Retrieve a subscription by ID
 */
export async function retrieveSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    return null;
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  immediately: boolean = false
): Promise<Stripe.Subscription> {
  if (immediately) {
    return await stripe.subscriptions.cancel(subscriptionId);
  } else {
    // Cancel at period end
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }
}

/**
 * Update subscription tier (upgrade/downgrade)
 */
export async function updateSubscriptionTier(
  subscriptionId: string,
  newPriceId: string,
  prorationBehavior: 'always_invoice' | 'create_prorations' | 'none' = 'create_prorations'
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: prorationBehavior,
  });
}

/**
 * Construct webhook event from raw body
 * IMPORTANT: Use this in webhook endpoint
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

/**
 * Create a payment link for one-time payments
 */
export async function createPaymentLink(params: {
  amountCents: number;
  currency: string;
  description: string;
  userId: string;
  invoiceId?: string;
  successUrl?: string;
}): Promise<Stripe.PaymentLink> {
  // Create a one-time price
  const price = await stripe.prices.create({
    unit_amount: params.amountCents,
    currency: params.currency.toLowerCase(),
    product_data: {
      name: params.description,
    },
  });

  // Create payment link
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
    after_completion: params.successUrl
      ? {
          type: 'redirect',
          redirect: {
            url: params.successUrl,
          },
        }
      : {
          type: 'hosted_confirmation',
          hosted_confirmation: {
            custom_message: 'תודה על התשלום! אנו מעבדים את ההזמנה שלך.',
          },
        },
    metadata: {
      userId: params.userId,
      invoiceId: params.invoiceId || '',
    },
  });

  return paymentLink;
}

/**
 * Get Stripe instance (for advanced usage)
 */
export function getStripe(): Stripe {
  return stripe;
}

export default stripe;
