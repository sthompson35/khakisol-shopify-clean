import ShopifyClient from './client/shopifyClient.js';

/**
 * Add products to your Shopify store
 */

// Define your products here
const products = [
  {
    title: "Classic Cotton T-Shirt",
    body_html: "<p>Premium quality 100% cotton t-shirt. Comfortable, breathable, and perfect for everyday wear.</p>",
    vendor: "KhakiSol",
    product_type: "T-Shirts",
    status: "active",
    tags: "cotton, casual, comfortable, everyday",
    variants: [
      {
        price: "24.99",
        sku: "TSHIRT-BLK-S",
        option1: "Small",
        option2: "Black",
        inventory_management: "shopify",
        inventory_quantity: 50,
      },
      {
        price: "24.99",
        sku: "TSHIRT-BLK-M",
        option1: "Medium",
        option2: "Black",
        inventory_management: "shopify",
        inventory_quantity: 75,
      },
      {
        price: "24.99",
        sku: "TSHIRT-BLK-L",
        option1: "Large",
        option2: "Black",
        inventory_management: "shopify",
        inventory_quantity: 60,
      },
      {
        price: "24.99",
        sku: "TSHIRT-WHT-M",
        option1: "Medium",
        option2: "White",
        inventory_management: "shopify",
        inventory_quantity: 80,
      },
    ],
    options: [
      { name: "Size", values: ["Small", "Medium", "Large"] },
      { name: "Color", values: ["Black", "White"] }
    ]
  },
  {
    title: "Slim Fit Chino Pants",
    body_html: "<p>Modern slim fit chino pants made with stretch fabric for maximum comfort. Perfect for work or casual outings.</p>",
    vendor: "KhakiSol",
    product_type: "Pants",
    status: "active",
    tags: "chino, pants, slim fit, business casual",
    variants: [
      {
        price: "49.99",
        sku: "CHINO-KHK-32",
        option1: "32",
        option2: "Khaki",
        inventory_management: "shopify",
        inventory_quantity: 40,
      },
      {
        price: "49.99",
        sku: "CHINO-KHK-34",
        option1: "34",
        option2: "Khaki",
        inventory_management: "shopify",
        inventory_quantity: 45,
      },
      {
        price: "49.99",
        sku: "CHINO-NVY-32",
        option1: "32",
        option2: "Navy",
        inventory_management: "shopify",
        inventory_quantity: 35,
      },
      {
        price: "49.99",
        sku: "CHINO-NVY-34",
        option1: "34",
        option2: "Navy",
        inventory_management: "shopify",
        inventory_quantity: 50,
      },
    ],
    options: [
      { name: "Waist", values: ["32", "34"] },
      { name: "Color", values: ["Khaki", "Navy"] }
    ]
  },
  {
    title: "Casual Hoodie",
    body_html: "<p>Soft and cozy hoodie with kangaroo pocket. Perfect for layering or lounging at home.</p>",
    vendor: "KhakiSol",
    product_type: "Hoodies",
    status: "active",
    tags: "hoodie, casual, comfortable, winter",
    variants: [
      {
        price: "39.99",
        sku: "HOODIE-GRY-M",
        option1: "Medium",
        option2: "Gray",
        inventory_management: "shopify",
        inventory_quantity: 30,
      },
      {
        price: "39.99",
        sku: "HOODIE-GRY-L",
        option1: "Large",
        option2: "Gray",
        inventory_management: "shopify",
        inventory_quantity: 35,
      },
      {
        price: "39.99",
        sku: "HOODIE-BLK-M",
        option1: "Medium",
        option2: "Black",
        inventory_management: "shopify",
        inventory_quantity: 40,
      },
      {
        price: "39.99",
        sku: "HOODIE-BLK-L",
        option1: "Large",
        option2: "Black",
        inventory_management: "shopify",
        inventory_quantity: 45,
      },
    ],
    options: [
      { name: "Size", values: ["Medium", "Large"] },
      { name: "Color", values: ["Gray", "Black"] }
    ]
  },
  {
    title: "Leather Belt",
    body_html: "<p>Genuine leather belt with classic silver buckle. Durable and stylish accessory for any outfit.</p>",
    vendor: "KhakiSol",
    product_type: "Accessories",
    status: "active",
    tags: "belt, leather, accessories, classic",
    variants: [
      {
        price: "29.99",
        sku: "BELT-BRN-M",
        option1: "Medium (32-36)",
        inventory_management: "shopify",
        inventory_quantity: 25,
      },
      {
        price: "29.99",
        sku: "BELT-BRN-L",
        option1: "Large (36-40)",
        inventory_management: "shopify",
        inventory_quantity: 20,
      },
      {
        price: "29.99",
        sku: "BELT-BLK-M",
        option1: "Medium (32-36)",
        inventory_management: "shopify",
        inventory_quantity: 30,
      },
    ],
    options: [
      { name: "Size", values: ["Medium (32-36)", "Large (36-40)"] }
    ]
  },
  {
    title: "Canvas Sneakers",
    body_html: "<p>Lightweight canvas sneakers with rubber sole. Classic design that goes with everything.</p>",
    vendor: "KhakiSol",
    product_type: "Footwear",
    status: "active",
    tags: "shoes, sneakers, canvas, casual",
    variants: [
      {
        price: "44.99",
        sku: "SNKR-WHT-9",
        option1: "9",
        option2: "White",
        inventory_management: "shopify",
        inventory_quantity: 20,
      },
      {
        price: "44.99",
        sku: "SNKR-WHT-10",
        option1: "10",
        option2: "White",
        inventory_management: "shopify",
        inventory_quantity: 25,
      },
      {
        price: "44.99",
        sku: "SNKR-BLK-9",
        option1: "9",
        option2: "Black",
        inventory_management: "shopify",
        inventory_quantity: 22,
      },
      {
        price: "44.99",
        sku: "SNKR-BLK-10",
        option1: "10",
        option2: "Black",
        inventory_management: "shopify",
        inventory_quantity: 28,
      },
    ],
    options: [
      { name: "Size", values: ["9", "10"] },
      { name: "Color", values: ["White", "Black"] }
    ]
  }
];

async function addProducts() {
  console.log('🛍️  Adding Products to KhakiSol Store\n');
  console.log('='.repeat(50));

  const shopify = new ShopifyClient();
  const results = { success: [], failed: [] };

  for (const product of products) {
    try {
      console.log(`\n➕ Adding: ${product.title}...`);
      const response = await shopify.createProduct(product);
      
      console.log(`   ✅ Created successfully!`);
      console.log(`   ID: ${response.product.id}`);
      console.log(`   Variants: ${response.product.variants.length}`);
      console.log(`   Status: ${response.product.status}`);
      
      results.success.push({
        title: product.title,
        id: response.product.id
      });
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      results.failed.push({
        title: product.title,
        error: error.message
      });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Successfully added: ${results.success.length} products`);
  console.log(`❌ Failed: ${results.failed.length} products`);

  if (results.success.length > 0) {
    console.log('\n✅ Added Products:');
    results.success.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.title} (ID: ${p.id})`);
    });
  }

  if (results.failed.length > 0) {
    console.log('\n❌ Failed Products:');
    results.failed.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.title}: ${p.error}`);
    });
  }

  console.log('\n🔗 View your products at:');
  console.log('   https://admin.shopify.com/store/pygcet-kp/products');
  console.log('');
}

addProducts();
