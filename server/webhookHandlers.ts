import { getStripeSync, getUncachableStripeClient } from './stripeClient';
import { storage } from './storage';

const TIER_PRODUCT_MAP: Record<string, string> = {
  'STBCS Supporter': 'supporter',
  'STBCS Pro': 'pro',
  'STBCS Business': 'business',
};

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature);

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn('[Stripe] STRIPE_WEBHOOK_SECRET not set — skipping custom event handling for security');
      return;
    }

    const stripe = await getUncachableStripeClient();
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    await WebhookHandlers.handleEvent(event);
  }

  static async handleEvent(event: any): Promise<void> {
    const eventType = event.type;

    switch (eventType) {
      case 'checkout.session.completed':
        await WebhookHandlers.handleCheckoutComplete(event.data.object);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await WebhookHandlers.handleSubscriptionChange(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await WebhookHandlers.handleSubscriptionCanceled(event.data.object);
        break;
    }
  }

  static async handleCheckoutComplete(session: any): Promise<void> {
    const customerId = session.customer;
    const subscriptionId = session.subscription;
    const customerEmail = session.customer_email || session.customer_details?.email;

    if (!customerEmail) return;

    const user = await storage.getUserByEmail(customerEmail);
    if (user) {
      await storage.updateUserStripe(user.id, customerId, subscriptionId);
      console.log(`[Stripe] Linked customer ${customerId} to user ${user.email}`);
    }
  }

  static async handleSubscriptionChange(subscription: any): Promise<void> {
    const customerId = subscription.customer;
    const status = subscription.status;

    if (status !== 'active' && status !== 'trialing') {
      return;
    }

    const user = await storage.getUserByStripeCustomerId(customerId);
    if (!user) return;

    const stripe = await getUncachableStripeClient();
    const items = subscription.items?.data || [];
    
    for (const item of items) {
      const priceId = item.price?.id;
      if (!priceId) continue;

      const price = await stripe.prices.retrieve(priceId, { expand: ['product'] });
      const product = price.product as any;
      const productName = product?.name || '';

      const tier = TIER_PRODUCT_MAP[productName] || 'supporter';
      await storage.updateUserTier(user.id, tier);
      console.log(`[Stripe] Updated user ${user.email} to tier: ${tier}`);
      break;
    }
  }

  static async handleSubscriptionCanceled(subscription: any): Promise<void> {
    const customerId = subscription.customer;
    
    const user = await storage.getUserByStripeCustomerId(customerId);
    if (!user) return;

    await storage.updateUserTier(user.id, 'free');
    console.log(`[Stripe] Downgraded user ${user.email} to free tier`);
  }
}
