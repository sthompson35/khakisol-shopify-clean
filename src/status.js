import 'dotenv/config';
import https from 'https';

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                 📊 KHAKISOL STATUS DASHBOARD                     ║
 * ║              Real-time store status at a glance                  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL;
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

async function makeRequest(endpoint) {
    return new Promise((resolve, reject) => {
        const url = `https://${SHOPIFY_STORE_URL}/admin/api/2024-01${endpoint}`;
        const urlObj = new URL(url);
        
        const options = {
            hostname: urlObj.hostname,
            port: 443,
            path: urlObj.pathname + urlObj.search,
            method: 'GET',
            headers: {
                'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`${res.statusCode}`));
                }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function getStatus() {
    console.log('\n' + '═'.repeat(70));
    console.log('║' + ' '.repeat(68) + '║');
    console.log('║' + '   📊 KHAKISOL STORE STATUS DASHBOARD'.padEnd(68) + '║');
    console.log('║' + `   ${new Date().toLocaleString()}`.padEnd(68) + '║');
    console.log('║' + ' '.repeat(68) + '║');
    console.log('═'.repeat(70));

    try {
        // Fetch all data in parallel
        const [shop, products, orders, customers, collections] = await Promise.all([
            makeRequest('/shop.json'),
            makeRequest('/products.json?limit=250'),
            makeRequest('/orders.json?status=any&limit=100'),
            makeRequest('/customers.json?limit=100'),
            makeRequest('/custom_collections.json')
        ]);

        // Store Info
        console.log('\n🏪 STORE INFO');
        console.log('─'.repeat(50));
        console.log(`   Name:     ${shop.shop.name}`);
        console.log(`   Domain:   ${shop.shop.domain}`);
        console.log(`   Email:    ${shop.shop.email}`);
        console.log(`   Plan:     ${shop.shop.plan_display_name}`);
        console.log(`   Currency: ${shop.shop.currency}`);

        // Products
        const allProducts = products.products;
        let totalInventory = 0;
        let totalValue = 0;
        let lowStock = 0;
        let outOfStock = 0;

        allProducts.forEach(p => {
            p.variants.forEach(v => {
                totalInventory += v.inventory_quantity;
                totalValue += v.inventory_quantity * parseFloat(v.price);
                if (v.inventory_quantity === 0) outOfStock++;
                else if (v.inventory_quantity <= 10) lowStock++;
            });
        });

        console.log('\n📦 PRODUCTS & INVENTORY');
        console.log('─'.repeat(50));
        console.log(`   Products:        ${allProducts.length}`);
        console.log(`   Total Units:     ${totalInventory}`);
        console.log(`   Inventory Value: $${totalValue.toFixed(2)}`);
        console.log(`   Low Stock:       ${lowStock} variants`);
        console.log(`   Out of Stock:    ${outOfStock} variants`);

        // Orders
        const allOrders = orders.orders;
        const pendingOrders = allOrders.filter(o => !o.fulfillment_status);
        const totalRevenue = allOrders.reduce((sum, o) => sum + parseFloat(o.total_price), 0);

        console.log('\n📋 ORDERS');
        console.log('─'.repeat(50));
        console.log(`   Total Orders:    ${allOrders.length}`);
        console.log(`   Pending:         ${pendingOrders.length}`);
        console.log(`   Total Revenue:   $${totalRevenue.toFixed(2)}`);

        // Customers
        console.log('\n👥 CUSTOMERS');
        console.log('─'.repeat(50));
        console.log(`   Total:           ${customers.customers.length}`);
        console.log(`   With Email:      ${customers.customers.filter(c => c.email).length}`);

        // Collections
        console.log('\n📁 COLLECTIONS');
        console.log('─'.repeat(50));
        console.log(`   Total:           ${collections.custom_collections.length}`);
        collections.custom_collections.slice(0, 5).forEach(c => {
            console.log(`   • ${c.title}`);
        });

        // AI Troopers Status
        console.log('\n🎖️  AI TROOPERS');
        console.log('─'.repeat(50));
        console.log(`   Available:       30 agents`);
        console.log(`   Squadrons:       7`);
        console.log(`   Run: npm run troopers`);

        // Quick Actions
        console.log('\n⚡ QUICK ACTIONS');
        console.log('─'.repeat(50));
        console.log('   npm run troopers        Deploy all 30 AI agents');
        console.log('   npm run troopers:list   View all agents');
        console.log('   npm run scan            Full project scan');
        console.log('   npm run server          Start webhook server');

        console.log('\n' + '═'.repeat(70));
        console.log('✅ All systems operational');
        console.log('═'.repeat(70));

    } catch (error) {
        console.log(`\n❌ Error: ${error.message}`);
    }
}

getStatus();
