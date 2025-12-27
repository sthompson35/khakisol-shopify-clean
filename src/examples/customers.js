import ShopifyClient from '../client/shopifyClient.js';

/**
 * Customers Management Examples
 */
async function main() {
  console.log('👥 Shopify Customers Management\n');
  console.log('='.repeat(50));

  const shopify = new ShopifyClient();

  try {
    // ============ GET ALL CUSTOMERS ============
    console.log('\n📋 Fetching customers...\n');
    const { customers } = await shopify.getCustomers({ limit: 20 });

    if (customers.length === 0) {
      console.log('No customers found in your store.');
    } else {
      console.log(`Found ${customers.length} customers:\n`);
      
      customers.forEach((customer, index) => {
        console.log(`${index + 1}. ${customer.first_name || ''} ${customer.last_name || ''}`);
        console.log(`   ID: ${customer.id}`);
        console.log(`   Email: ${customer.email}`);
        console.log(`   Phone: ${customer.phone || 'N/A'}`);
        console.log(`   Orders: ${customer.orders_count}`);
        console.log(`   Total Spent: ${customer.total_spent}`);
        console.log(`   Verified Email: ${customer.verified_email ? 'Yes' : 'No'}`);
        console.log(`   Accepts Marketing: ${customer.accepts_marketing ? 'Yes' : 'No'}`);
        console.log(`   Created: ${new Date(customer.created_at).toLocaleDateString()}`);
        
        if (customer.default_address) {
          const addr = customer.default_address;
          console.log(`   Address: ${addr.city || ''}, ${addr.province || ''}, ${addr.country || ''}`);
        }
        console.log('');
      });
    }

    // ============ SEARCH CUSTOMERS (Uncomment to use) ============
    /*
    console.log('\n🔍 Searching customers...\n');
    const searchResults = await shopify.searchCustomers('email:*@gmail.com');
    console.log(`Found ${searchResults.customers.length} customers matching search`);
    */

    // ============ CREATE A CUSTOMER (Uncomment to use) ============
    /*
    console.log('\n➕ Creating a new customer...\n');
    const newCustomer = await shopify.createCustomer({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      verified_email: true,
      addresses: [
        {
          address1: '123 Main Street',
          city: 'New York',
          province: 'NY',
          zip: '10001',
          country: 'US',
          default: true,
        }
      ],
      send_email_welcome: false,
    });
    console.log('✅ Customer created:', newCustomer.customer.email);
    console.log('   ID:', newCustomer.customer.id);
    */

    // ============ GRAPHQL CUSTOMERS QUERY ============
    console.log('\n🔷 GraphQL Customers Query:\n');
    const graphqlCustomers = await shopify.graphql(`
      query {
        customers(first: 5) {
          edges {
            node {
              id
              displayName
              email
              phone
              numberOfOrders
              amountSpent {
                amount
                currencyCode
              }
              createdAt
              emailMarketingConsent {
                marketingState
              }
              addresses {
                city
                province
                country
              }
            }
          }
        }
      }
    `);

    console.log('Customers via GraphQL:');
    graphqlCustomers.customers.edges.forEach(({ node }, index) => {
      console.log(`${index + 1}. ${node.displayName}`);
      console.log(`   Email: ${node.email}`);
      console.log(`   Orders: ${node.numberOfOrders}`);
      console.log(`   Total Spent: ${node.amountSpent.amount} ${node.amountSpent.currencyCode}`);
      console.log(`   Marketing: ${node.emailMarketingConsent?.marketingState || 'N/A'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
