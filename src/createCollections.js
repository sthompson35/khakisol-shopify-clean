import 'dotenv/config';

const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL;
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const API_VERSION = '2024-01';

class CollectionManager {
    constructor() {
        this.baseUrl = `https://${SHOPIFY_STORE_URL}/admin/api/${API_VERSION}`;
        this.headers = {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN
        };
    }

    async makeRequest(endpoint, method = 'GET', body = null) {
        const options = {
            method,
            headers: this.headers
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, options);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Shopify API Error: ${response.status} - ${errorText}`);
        }

        return response.json();
    }

    async getAllProducts() {
        const data = await this.makeRequest('/products.json?limit=250');
        return data.products;
    }

    async createCustomCollection(title, description, products = []) {
        const collectionData = {
            custom_collection: {
                title,
                body_html: description,
                published: true
            }
        };

        // Add products to collection if provided
        if (products.length > 0) {
            collectionData.custom_collection.collects = products.map(product => ({
                product_id: product.id
            }));
        }

        const data = await this.makeRequest('/custom_collections.json', 'POST', collectionData);
        return data.custom_collection;
    }

    async addProductToCollection(collectionId, productId) {
        const collectData = {
            collect: {
                collection_id: collectionId,
                product_id: productId
            }
        };

        const data = await this.makeRequest('/collects.json', 'POST', collectData);
        return data.collect;
    }

    async getExistingCollections() {
        const data = await this.makeRequest('/custom_collections.json');
        return data.custom_collections;
    }

    categorizeProducts(products) {
        const categories = {
            'Tops & Shirts': {
                description: '<p>Discover our collection of stylish tops, shirts, and upper body wear. From casual t-shirts to elegant dress shirts.</p>',
                keywords: ['t-shirt', 'shirt', 'polo', 'hoodie', 'sweater', 'top'],
                products: []
            },
            'Bottoms': {
                description: '<p>Find the perfect fit with our selection of pants, jeans, shorts, and more.</p>',
                keywords: ['jeans', 'pants', 'chino', 'shorts', 'joggers', 'bottom'],
                products: []
            },
            'Outerwear': {
                description: '<p>Stay warm and stylish with our jackets, coats, and layering pieces.</p>',
                keywords: ['jacket', 'coat', 'bomber', 'outerwear', 'layer'],
                products: []
            },
            'Footwear': {
                description: '<p>Step out in style with our collection of shoes, sneakers, and boots.</p>',
                keywords: ['shoe', 'sneaker', 'boot', 'footwear', 'canvas'],
                products: []
            },
            'Accessories': {
                description: '<p>Complete your look with our accessories including bags, belts, hats, and more.</p>',
                keywords: ['belt', 'bag', 'hat', 'beanie', 'sunglasses', 'watch', 'wallet', 'accessory', 'duffle'],
                products: []
            },
            'New Arrivals': {
                description: '<p>Check out our latest additions! Fresh styles just added to our collection.</p>',
                keywords: [],
                products: [] // Will add most recent products
            },
            'Best Sellers': {
                description: '<p>Our most popular items loved by customers. Shop the favorites!</p>',
                keywords: [],
                products: [] // Will add featured products
            }
        };

        // Categorize each product based on keywords
        products.forEach(product => {
            const title = product.title.toLowerCase();
            const productType = (product.product_type || '').toLowerCase();
            const tags = (product.tags || '').toLowerCase();
            const combined = `${title} ${productType} ${tags}`;

            let categorized = false;

            for (const [category, config] of Object.entries(categories)) {
                if (category === 'New Arrivals' || category === 'Best Sellers') continue;

                for (const keyword of config.keywords) {
                    if (combined.includes(keyword)) {
                        config.products.push(product);
                        categorized = true;
                        break;
                    }
                }
            }

            // If not categorized, add to accessories as fallback
            if (!categorized) {
                categories['Accessories'].products.push(product);
            }
        });

        // Add recent products to New Arrivals (last 5)
        const sortedByDate = [...products].sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
        );
        categories['New Arrivals'].products = sortedByDate.slice(0, 5);

        // Add some products to Best Sellers (random selection of 5)
        const shuffled = [...products].sort(() => 0.5 - Math.random());
        categories['Best Sellers'].products = shuffled.slice(0, 5);

        return categories;
    }

    async createAllCollections() {
        console.log('\n' + '='.repeat(50));
        console.log('📁 SHOPIFY COLLECTION CREATOR');
        console.log('='.repeat(50));

        // Check for existing collections
        console.log('\n📋 Checking existing collections...');
        const existingCollections = await this.getExistingCollections();
        console.log(`   Found ${existingCollections.length} existing collections`);

        // Fetch all products
        console.log('\n📦 Fetching products...');
        const products = await this.getAllProducts();
        console.log(`   Found ${products.length} products`);

        if (products.length === 0) {
            console.log('\n❌ No products found. Add products first!');
            return;
        }

        // Categorize products
        const categories = this.categorizeProducts(products);

        let collectionsCreated = 0;
        let productsAdded = 0;

        for (const [collectionName, config] of Object.entries(categories)) {
            // Skip if collection already exists
            const exists = existingCollections.find(c => 
                c.title.toLowerCase() === collectionName.toLowerCase()
            );

            if (exists) {
                console.log(`\n⏭️  "${collectionName}" already exists - skipping`);
                continue;
            }

            if (config.products.length === 0) {
                console.log(`\n⏭️  "${collectionName}" - No matching products`);
                continue;
            }

            console.log(`\n📁 Creating "${collectionName}"...`);
            console.log(`   Adding ${config.products.length} products`);

            try {
                const collection = await this.createCustomCollection(
                    collectionName,
                    config.description,
                    config.products
                );

                console.log(`   ✅ Created with ID: ${collection.id}`);
                collectionsCreated++;
                productsAdded += config.products.length;

                // List products in collection
                config.products.forEach(p => {
                    console.log(`      • ${p.title}`);
                });

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));

            } catch (error) {
                console.log(`   ❌ Failed: ${error.message}`);
            }
        }

        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('📊 SUMMARY');
        console.log('='.repeat(50));
        console.log(`   ✅ Collections created: ${collectionsCreated}`);
        console.log(`   📦 Products organized: ${productsAdded}`);
        console.log(`   ⏭️  Skipped: ${Object.keys(categories).length - collectionsCreated}`);

        console.log('\n🔗 View collections at:');
        console.log(`   https://admin.shopify.com/store/${SHOPIFY_STORE_URL.replace('.myshopify.com', '')}/collections`);

        console.log('\n' + '='.repeat(50));
        console.log('✅ Collection setup complete!');
        console.log('='.repeat(50));
    }
}

// Run the collection creator
const manager = new CollectionManager();
manager.createAllCollections().catch(console.error);
