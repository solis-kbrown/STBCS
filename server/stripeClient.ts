import Stripe from 'stripe';

function getCredentials() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;

  if (!secretKey || !publishableKey) {
    throw new Error('STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY environment variables are required');
  }

  return { secretKey, publishableKey };
}

export async function getUncachableStripeClient() {
  const { secretKey } = getCredentials();
  return new Stripe(secretKey);
}

export async function getStripePublishableKey() {
  const { publishableKey } = getCredentials();
  return publishableKey;
}

export async function getStripeSecretKey() {
  const { secretKey } = getCredentials();
  return secretKey;
}

let stripeSync: any = null;

export async function getStripeSync() {
  if (!stripeSync) {
    const { StripeSync } = await import('stripe-replit-sync');
    const secretKey = await getStripeSecretKey();

    const dbUrl = process.env.DATABASE_URL!;
    const connStr = dbUrl.includes('sslmode=') ? dbUrl : (dbUrl.includes('?') ? `${dbUrl}&sslmode=require&uselibpqcompat=true` : `${dbUrl}?sslmode=require&uselibpqcompat=true`);
    stripeSync = new StripeSync({
      poolConfig: {
        connectionString: connStr,
        max: 2,
      },
      stripeSecretKey: secretKey,
    });
  }
  return stripeSync;
}
