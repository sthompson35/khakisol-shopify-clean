import ShopifyClient from '../client/shopifyClient.js';

/**
 * Orders Management Examples
 */
async function main() {
  console.log('📋 Shopify Orders Management\n');
  console.log('='.repeat(50));

  const shopify = new ShopifyClient();

  try {
    // ============ GET ORDER COUNT ============
    console.log('\n📊 Order Statistics:\n');
    
    const totalCount = await shopify.getOrderCount();
    console.log(`   Total orders: ${totalCount.count}`);

    const pendingCount = await shopify.getOrderCount({ status: 'open' });
    console.log(`   Open orders: ${pendingCount.count}`);

    const closedCount = await shopify.getOrderCount({ status: 'closed' });
    console.log(`   Closed orders: ${closedCount.count}`);

    // ============ GET ALL ORDERS ============
    console.log('\n📋 Recent Orders:\n');
    const { orders } = await shopify.getOrders({ 
      limit: 10,
      status: 'any'
    });

    if (orders.length === 0) {
      console.log('No orders found in your store.');
    } else {
      console.log(`Found ${orders.length} orders:\n`);
      
      orders.forEach((order, index) => {
        console.log(`${index + 1}. Order #${order.order_number}`);
        console.log(`   ID: ${order.id}`);
        console.log(`   Created: ${new Date(order.created_at).toLocaleDateString()}`);
        console.log(`   Customer: ${order.customer ? `${order.customer.first_name} ${order.customer.last_name}` : 'Guest'}`);
        console.log(`   Email: ${order.email || 'N/A'}`);
        console.log(`   Total: ${order.total_price} ${order.currency}`);
        console.log(`   Financial Status: ${order.financial_status}`);
        console.log(`   Fulfillment Status: ${order.fulfillment_status || 'Unfulfilled'}`);
        console.log(`   Items: ${order.line_items.length}`);
        
        order.line_items.forEach((item, i) => {
          console.log(`      ${i + 1}. ${item.name} x${item.quantity} - ${item.price}`);
        });
        console.log('');
      });
    }

    // ============ GRAPHQL ORDERS QUERY ============
    console.log('\n🔷 GraphQL Orders Query:\n');
    const graphqlOrders = await shopify.graphql(`
      query {
        orders(first: 5, reverse: true) {
          edges {
            node {
              id
              name
              createdAt
              displayFinancialStatus
              displayFulfillmentStatus
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              customer {
                firstName
                lastName
                email
              }
              lineItems(first: 5) {
                edges {
                  node {
                    title
                    quantity
                  }
                }
              }
            }
          }
        }
      }
    `);

    console.log('Orders via GraphQL:');
    graphqlOrders.orders.edges.forEach(({ node }, index) => {
      console.log(`${index + 1}. ${node.name}`);
      console.log(`   Created: ${new Date(node.createdAt).toLocaleDateString()}`);
      console.log(`   Customer: ${node.customer ? `${node.customer.firstName} ${node.customer.lastName}` : 'Guest'}`);
      console.log(`   Total: ${node.totalPriceSet.shopMoney.amount} ${node.totalPriceSet.shopMoney.currencyCode}`);
      console.log(`   Status: ${node.displayFinancialStatus} / ${node.displayFulfillmentStatus}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
