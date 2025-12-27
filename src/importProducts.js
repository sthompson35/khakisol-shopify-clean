import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ShopifyClient from './client/shopifyClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Import products from a JSON file to Shopify
 */
class ProductImporter {
  constructor() {
    this.shopify = new ShopifyClient();
  }

  /**
   * Load products from JSON file
   */
  loadProductsFile(filePath) {
    const absolutePath = path.isAbsolute(filePath) 
      ? filePath 
      : path.join(process.cwd(), filePath);
    
    const content = fs.readFileSync(absolutePath, 'utf-8');
    const data = JSON.parse(content);
    
    return data.products || data;
  }

  /**
   * Transform product data to Shopify format
   */
  transformProduct(product) {
    // Extract unique options from variants
    const sizeValues = [...new Set(product.variants.map(v => v.size).filter(Boolean))];
    const colorValues = [...new Set(product.variants.map(v => v.color).filter(Boolean))];

    const options = [];
    if (sizeValues.length > 0) {
      options.push({ name: 'Size', values: sizeValues });
    }
    if (colorValues.length > 0) {
      options.push({ name: 'Color', values: colorValues });
    }

    // Transform variants
    const variants = product.variants.map(v => {
      const variant = {
        price: v.price || '0.00',
        sku: v.sku || '',
        inventory_management: 'shopify',
        inventory_quantity: v.quantity || 0,
      };

      if (v.size) variant.option1 = v.size;
      if (v.color) variant.option2 = v.color;
      if (v.compare_at_price) variant.compare_at_price = v.compare_at_price;
      if (v.weight) variant.weight = v.weight;
      if (v.barcode) variant.barcode = v.barcode;

      return variant;
    });

    return {
      title: product.title,
      body_html: `<p>${product.description || ''}</p>`,
      vendor: product.vendor || 'KhakiSol',
      product_type: product.product_type || '',
      tags: product.tags || '',
      status: product.status || 'active',
      options: options.length > 0 ? options : undefined,
      variants,
    };
  }

  /**
   * Import a single product
   */
  async importProduct(product) {
    const shopifyProduct = this.transformProduct(product);
    return await this.shopify.createProduct(shopifyProduct);
  }

  /**
   * Import all products from file
   */
  async importAll(filePath) {
    console.log(`📂 Loading products from: ${filePath}\n`);
    
    const products = this.loadProductsFile(filePath);
    console.log(`📦 Found ${products.length} products to import\n`);

    const results = { success: [], failed: [] };

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`[${i + 1}/${products.length}] Importing: ${product.title}...`);

      try {
        const response = await this.importProduct(product);
        console.log(`   ✅ Success! ID: ${response.product.id}`);
        
        results.success.push({
          title: product.title,
          id: response.product.id,
          variants: response.product.variants.length,
        });

        // Rate limit delay
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
        results.failed.push({
          title: product.title,
          error: error.message,
        });
      }
    }

    return results;
  }
}

// ============ MAIN ============
async function main() {
  console.log('\n' + '='.repeat(50));
  console.log('📥 SHOPIFY PRODUCT IMPORTER');
  console.log('='.repeat(50) + '\n');

  const args = process.argv.slice(2);
  const filePath = args[0] || 'data/products-to-import.json';

  const importer = new ProductImporter();

  try {
    const results = await importer.importAll(filePath);

    console.log('\n' + '='.repeat(50));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(50));
    console.log(`   ✅ Imported: ${results.success.length} products`);
    console.log(`   ❌ Failed: ${results.failed.length} products`);

    if (results.success.length > 0) {
      console.log('\n✅ Successfully Imported:');
      results.success.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.title} (${p.variants} variants) - ID: ${p.id}`);
      });
    }

    if (results.failed.length > 0) {
      console.log('\n❌ Failed:');
      results.failed.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.title}: ${p.error}`);
      });
    }

    // Calculate totals
    const totalVariants = results.success.reduce((sum, p) => sum + p.variants, 0);
    console.log('\n📈 TOTALS');
    console.log('-'.repeat(50));
    console.log(`   Products: ${results.success.length}`);
    console.log(`   Variants: ${totalVariants}`);

    console.log('\n🔗 View products at:');
    console.log('   https://admin.shopify.com/store/pygcet-kp/products');

    console.log('\n' + '='.repeat(50));
    console.log('✅ Import complete!');
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

export { ProductImporter };
export default main;

main();
