import { getUncachableStripeClient } from './stripeClient';
import { db } from './db';
import { sql } from 'drizzle-orm';

export class StripeService {
  async createCustomer(email: string, name?: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.customers.create({
      email,
      name: name || undefined,
    });
  }

  async createCheckoutSession(params: {
    priceId: string;
    returnUrl: string;
    customerEmail?: string;
    mode: 'payment' | 'subscription';
    metadata?: Record<string, string>;
  }) {
    const stripe = await getUncachableStripeClient();
    
    const sessionParams: any = {
      ui_mode: 'embedded',
      payment_method_types: ['card'],
      line_items: [{ price: params.priceId, quantity: 1 }],
      mode: params.mode,
      return_url: params.returnUrl,
      customer_email: params.customerEmail,
      metadata: params.metadata,
      billing_address_collection: 'auto',
    };
    
    if (params.mode === 'subscription') {
      try {
        const { isGrandOpeningActive } = await import("./maintenance");
        if (await isGrandOpeningActive()) {
          sessionParams.discounts = [{ coupon: 'GRANDOPENING50' }];
        }
      } catch (error) {
        sessionParams.discounts = [{ coupon: 'GRANDOPENING50' }];
      }
    }
    
    return await stripe.checkout.sessions.create(sessionParams);
  }

  async createDonationCheckout(params: {
    amount: number;
    returnUrl: string;
    customerEmail?: string;
    donorName?: string;
  }) {
    const stripe = await getUncachableStripeClient();
    return await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'STBCS Donation',
            description: 'Support STB Cybersecurity and the security community',
          },
          unit_amount: params.amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      return_url: params.returnUrl,
      customer_email: params.customerEmail,
      metadata: {
        type: 'donation',
        donorName: params.donorName || 'Anonymous',
      },
      billing_address_collection: 'auto',
    });
  }

  async getSessionStatus(sessionId: string) {
    const stripe = await getUncachableStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return {
      status: session.status,
      payment_status: session.payment_status,
      customer_email: session.customer_details?.email || session.customer_email,
      mode: session.mode,
      metadata: session.metadata,
    };
  }

  async createCustomerPortalSession(customerId: string, returnUrl: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }

  async getProduct(productId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.products WHERE id = ${productId} AND livemode = true`
    );
    if (result.rows[0]) return result.rows[0];
    try {
      const stripe = await getUncachableStripeClient();
      const product = await stripe.products.retrieve(productId);
      if (product && product.active && product.livemode) return product;
    } catch {}
    return null;
  }

  async listProducts(active = true) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.products WHERE active = ${active}`
    );
    return result.rows;
  }

  async listProductsWithPrices(active = true) {
    const result = await db.execute(
      sql`
        SELECT 
          p.id as product_id,
          p.name as product_name,
          p.description as product_description,
          p.active as product_active,
          p.metadata as product_metadata,
          p.livemode as product_livemode,
          pr.id as price_id,
          pr.unit_amount,
          pr.currency,
          pr.recurring,
          pr.active as price_active,
          pr.metadata as price_metadata
        FROM stripe.products p
        LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
        WHERE p.active = ${active} AND p.livemode = true
        ORDER BY p.id, pr.unit_amount
      `
    );
    return result.rows;
  }

  async getPrice(priceId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.prices WHERE id = ${priceId} AND livemode = true`
    );
    if (result.rows[0]) return result.rows[0];
    try {
      const stripe = await getUncachableStripeClient();
      const price = await stripe.prices.retrieve(priceId);
      if (price && price.active && price.livemode) return price;
    } catch {}
    return null;
  }

  async listPrices(active = true) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.prices WHERE active = ${active}`
    );
    return result.rows;
  }

  async getSubscription(subscriptionId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.subscriptions WHERE id = ${subscriptionId}`
    );
    return result.rows[0] || null;
  }
}

export const stripeService = new StripeService();
