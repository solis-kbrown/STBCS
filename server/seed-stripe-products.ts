// Stripe Products Seed Script for STBCS
// Run this script to create products in your Stripe account
// Usage: npx tsx server/seed-stripe-products.ts

import { getUncachableStripeClient } from './stripeClient';

interface ProductConfig {
  name: string;
  description: string;
  metadata: Record<string, string>;
  prices: {
    unit_amount: number;
    currency: string;
    recurring?: { interval: 'month' | 'year' };
    metadata?: Record<string, string>;
  }[];
}

const products: ProductConfig[] = [
  // Supporter Tier - Basic contribution
  {
    name: 'STBCS Supporter',
    description: 'Support STB Cybersecurity and the security community. Access to supporter-only updates and early features.',
    metadata: {
      tier: 'supporter',
      type: 'membership',
    },
    prices: [
      {
        unit_amount: 1499, // $14.99
        currency: 'usd',
        recurring: { interval: 'month' },
        metadata: { display: '$14.99/month' },
      },
      {
        unit_amount: 14990, // $149.90 (2 months free)
        currency: 'usd',
        recurring: { interval: 'year' },
        metadata: { display: '$149.90/year', savings: '2 months free' },
      },
    ],
  },
  // Pro Tier - Full access
  {
    name: 'STBCS Pro',
    description: 'Full access to all STBCS Pro features including unlimited API access, real-time alerts, and custom watchlists.',
    metadata: {
      tier: 'pro',
      type: 'membership',
      popular: 'true',
    },
    prices: [
      {
        unit_amount: 4999, // $49.99
        currency: 'usd',
        recurring: { interval: 'month' },
        metadata: { display: '$49.99/month' },
      },
      {
        unit_amount: 49990, // $499.90 (2 months free)
        currency: 'usd',
        recurring: { interval: 'year' },
        metadata: { display: '$499.90/year', savings: '2 months free' },
      },
    ],
  },
  // Business/Enterprise Tier
  {
    name: 'STBCS Business',
    description: 'Enterprise-grade threat intelligence with dedicated support, custom integrations, and SLA guarantees.',
    metadata: {
      tier: 'business',
      type: 'membership',
    },
    prices: [
      {
        unit_amount: 14999, // $149.99
        currency: 'usd',
        recurring: { interval: 'month' },
        metadata: { display: '$149.99/month' },
      },
      {
        unit_amount: 149990, // $1,499.90 (2 months free)
        currency: 'usd',
        recurring: { interval: 'year' },
        metadata: { display: '$1,499.90/year', savings: '2 months free' },
      },
    ],
  },
];

async function seedProducts() {
  console.log('🚀 Starting Stripe product seed...\n');
  
  const stripe = await getUncachableStripeClient();
  
  for (const productConfig of products) {
    console.log(`Creating product: ${productConfig.name}`);
    
    // Check if product already exists
    const existingProducts = await stripe.products.search({
      query: `name:'${productConfig.name}'`,
    });
    
    if (existingProducts.data.length > 0) {
      console.log(`  ⚠️  Product "${productConfig.name}" already exists, skipping...`);
      continue;
    }
    
    // Create product
    const product = await stripe.products.create({
      name: productConfig.name,
      description: productConfig.description,
      metadata: productConfig.metadata,
    });
    console.log(`  ✅ Created product: ${product.id}`);
    
    // Create prices for this product
    for (const priceConfig of productConfig.prices) {
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: priceConfig.unit_amount,
        currency: priceConfig.currency,
        recurring: priceConfig.recurring,
        metadata: priceConfig.metadata || {},
      });
      
      const intervalLabel = priceConfig.recurring?.interval || 'one-time';
      console.log(`    💰 Created price: ${price.id} (${priceConfig.unit_amount / 100} USD/${intervalLabel})`);
    }
  }
  
  console.log('\n✅ Stripe product seed completed!');
  console.log('\n📋 Products will automatically sync to your database via webhooks.');
  console.log('💡 You can view and manage products at: https://dashboard.stripe.com/products\n');
}

seedProducts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  });
