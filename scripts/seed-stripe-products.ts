import { getUncachableStripeClient } from '../server/stripeClient';

async function createProducts() {
  const stripe = await getUncachableStripeClient();
  
  console.log('Creating STBCS support products...');

  // Check if products already exist
  const existingProducts = await stripe.products.search({ query: "name~'STBCS'" });
  if (existingProducts.data.length > 0) {
    console.log('Products already exist, skipping creation');
    console.log('Existing products:', existingProducts.data.map(p => p.name));
    return;
  }

  // Create Supporter Membership (Monthly)
  const supporterProduct = await stripe.products.create({
    name: 'STBCS Supporter',
    description: 'Support the STBCS cybersecurity community with a monthly contribution. Get access to supporter benefits and help fund free security tools.',
    metadata: {
      type: 'membership',
      tier: 'supporter',
    },
  });

  const supporterPrice = await stripe.prices.create({
    product: supporterProduct.id,
    unit_amount: 999, // $9.99/month
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { tier: 'supporter' },
  });

  console.log('Created Supporter Membership:', supporterProduct.id, supporterPrice.id);

  // Create Pro Membership (Monthly)
  const proProduct = await stripe.products.create({
    name: 'STBCS Pro',
    description: 'Full access to STBCS Pro features including unlimited API access, real-time alerts, custom watchlists, and priority support.',
    metadata: {
      type: 'membership',
      tier: 'pro',
    },
  });

  const proMonthlyPrice = await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 2999, // $29.99/month
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { tier: 'pro', billing: 'monthly' },
  });

  const proYearlyPrice = await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 29900, // $299/year (2 months free)
    currency: 'usd',
    recurring: { interval: 'year' },
    metadata: { tier: 'pro', billing: 'yearly' },
  });

  console.log('Created Pro Membership:', proProduct.id, proMonthlyPrice.id, proYearlyPrice.id);

  // Create Enterprise Membership (Monthly)
  const enterpriseProduct = await stripe.products.create({
    name: 'STBCS Enterprise',
    description: 'Enterprise-grade threat intelligence with dedicated support, custom integrations, API access, and team features.',
    metadata: {
      type: 'membership',
      tier: 'enterprise',
    },
  });

  const enterprisePrice = await stripe.prices.create({
    product: enterpriseProduct.id,
    unit_amount: 9999, // $99.99/month
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { tier: 'enterprise' },
  });

  console.log('Created Enterprise Membership:', enterpriseProduct.id, enterprisePrice.id);

  console.log('All products created successfully!');
}

createProducts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error creating products:', error);
    process.exit(1);
  });
