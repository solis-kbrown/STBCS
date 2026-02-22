import Stripe from 'stripe';
import pg from 'pg';

const secretKey = process.env.STRIPE_SECRET_KEY;
const dbUrl = process.env.DATABASE_URL;

if (!secretKey || !dbUrl) {
  console.error('Missing STRIPE_SECRET_KEY or DATABASE_URL');
  process.exit(1);
}

const stripe = new Stripe(secretKey);
const pool = new pg.Pool({ connectionString: dbUrl });

async function syncPrices() {
  console.log('Fetching all prices from Stripe API...');
  const allPrices = [];
  let hasMore = true;
  let startingAfter = undefined;
  
  while (hasMore) {
    const params = { limit: 100 };
    if (startingAfter) params.starting_after = startingAfter;
    const batch = await stripe.prices.list(params);
    allPrices.push(...batch.data);
    hasMore = batch.has_more;
    if (batch.data.length > 0) startingAfter = batch.data[batch.data.length - 1].id;
  }
  
  console.log(`Found ${allPrices.length} prices in Stripe`);
  
  for (const price of allPrices) {
    const rawData = JSON.stringify(price);
    const existing = await pool.query(
      "SELECT _raw_data->>'id' as id FROM stripe.prices WHERE _raw_data->>'id' = $1", 
      [price.id]
    );
    
    if (existing.rows.length > 0) {
      await pool.query(
        'UPDATE stripe.prices SET _raw_data = $1::jsonb, _updated_at = NOW() WHERE _raw_data->>\'id\' = $2',
        [rawData, price.id]
      );
      console.log(`Updated: ${price.id} -> ${price.unit_amount} cents, active=${price.active}`);
    } else {
      const accountId = 'acct_1StIbUCW56GKyBD5';
      await pool.query(
        'INSERT INTO stripe.prices (_raw_data, _updated_at, _last_synced_at, _account_id) VALUES ($1::jsonb, NOW(), NOW(), $2)',
        [rawData, accountId]
      );
      console.log(`Inserted: ${price.id} -> ${price.unit_amount} cents/${price.recurring?.interval}, active=${price.active}, product=${price.product}`);
    }
  }
  
  console.log('\nVerifying...');
  const result = await pool.query(`
    SELECT p.name, pr._raw_data->>'id' as price_id, pr.unit_amount, pr.recurring->>'interval' as interval, pr.active
    FROM stripe.products p
    JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
    WHERE p.active = true AND p.name LIKE 'STBCS%'
    ORDER BY p.name, pr.unit_amount
  `);
  
  for (const row of result.rows) {
    console.log(`  ${row.name}: ${row.price_id} = $${(row.unit_amount / 100).toFixed(2)}/${row.interval}`);
  }
  
  await pool.end();
  console.log('\nDone!');
}

syncPrices().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
