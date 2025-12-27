import ShopifyClient from './client/shopifyClient.js';

/**
 * Add images to Shopify products
 * Images can be added via URL - Shopify will host them automatically
 */

class ProductImageManager {
  constructor() {
    this.shopify = new ShopifyClient();
  }

  /**
   * Add an image to a product by URL
   */
  async addImageByUrl(productId, imageUrl, altText = '') {
    return await this.shopify.request(`/products/${productId}/images.json`, 'POST', {
      image: {
        src: imageUrl,
        alt: altText,
      }
    });
  }

  /**
   * Add multiple images to a product
   */
  async addMultipleImages(productId, images) {
    const results = [];
    for (const image of images) {
      try {
        const result = await this.addImageByUrl(productId, image.url, image.alt);
        results.push({ success: true, image: result.image });
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        results.push({ success: false, error: error.message, url: image.url });
      }
    }
    return results;
  }

  /**
   * Get all products with their IDs
   */
  async getProducts() {
    const { products } = await this.shopify.getProducts({ limit: 250 });
    return products;
  }

  /**
   * Delete all images from a product
   */
  async deleteAllImages(productId) {
    const { product } = await this.shopify.getProduct(productId);
    for (const image of product.images) {
      await this.shopify.request(`/products/${productId}/images/${image.id}.json`, 'DELETE');
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
}

// ============ PRODUCT IMAGE MAPPINGS ============
// Using placeholder images - replace with your actual product image URLs

const productImages = {
  "Classic Cotton T-Shirt": [
    { url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800", alt: "Classic Cotton T-Shirt - Front View" },
    { url: "https://images.unsplash.com/photo-1622445275576-721325763afe?w=800", alt: "Classic Cotton T-Shirt - Black" },
  ],
  "Slim Fit Chino Pants": [
    { url: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800", alt: "Slim Fit Chino Pants - Khaki" },
    { url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800", alt: "Slim Fit Chino Pants - Navy" },
  ],
  "Casual Hoodie": [
    { url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800", alt: "Casual Hoodie - Gray" },
    { url: "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=800", alt: "Casual Hoodie - Black" },
  ],
  "Leather Belt": [
    { url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800", alt: "Leather Belt - Brown" },
    { url: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800", alt: "Leather Belt - Black" },
  ],
  "Canvas Sneakers": [
    { url: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800", alt: "Canvas Sneakers - White" },
    { url: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800", alt: "Canvas Sneakers - Black" },
  ],
  "Premium Denim Jeans": [
    { url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800", alt: "Premium Denim Jeans - Dark Blue" },
    { url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800", alt: "Premium Denim Jeans - Black" },
  ],
  "Polo Shirt": [
    { url: "https://images.unsplash.com/photo-1625910513413-5fc5b62e3b06?w=800", alt: "Polo Shirt - Navy" },
    { url: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800", alt: "Polo Shirt - White" },
  ],
  "Cargo Shorts": [
    { url: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800", alt: "Cargo Shorts - Khaki" },
    { url: "https://images.unsplash.com/photo-1617952385804-7b326fa42323?w=800", alt: "Cargo Shorts - Olive" },
  ],
  "Bomber Jacket": [
    { url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800", alt: "Bomber Jacket - Black" },
    { url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800", alt: "Bomber Jacket - Navy" },
  ],
  "Athletic Joggers": [
    { url: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800", alt: "Athletic Joggers - Gray" },
    { url: "https://images.unsplash.com/photo-1580906853149-f46644acb250?w=800", alt: "Athletic Joggers - Black" },
  ],
  "Crew Neck Sweater": [
    { url: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800", alt: "Crew Neck Sweater - Charcoal" },
    { url: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800", alt: "Crew Neck Sweater - Burgundy" },
  ],
  "Oxford Dress Shirt": [
    { url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800", alt: "Oxford Dress Shirt - White" },
    { url: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800", alt: "Oxford Dress Shirt - Light Blue" },
  ],
  "Beanie Hat": [
    { url: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800", alt: "Beanie Hat - Black" },
    { url: "https://images.unsplash.com/photo-1510598969022-c4c6c5d05769?w=800", alt: "Beanie Hat - Gray" },
  ],
  "Sunglasses": [
    { url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800", alt: "Sunglasses - Aviator Gold" },
    { url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800", alt: "Sunglasses - Black" },
  ],
  "Weekend Duffle Bag": [
    { url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a45?w=800", alt: "Weekend Duffle Bag - Tan" },
    { url: "https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=800", alt: "Weekend Duffle Bag - Black" },
  ],
};

// ============ MAIN ============
async function main() {
  console.log('\n' + '='.repeat(50));
  console.log('🖼️  SHOPIFY PRODUCT IMAGE UPLOADER');
  console.log('='.repeat(50) + '\n');

  const manager = new ProductImageManager();

  try {
    // Get all products
    console.log('📦 Fetching products...\n');
    const products = await manager.getProducts();
    console.log(`   Found ${products.length} products\n`);

    const results = { success: 0, failed: 0, skipped: 0 };

    for (const product of products) {
      const images = productImages[product.title];
      
      if (!images) {
        console.log(`⏭️  ${product.title} - No images configured, skipping`);
        results.skipped++;
        continue;
      }

      // Check if product already has images
      if (product.images && product.images.length > 0) {
        console.log(`✓  ${product.title} - Already has ${product.images.length} images`);
        results.skipped++;
        continue;
      }

      console.log(`🖼️  ${product.title} - Adding ${images.length} images...`);
      
      const uploadResults = await manager.addMultipleImages(product.id, images);
      
      const successCount = uploadResults.filter(r => r.success).length;
      const failCount = uploadResults.filter(r => !r.success).length;
      
      if (successCount > 0) {
        console.log(`   ✅ Added ${successCount} images`);
        results.success += successCount;
      }
      if (failCount > 0) {
        console.log(`   ❌ Failed ${failCount} images`);
        results.failed += failCount;
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 SUMMARY');
    console.log('='.repeat(50));
    console.log(`   ✅ Images added: ${results.success}`);
    console.log(`   ❌ Failed: ${results.failed}`);
    console.log(`   ⏭️  Skipped: ${results.skipped}`);

    console.log('\n🔗 View products at:');
    console.log('   https://admin.shopify.com/store/pygcet-kp/products');

    console.log('\n' + '='.repeat(50));
    console.log('✅ Image upload complete!');
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

export { ProductImageManager };
export default main;

main();
