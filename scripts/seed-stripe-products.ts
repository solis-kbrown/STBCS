import { getUncachableStripeClient } from '../server/stripeClient';

async function createProducts() {
  const stripe = await getUncachableStripeClient();
  
  console.log('Creating STBCS support products...');

  const existingProducts = await stripe.products.search({ query: "name~'STBCS'" });
  if (existingProducts.data.length > 0) {
    console.log('Products already exist, skipping creation');
    console.log('Existing products:', existingProducts.data.map(p => p.name));
    return;
  }

  const supporterProduct = await stripe.products.create({
    name: 'STBCS Supporter',
    description: 'Support the STBCS cybersecurity community with a monthly contribution. Get access to supporter benefits and help fund free security tools.',
    metadata: { type: 'membership', tier: 'supporter' },
  });

  const supporterMonthly = await stripe.prices.create({
    product: supporterProduct.id,
    unit_amount: 1499,
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { display: '$14.99/month' },
  });

  const supporterYearly = await stripe.prices.create({
    product: supporterProduct.id,
    unit_amount: 14990,
    currency: 'usd',
    recurring: { interval: 'year' },
    metadata: { display: '$149.90/year', savings: '2 months free' },
  });

  console.log('Created Supporter:', supporterProduct.id, supporterMonthly.id, supporterYearly.id);

  const proProduct = await stripe.products.create({
    name: 'STBCS Pro',
    description: 'Full access to STBCS Pro features including unlimited API access, real-time alerts, custom watchlists, and priority support.',
    metadata: { type: 'membership', tier: 'pro', popular: 'true' },
  });

  const proMonthly = await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 4999,
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { display: '$49.99/month' },
  });

  const proYearly = await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 49990,
    currency: 'usd',
    recurring: { interval: 'year' },
    metadata: { display: '$499.90/year', savings: '2 months free' },
  });

  console.log('Created Pro:', proProduct.id, proMonthly.id, proYearly.id);

  const businessProduct = await stripe.products.create({
    name: 'STBCS Business',
    description: 'Enterprise-grade threat intelligence with dedicated support, custom integrations, API access, and team features.',
    metadata: { type: 'membership', tier: 'business' },
  });

  const businessMonthly = await stripe.prices.create({
    product: businessProduct.id,
    unit_amount: 14999,
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { display: '$149.99/month' },
  });

  const businessYearly = await stripe.prices.create({
    product: businessProduct.id,
    unit_amount: 149990,
    currency: 'usd',
    recurring: { interval: 'year' },
    metadata: { display: '$1,499.90/year', savings: '2 months free' },
  });

  console.log('Created Business:', businessProduct.id, businessMonthly.id, businessYearly.id);

  console.log('All products created successfully!');
}

createProducts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error creating products:', error);
    process.exit(1);
  });
