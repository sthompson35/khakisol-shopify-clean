import ShopifyClient from './client/shopifyClient.js';

/**
 * Main entry point - demonstrates Shopify API connection
 */
async function main() {
  console.log('🛍️  Shopify API Integration\n');
  console.log('='.repeat(50));

  try {
    const shopify = new ShopifyClient();

    // Test connection by fetching shop info
    console.log('\n📍 Connecting to Shopify store...\n');
    const { shop } = await shopify.getShop();

    console.log('✅ Successfully connected!\n');
    console.log('='.repeat(50));
    console.log('🏪 SHOP INFORMATION');
    console.log('='.repeat(50));
    console.log(`   Name:          ${shop.name}`);
    console.log(`   Domain:        ${shop.domain}`);
    console.log(`   Email:         ${shop.email}`);
    console.log(`   Currency:      ${shop.currency}`);
    console.log(`   Country:       ${shop.country_name}`);
    console.log(`   Timezone:      ${shop.timezone}`);
    console.log(`   Plan:          ${shop.plan_display_name}`);
    console.log('='.repeat(50));

    // Fetch products summary
    console.log('\n📦 PRODUCTS SUMMARY');
    console.log('-'.repeat(50));
    const { products } = await shopify.getProducts({ limit: 5 });
    console.log(`   Total fetched: ${products.length} products`);
    
    if (products.length > 0) {
      console.log('\n   Recent products:');
      products.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.title} - ${product.status}`);
      });
    }

    // Fetch orders summary
    console.log('\n📋 ORDERS SUMMARY');
    console.log('-'.repeat(50));
    const orderCount = await shopify.getOrderCount();
    console.log(`   Total orders: ${orderCount.count}`);

    // Fetch customers summary
    console.log('\n👥 CUSTOMERS SUMMARY');
    console.log('-'.repeat(50));
    const { customers } = await shopify.getCustomers({ limit: 5 });
    console.log(`   Total fetched: ${customers.length} customers`);

    console.log('\n' + '='.repeat(50));
    console.log('🎉 API Integration is working correctly!');
    console.log('='.repeat(50));
    console.log('\n📚 Available commands:');
    console.log('   npm run products  - Manage products');
    console.log('   npm run orders    - View orders');
    console.log('   npm run customers - Manage customers');
    console.log('');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nPlease check your .env configuration.');
    process.exit(1);
  }
}

main();
