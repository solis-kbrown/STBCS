import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.error('STRIPE_SECRET_KEY not set');
  process.exit(1);
}

const stripe = new Stripe(secretKey);

const OLD_PRODUCT_IDS = [
  'prod_Tr4iGxRfscNTBr',
  'prod_Tr0dJ4at1wqb2h',
  'prod_Tr0dQjrrROkfaL',
  'prod_Tr0dhf47BTUcGT',
];

async function cleanup() {
  for (const productId of OLD_PRODUCT_IDS) {
    try {
      const prices = await stripe.prices.list({ product: productId, active: true, limit: 100 });
      for (const price of prices.data) {
        await stripe.prices.update(price.id, { active: false });
        console.log(`Archived old price: ${price.id} (${price.unit_amount} cents)`);
      }
      await stripe.products.update(productId, { active: false });
      console.log(`Archived old product: ${productId}`);
    } catch (err) {
      console.log(`Could not archive ${productId}: ${err.message}`);
    }
  }
  console.log('\nOld duplicate products cleaned up.');
}

cleanup().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
