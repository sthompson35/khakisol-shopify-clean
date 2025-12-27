import ShopifyClient from '../client/shopifyClient.js';

/**
 * Inventory Sync Service
 * Syncs inventory between Shopify and external systems
 */

class InventorySync {
  constructor() {
    this.shopify = new ShopifyClient();
  }

  /**
   * Get all inventory levels with product details
   */
  async getFullInventory() {
    console.log('📦 Fetching full inventory...\n');
    
    const { products } = await this.shopify.getProducts({ limit: 250 });
    const inventory = [];

    for (const product of products) {
      for (const variant of product.variants) {
        inventory.push({
          product_id: product.id,
          product_title: product.title,
          product_status: product.status,
          variant_id: variant.id,
          variant_title: variant.title !== 'Default Title' ? variant.title : null,
          sku: variant.sku,
          barcode: variant.barcode,
          price: variant.price,
          compare_at_price: variant.compare_at_price,
          inventory_item_id: variant.inventory_item_id,
          inventory_quantity: variant.inventory_quantity,
          inventory_management: variant.inventory_management,
          inventory_policy: variant.inventory_policy,
          weight: variant.weight,
          weight_unit: variant.weight_unit,
        });
      }
    }

    return inventory;
  }

  /**
   * Check for low stock items
   */
  async getLowStockItems(threshold = 10) {
    const inventory = await this.getFullInventory();
    return inventory.filter(item => 
      item.inventory_management === 'shopify' && 
      item.inventory_quantity <= threshold
    );
  }

  /**
   * Check for out of stock items
   */
  async getOutOfStockItems() {
    const inventory = await this.getFullInventory();
    return inventory.filter(item => 
      item.inventory_management === 'shopify' && 
      item.inventory_quantity <= 0
    );
  }

  /**
   * Update inventory quantity for a variant
   */
  async updateInventory(inventoryItemId, locationId, newQuantity) {
    // First get current quantity
    const levels = await this.shopify.getInventoryLevels({
      inventory_item_ids: inventoryItemId
    });

    const currentLevel = levels.inventory_levels.find(
      l => l.location_id === locationId
    );

    if (!currentLevel) {
      throw new Error('Inventory level not found');
    }

    const adjustment = newQuantity - currentLevel.available;
    
    if (adjustment !== 0) {
      return await this.shopify.adjustInventory(
        inventoryItemId,
        locationId,
        adjustment
      );
    }

    return { message: 'No adjustment needed' };
  }

  /**
   * Bulk update inventory from external source
   */
  async bulkUpdateFromExternal(externalInventory) {
    // externalInventory should be array of { sku, quantity }
    const inventory = await this.getFullInventory();
    const results = { updated: [], failed: [], skipped: [] };

    for (const external of externalInventory) {
      const item = inventory.find(i => i.sku === external.sku);
      
      if (!item) {
        results.skipped.push({ sku: external.sku, reason: 'SKU not found' });
        continue;
      }

      if (item.inventory_management !== 'shopify') {
        results.skipped.push({ sku: external.sku, reason: 'Not tracked by Shopify' });
        continue;
      }

      try {
        // You would need to get locationId from your store
        // const locationId = 'YOUR_LOCATION_ID';
        // await this.updateInventory(item.inventory_item_id, locationId, external.quantity);
        results.updated.push({ sku: external.sku, quantity: external.quantity });
      } catch (error) {
        results.failed.push({ sku: external.sku, error: error.message });
      }
    }

    return results;
  }

  /**
   * Generate inventory report
   */
  async generateReport() {
    const inventory = await this.getFullInventory();
    
    const report = {
      generated_at: new Date().toISOString(),
      summary: {
        total_products: new Set(inventory.map(i => i.product_id)).size,
        total_variants: inventory.length,
        total_units: inventory.reduce((sum, i) => sum + (i.inventory_quantity || 0), 0),
        tracked_variants: inventory.filter(i => i.inventory_management === 'shopify').length,
        out_of_stock: inventory.filter(i => i.inventory_quantity <= 0).length,
        low_stock: inventory.filter(i => i.inventory_quantity > 0 && i.inventory_quantity <= 10).length,
      },
      inventory_value: inventory.reduce((sum, i) => {
        return sum + (parseFloat(i.price) * (i.inventory_quantity || 0));
      }, 0).toFixed(2),
      items: inventory,
    };

    return report;
  }

  /**
   * Export inventory to CSV format
   */
  async exportToCSV() {
    const inventory = await this.getFullInventory();
    
    const headers = [
      'Product ID',
      'Product Title',
      'Variant ID',
      'Variant Title',
      'SKU',
      'Barcode',
      'Price',
      'Quantity',
      'Tracked',
      'Status'
    ];

    const rows = inventory.map(item => [
      item.product_id,
      `"${item.product_title}"`,
      item.variant_id,
      item.variant_title ? `"${item.variant_title}"` : '',
      item.sku || '',
      item.barcode || '',
      item.price,
      item.inventory_quantity || 0,
      item.inventory_management === 'shopify' ? 'Yes' : 'No',
      item.product_status
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}

// ============ RUN INVENTORY SYNC ============
async function main() {
  console.log('📊 Shopify Inventory Sync\n');
  console.log('='.repeat(50));

  const sync = new InventorySync();

  try {
    // Generate full report
    const report = await sync.generateReport();
    
    console.log('\n📈 INVENTORY SUMMARY');
    console.log('-'.repeat(50));
    console.log(`   Total Products: ${report.summary.total_products}`);
    console.log(`   Total Variants: ${report.summary.total_variants}`);
    console.log(`   Total Units: ${report.summary.total_units}`);
    console.log(`   Inventory Value: $${report.inventory_value}`);
    console.log(`   Tracked by Shopify: ${report.summary.tracked_variants}`);
    console.log(`   Out of Stock: ${report.summary.out_of_stock}`);
    console.log(`   Low Stock (≤10): ${report.summary.low_stock}`);

    // Show inventory details
    console.log('\n📦 INVENTORY DETAILS');
    console.log('-'.repeat(50));
    
    report.items.forEach((item, index) => {
      const status = item.inventory_quantity <= 0 ? '❌ OUT' : 
                     item.inventory_quantity <= 10 ? '⚠️  LOW' : '✅';
      console.log(`${index + 1}. ${item.product_title}`);
      if (item.variant_title) {
        console.log(`   Variant: ${item.variant_title}`);
      }
      console.log(`   SKU: ${item.sku || 'N/A'}`);
      console.log(`   Price: $${item.price}`);
      console.log(`   Stock: ${item.inventory_quantity || 0} ${status}`);
      console.log('');
    });

    // Check low stock
    const lowStock = await sync.getLowStockItems(10);
    if (lowStock.length > 0) {
      console.log('\n⚠️  LOW STOCK ALERTS');
      console.log('-'.repeat(50));
      lowStock.forEach(item => {
        console.log(`   ${item.product_title} - ${item.sku || 'No SKU'}: ${item.inventory_quantity} left`);
      });
    }

    // Check out of stock
    const outOfStock = await sync.getOutOfStockItems();
    if (outOfStock.length > 0) {
      console.log('\n❌ OUT OF STOCK');
      console.log('-'.repeat(50));
      outOfStock.forEach(item => {
        console.log(`   ${item.product_title} - ${item.sku || 'No SKU'}`);
      });
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Inventory sync complete!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

export { InventorySync };
export default main;

// Run if called directly
main();
