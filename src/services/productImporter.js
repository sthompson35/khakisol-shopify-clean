import fs from 'fs';
import path from 'path';
import ShopifyClient from '../client/shopifyClient.js';

/**
 * Product Import Script
 * Imports products from KhakiSol CSV file to Shopify
 */

class ProductImporter {
  constructor() {
    this.shopify = new ShopifyClient();
    this.csvPath = 'c:\\Users\\sdtho\\Downloads\\khakisol-products-FIXED.csv';
  }

  /**
   * Parse CSV content into product objects
   */
  parseCSV(csvContent) {
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headerLine = lines[0];
    const headers = this.parseCSVLine(headerLine);

    console.log(`📊 Header line: ${headerLine.substring(0, 100)}...`);
    console.log(`📊 Headers count: ${headers.length}`);
    console.log(`📊 Headers:`, headers.slice(0, 15));

    const products = {};
    const dataLines = lines.slice(1); // Skip header

    for (const line of dataLines.slice(0, 1)) { // Just first data line for debugging
      const values = this.parseCSVLine(line);
      console.log(`📊 Raw line: ${line.substring(0, 100)}...`);
      console.log(`📊 Parsed values count: ${values.length}`);
      console.log(`📊 Values 15-25:`, values.slice(14, 25));
      break;
    }

    for (const line of dataLines) {
      if (!line.trim()) continue;

      const values = this.parseCSVLine(line);
      if (values.length < 22) continue; // Need at least basic fields

      // Map columns based on standard Shopify CSV format
      const row = {
        'Handle': values[0],
        'Title': values[1],
        'Body (HTML)': values[2],
        'Vendor': values[3],
        'Product Category': values[4],
        'Type': values[5],
        'Tags': values[6],
        'Published': values[7],
        'Option1 Name': values[8],
        'Option1 Value': values[9],
        'Option2 Name': values[10],
        'Option2 Value': values[11],
        'Option3 Name': values[12],
        'Option3 Value': values[12], // Adjusted index
        'Variant SKU': values[13], // Adjusted index
        'Variant Grams': values[14], // Adjusted index
        'Variant Inventory Tracker': values[15], // Adjusted index
        'Variant Inventory Qty': values[16], // Adjusted index
        'Variant Inventory Policy': values[17], // Adjusted index
        'Variant Fulfillment Service': values[18], // Adjusted index
        'Variant Price': values[19], // Adjusted index
        'Variant Compare At Price': values[20], // Adjusted index
        'Variant Requires Shipping': values[21], // Adjusted index
        'Variant Taxable': values[22], // Adjusted index
        'Variant Barcode': values[23] // Adjusted index
      };

      console.log(`🔍 Row mapping for ${row['Handle']}:`);
      console.log(`   Option3 Value (values[13]): "${values[13]}"`);
      console.log(`   Variant SKU (values[14]): "${values[14]}"`);
      console.log(`   Row Option3 Value: "${row['Option3 Value']}"`);
      console.log(`   Row Variant SKU: "${row['Variant SKU']}"`);

      const handle = row['Handle'];
      if (!handle) continue;

      if (!products[handle]) {
        products[handle] = {
          handle: handle,
          title: row['Title'],
          body_html: row['Body (HTML)'],
          vendor: row['Vendor'],
          product_type: row['Type'],
          tags: row['Tags'].split(',').map(tag => tag.trim()).filter(tag => tag),
          published: row['Published'] === 'TRUE',
          option1_name: row['Option1 Name'],
          option2_name: row['Option2 Name'],
          option3_name: row['Option3 Name'],
          variants: [],
          images: []
        };
      }

      // Add variant
      const variant = {
        sku: row['Variant SKU'],
        grams: parseInt(row['Variant Grams']) || 0,
        inventory_quantity: parseInt(row['Variant Inventory Qty']) || 0,
        inventory_policy: row['Variant Inventory Policy'] === 'continue' ? 'continue' : 'deny',
        fulfillment_service: row['Variant Fulfillment Service'],
        price: row['Variant Price'],
        compare_at_price: row['Variant Compare At Price'] && row['Variant Compare At Price'].trim() ? row['Variant Compare At Price'] : null,
        requires_shipping: row['Variant Requires Shipping'] === 'TRUE',
        taxable: row['Variant Taxable'] === 'TRUE',
        barcode: row['Variant Barcode'] || null,
        weight: parseInt(row['Variant Grams']) / 1000, // Convert grams to kg
        weight_unit: 'kg',
        option1: row['Option1 Value'] || null,
        option2: row['Option2 Value'] || null,
        option3: row['Option3 Value'] || null
      };

      products[handle].variants.push(variant);
    }

    return Object.values(products);
  }

  /**
   * Parse a single CSV line handling quoted values properly
   */
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i += 2;
          continue;
        } else if (inQuotes) {
          // Closing quote
          inQuotes = false;
        } else {
          // Opening quote
          inQuotes = true;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        result.push(current);
        current = '';
      } else {
        current += char;
      }
      i++;
    }

    // Add the last field
    result.push(current);

    return result;
  }

  /**
   * Convert product object to Shopify API format
   */
  formatForShopify(product) {
    return {
      product: {
        title: product.title,
        body_html: product.body_html,
        vendor: product.vendor,
        product_type: product.product_type,
        tags: product.tags,
        published: product.published,
        variants: product.variants.map(variant => {
          const variantData = {
            sku: variant.sku,
            grams: variant.grams,
            inventory_quantity: variant.inventory_quantity,
            inventory_policy: variant.inventory_policy,
            fulfillment_service: variant.fulfillment_service,
            price: variant.price,
            requires_shipping: variant.requires_shipping,
            taxable: variant.taxable,
            barcode: variant.barcode,
            weight: variant.weight,
            weight_unit: variant.weight_unit,
            option1: variant.option1,
            option2: variant.option2,
            option3: variant.option3
          };

          // Only include compare_at_price if it has a value
          if (variant.compare_at_price && variant.compare_at_price.trim()) {
            variantData.compare_at_price = variant.compare_at_price;
          }

          return variantData;
        }),
        images: product.images,
        options: this.extractOptions(product, product.variants)
      }
    };
  }

  /**
   * Extract product options from variants
   */
  extractOptions(product, variants) {
    const options = [];

    // Create options based on used option values and stored names
    if (variants.some(v => v.option1)) {
      const values = [...new Set(variants.map(v => v.option1).filter(Boolean))];
      if (values.length > 0) {
        options.push({
          name: product.option1_name || 'Option1',
          values: values
        });
      }
    }

    if (variants.some(v => v.option2)) {
      const values = [...new Set(variants.map(v => v.option2).filter(Boolean))];
      if (values.length > 0) {
        options.push({
          name: product.option2_name || 'Option2',
          values: values
        });
      }
    }

    if (variants.some(v => v.option3)) {
      const values = [...new Set(variants.map(v => v.option3).filter(Boolean))];
      if (values.length > 0) {
        options.push({
          name: product.option3_name || 'Option3',
          values: values
        });
      }
    }

    return options;
  }

  /**
   * Import products to Shopify
   */
  async importProducts() {
    try {
      console.log('🚀 Starting KhakiSol product import...\n');

      // Read CSV file
      const csvContent = fs.readFileSync(this.csvPath, 'utf8');
      const products = this.parseCSV(csvContent);

      console.log(`📦 Found ${products.length} products to import\n`);

      const results = {
        success: [],
        failed: []
      };

      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        console.log(`[${i + 1}/${products.length}] Importing: ${product.title}`);

        try {
          const shopifyProduct = this.formatForShopify(product);
          console.log(`   📋 Options:`, JSON.stringify(shopifyProduct.product.options, null, 2));
          console.log(`   📤 Sending product data for: ${product.title}`);
          console.log(`   📊 First variant data:`, JSON.stringify(shopifyProduct.product.variants[0], null, 2));
          const response = await this.shopify.request('/products.json', 'POST', shopifyProduct);

          console.log(`   ✅ Created: ${response.product.title} (${response.product.variants.length} variants)`);
          results.success.push({
            title: product.title,
            id: response.product.id,
            variants: response.product.variants.length
          });

        } catch (error) {
          console.log(`   ❌ Failed: ${product.title} - ${error.message}`);
          results.failed.push({
            title: product.title,
            error: error.message
          });
        }

        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Summary
      console.log('\n📊 Import Summary:');
      console.log(`   ✅ Successful: ${results.success.length}`);
      console.log(`   ❌ Failed: ${results.failed.length}`);
      console.log(`   📦 Total Variants: ${results.success.reduce((sum, p) => sum + p.variants, 0)}`);

      return results;

    } catch (error) {
      console.error('❌ Import failed:', error.message);
      throw error;
    }
  }
}

// CLI interface
async function main() {
  console.log('🔄 Starting product import script...');
  const importer = new ProductImporter();
  console.log('📁 CSV Path:', importer.csvPath);
  await importer.importProducts();
}

export { ProductImporter };
export default main;

// Run directly
console.log('🚀 Starting KhakiSol Product Import...');
main().catch(console.error);