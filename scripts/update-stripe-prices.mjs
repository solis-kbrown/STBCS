import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.error('STRIPE_SECRET_KEY not set');
  process.exit(1);
}

const stripe = new Stripe(secretKey);

const NEW_PRICES = {
  supporter: { monthly: 1499, yearly: 14990 },
  pro: { monthly: 4999, yearly: 49990 },
  business: { monthly: 14999, yearly: 149990 },
};

async function updatePrices() {
  console.log('Fetching all active products...');
  const products = await stripe.products.list({ active: true, limit: 100 });
  
  for (const product of products.data) {
    const tier = product.metadata?.tier;
    if (!tier || !NEW_PRICES[tier]) {
      console.log(`Skipping product ${product.name} (${product.id}) - no matching tier`);
      continue;
    }

    console.log(`\nProcessing: ${product.name} (${product.id}) - tier: ${tier}`);
    
    const prices = await stripe.prices.list({ product: product.id, active: true, limit: 100 });
    
    for (const oldPrice of prices.data) {
      const interval = oldPrice.recurring?.interval;
      if (!interval) continue;
      
      const newAmount = interval === 'month' ? NEW_PRICES[tier].monthly : NEW_PRICES[tier].yearly;
      
      if (oldPrice.unit_amount === newAmount) {
        console.log(`  Price ${oldPrice.id} already correct: ${oldPrice.unit_amount} cents (${interval})`);
        continue;
      }
      
      console.log(`  Old price ${oldPrice.id}: ${oldPrice.unit_amount} cents/${interval} -> creating new at ${newAmount} cents`);
      
      const newPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: newAmount,
        currency: oldPrice.currency,
        recurring: { interval: interval },
        metadata: { 
          display: `$${(newAmount / 100).toFixed(2)}/${interval}`,
          ...(interval === 'year' ? { savings: '2 months free' } : {}),
        },
      });
      console.log(`  Created new price: ${newPrice.id} at ${newAmount} cents/${interval}`);
      
      await stripe.prices.update(oldPrice.id, { active: false });
      console.log(`  Archived old price: ${oldPrice.id}`);
    }
    
    if (tier === 'enterprise') {
      console.log(`  Updating enterprise product metadata tier to "business"`);
      await stripe.products.update(product.id, {
        metadata: { ...product.metadata, tier: 'business' },
      });
    }
  }
  
  console.log('\nDone! Syncing will pick up the changes automatically.');
}

updatePrices().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
