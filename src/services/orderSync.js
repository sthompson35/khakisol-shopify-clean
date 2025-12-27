import ShopifyClient from '../client/shopifyClient.js';

/**
 * Order Sync Service
 * Syncs orders between Shopify and external systems
 */

class OrderSync {
  constructor() {
    this.shopify = new ShopifyClient();
  }

  /**
   * Get all orders with full details
   */
  async getAllOrders(status = 'any', limit = 50) {
    const { orders } = await this.shopify.getOrders({ status, limit });
    return orders;
  }

  /**
   * Get orders by date range
   */
  async getOrdersByDateRange(startDate, endDate) {
    const params = {
      status: 'any',
      created_at_min: startDate,
      created_at_max: endDate,
      limit: 250,
    };
    const { orders } = await this.shopify.getOrders(params);
    return orders;
  }

  /**
   * Get unfulfilled orders
   */
  async getUnfulfilledOrders() {
    const { orders } = await this.shopify.getOrders({
      fulfillment_status: 'unfulfilled',
      status: 'open',
      limit: 250,
    });
    return orders;
  }

  /**
   * Get orders requiring attention
   */
  async getOrdersNeedingAttention() {
    const orders = await this.getAllOrders('open');
    
    return orders.filter(order => {
      // Check for issues
      const hasRiskIssue = order.risks?.some(r => r.recommendation === 'cancel');
      const isOnHold = order.financial_status === 'pending';
      const hasNotes = order.note && order.note.length > 0;
      
      return hasRiskIssue || isOnHold || hasNotes;
    });
  }

  /**
   * Calculate order statistics
   */
  async getOrderStats() {
    const orders = await this.getAllOrders('any', 250);
    
    const stats = {
      total_orders: orders.length,
      total_revenue: 0,
      average_order_value: 0,
      by_status: {},
      by_fulfillment: {},
      by_payment: {},
      top_products: {},
      by_date: {},
    };

    orders.forEach(order => {
      // Revenue
      stats.total_revenue += parseFloat(order.total_price);

      // By financial status
      stats.by_payment[order.financial_status] = 
        (stats.by_payment[order.financial_status] || 0) + 1;

      // By fulfillment status
      const fulfillment = order.fulfillment_status || 'unfulfilled';
      stats.by_fulfillment[fulfillment] = 
        (stats.by_fulfillment[fulfillment] || 0) + 1;

      // Top products
      order.line_items?.forEach(item => {
        stats.top_products[item.title] = 
          (stats.top_products[item.title] || 0) + item.quantity;
      });

      // By date
      const date = order.created_at.split('T')[0];
      stats.by_date[date] = (stats.by_date[date] || 0) + 1;
    });

    stats.average_order_value = stats.total_orders > 0 
      ? (stats.total_revenue / stats.total_orders).toFixed(2) 
      : 0;
    stats.total_revenue = stats.total_revenue.toFixed(2);

    // Sort top products
    stats.top_products = Object.entries(stats.top_products)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {});

    return stats;
  }

  /**
   * Export orders to JSON for external system
   */
  async exportForExternalSystem(status = 'any') {
    const orders = await this.getAllOrders(status);
    
    return orders.map(order => ({
      external_id: order.id,
      order_number: order.order_number,
      created_at: order.created_at,
      updated_at: order.updated_at,
      customer: {
        id: order.customer?.id,
        email: order.email,
        name: order.customer ? 
          `${order.customer.first_name} ${order.customer.last_name}` : 
          'Guest',
      },
      shipping_address: order.shipping_address,
      billing_address: order.billing_address,
      line_items: order.line_items?.map(item => ({
        sku: item.sku,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        total: (parseFloat(item.price) * item.quantity).toFixed(2),
      })),
      subtotal: order.subtotal_price,
      shipping: order.total_shipping_price_set?.shop_money?.amount || '0.00',
      tax: order.total_tax,
      total: order.total_price,
      currency: order.currency,
      financial_status: order.financial_status,
      fulfillment_status: order.fulfillment_status || 'unfulfilled',
      note: order.note,
      tags: order.tags,
    }));
  }
}

// ============ RUN ORDER SYNC ============
async function main() {
  console.log('📋 Shopify Order Sync\n');
  console.log('='.repeat(50));

  const sync = new OrderSync();

  try {
    // Get order statistics
    const stats = await sync.getOrderStats();
    
    console.log('\n📈 ORDER STATISTICS');
    console.log('-'.repeat(50));
    console.log(`   Total Orders: ${stats.total_orders}`);
    console.log(`   Total Revenue: $${stats.total_revenue}`);
    console.log(`   Avg Order Value: $${stats.average_order_value}`);

    console.log('\n💳 By Payment Status:');
    Object.entries(stats.by_payment).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

    console.log('\n📦 By Fulfillment Status:');
    Object.entries(stats.by_fulfillment).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

    if (Object.keys(stats.top_products).length > 0) {
      console.log('\n🏆 Top Products:');
      Object.entries(stats.top_products).forEach(([product, qty], i) => {
        console.log(`   ${i + 1}. ${product}: ${qty} sold`);
      });
    }

    // Get unfulfilled orders
    const unfulfilled = await sync.getUnfulfilledOrders();
    if (unfulfilled.length > 0) {
      console.log('\n⏳ UNFULFILLED ORDERS');
      console.log('-'.repeat(50));
      unfulfilled.forEach(order => {
        console.log(`   Order #${order.order_number}`);
        console.log(`   Customer: ${order.customer?.first_name || 'Guest'}`);
        console.log(`   Total: $${order.total_price}`);
        console.log(`   Items: ${order.line_items?.length}`);
        console.log('');
      });
    }

    // Get orders needing attention
    const attention = await sync.getOrdersNeedingAttention();
    if (attention.length > 0) {
      console.log('\n⚠️  ORDERS NEEDING ATTENTION');
      console.log('-'.repeat(50));
      attention.forEach(order => {
        console.log(`   Order #${order.order_number} - ${order.financial_status}`);
        if (order.note) {
          console.log(`   Note: ${order.note}`);
        }
      });
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Order sync complete!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

export { OrderSync };
export default main;

main();
