import ShopifyClient from './client/shopifyClient.js';

/**
 * Add the Leather Belt product with fixed variants
 */
const beltProduct = {
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
      option1: "Brown",
      option2: "Medium (32-36)",
      inventory_management: "shopify",
      inventory_quantity: 25,
    },
    {
      price: "29.99",
      sku: "BELT-BRN-L",
      option1: "Brown",
      option2: "Large (36-40)",
      inventory_management: "shopify",
      inventory_quantity: 20,
    },
    {
      price: "29.99",
      sku: "BELT-BLK-M",
      option1: "Black",
      option2: "Medium (32-36)",
      inventory_management: "shopify",
      inventory_quantity: 30,
    },
    {
      price: "29.99",
      sku: "BELT-BLK-L",
      option1: "Black",
      option2: "Large (36-40)",
      inventory_management: "shopify",
      inventory_quantity: 25,
    },
  ],
  options: [
    { name: "Color", values: ["Brown", "Black"] },
    { name: "Size", values: ["Medium (32-36)", "Large (36-40)"] }
  ]
};

async function addBelt() {
  console.log('🛍️  Adding Leather Belt to KhakiSol Store\n');

  const shopify = new ShopifyClient();

  try {
    console.log(`➕ Adding: ${beltProduct.title}...`);
    const response = await shopify.createProduct(beltProduct);
    
    console.log(`✅ Created successfully!`);
    console.log(`   ID: ${response.product.id}`);
    console.log(`   Variants: ${response.product.variants.length}`);
    console.log(`   Status: ${response.product.status}`);
    
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
  }
}

addBelt();
