import ShopifyClient from '../client/shopifyClient.js';

/**
 * Products Management Examples
 */
async function main() {
  console.log('📦 Shopify Products Management\n');
  console.log('='.repeat(50));

  const shopify = new ShopifyClient();

  try {
    // ============ GET ALL PRODUCTS ============
    console.log('\n📋 Fetching all products...\n');
    const { products } = await shopify.getProducts({ limit: 50 });

    if (products.length === 0) {
      console.log('No products found in your store.');
      console.log('\n💡 To create a sample product, uncomment the createProduct section below.');
    } else {
      console.log(`Found ${products.length} products:\n`);
      
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.title}`);
        console.log(`   ID: ${product.id}`);
        console.log(`   Status: ${product.status}`);
        console.log(`   Vendor: ${product.vendor || 'N/A'}`);
        console.log(`   Type: ${product.product_type || 'N/A'}`);
        console.log(`   Variants: ${product.variants.length}`);
        
        if (product.variants.length > 0) {
          const firstVariant = product.variants[0];
          console.log(`   Price: ${firstVariant.price}`);
          console.log(`   Inventory: ${firstVariant.inventory_quantity || 'Not tracked'}`);
        }
        console.log('');
      });
    }

    // ============ CREATE A PRODUCT (Uncomment to use) ============
    /*
    console.log('\n➕ Creating a new product...\n');
    const newProduct = await shopify.createProduct({
      title: 'Sample Product',
      body_html: '<p>This is a sample product created via API</p>',
      vendor: 'My Store',
      product_type: 'Sample',
      status: 'draft',
      variants: [
        {
          price: '19.99',
          sku: 'SAMPLE-001',
          inventory_management: 'shopify',
          inventory_quantity: 100,
        }
      ]
    });
    console.log('✅ Product created:', newProduct.product.title);
    console.log('   ID:', newProduct.product.id);
    */

    // ============ UPDATE A PRODUCT (Uncomment to use) ============
    /*
    const productId = 'YOUR_PRODUCT_ID';
    console.log(`\n✏️  Updating product ${productId}...\n`);
    const updatedProduct = await shopify.updateProduct(productId, {
      title: 'Updated Product Title',
      status: 'active',
    });
    console.log('✅ Product updated:', updatedProduct.product.title);
    */

    // ============ DELETE A PRODUCT (Uncomment to use) ============
    /*
    const productIdToDelete = 'YOUR_PRODUCT_ID';
    console.log(`\n🗑️  Deleting product ${productIdToDelete}...\n`);
    await shopify.deleteProduct(productIdToDelete);
    console.log('✅ Product deleted');
    */

    // ============ GRAPHQL EXAMPLE ============
    console.log('\n🔷 GraphQL Query Example:\n');
    const graphqlProducts = await shopify.graphql(`
      query {
        products(first: 5) {
          edges {
            node {
              id
              title
              handle
              status
              totalInventory
              priceRangeV2 {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    `);

    console.log('Products via GraphQL:');
    graphqlProducts.products.edges.forEach(({ node }, index) => {
      console.log(`${index + 1}. ${node.title} (${node.status})`);
      console.log(`   Handle: ${node.handle}`);
      console.log(`   Inventory: ${node.totalInventory}`);
      console.log(`   Price: ${node.priceRangeV2.minVariantPrice.amount} ${node.priceRangeV2.minVariantPrice.currencyCode}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
