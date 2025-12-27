import 'dotenv/config';
import https from 'https';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL;
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const API_VERSION = '2024-01';

/**
 * AI-Powered Shopify Store Manager
 * Simulates the n8n workflow with multiple AI agents
 */

class AIStoreManager {
    constructor() {
        this.shopifyBaseUrl = `https://${SHOPIFY_STORE_URL}/admin/api/${API_VERSION}`;
        this.reports = {};
    }

    // ========== HTTP HELPERS ==========
    
    makeOpenAIRequest(messages, systemPrompt = null) {
        return new Promise((resolve, reject) => {
            const allMessages = systemPrompt 
                ? [{ role: 'system', content: systemPrompt }, ...messages]
                : messages;

            const body = JSON.stringify({
                model: 'gpt-4o-mini',
                messages: allMessages,
                max_tokens: 1000
            });

            const options = {
                hostname: 'api.openai.com',
                port: 443,
                path: '/v1/chat/completions',
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        const json = JSON.parse(data);
                        resolve(json.choices[0].message.content);
                    } else {
                        reject(new Error(`OpenAI Error ${res.statusCode}: ${data}`));
                    }
                });
            });

            req.on('error', reject);
            req.write(body);
            req.end();
        });
    }

    makeShopifyRequest(endpoint) {
        return new Promise((resolve, reject) => {
            const url = new URL(`${this.shopifyBaseUrl}${endpoint}`);
            
            const options = {
                hostname: url.hostname,
                port: 443,
                path: url.pathname + url.search,
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
                        reject(new Error(`Shopify Error ${res.statusCode}: ${data}`));
                    }
                });
            });

            req.on('error', reject);
            req.end();
        });
    }

    // ========== DATA FETCHERS ==========

    async getProducts() {
        const data = await this.makeShopifyRequest('/products.json?limit=250');
        return data.products;
    }

    async getOrders() {
        const data = await this.makeShopifyRequest('/orders.json?status=any&limit=50');
        return data.orders;
    }

    async getCustomers() {
        const data = await this.makeShopifyRequest('/customers.json?limit=50');
        return data.customers;
    }

    async getInventoryLevels() {
        const products = await this.getProducts();
        const inventory = [];
        
        for (const product of products) {
            for (const variant of product.variants) {
                inventory.push({
                    product: product.title,
                    variant: variant.title,
                    sku: variant.sku,
                    quantity: variant.inventory_quantity,
                    price: variant.price
                });
            }
        }
        return inventory;
    }

    // ========== AI AGENTS ==========

    async runInventoryAgent() {
        console.log('\n📦 INVENTORY MANAGER AGENT');
        console.log('-'.repeat(40));

        const inventory = await this.getInventoryLevels();
        const lowStockThreshold = 10;
        
        const lowStock = inventory.filter(i => i.quantity <= lowStockThreshold);
        const outOfStock = inventory.filter(i => i.quantity === 0);
        const totalValue = inventory.reduce((sum, i) => sum + (parseFloat(i.price) * i.quantity), 0);

        const inventorySummary = `
Current Inventory Status:
- Total Products/Variants: ${inventory.length}
- Low Stock Items (≤${lowStockThreshold}): ${lowStock.length}
- Out of Stock Items: ${outOfStock.length}
- Total Inventory Value: $${totalValue.toFixed(2)}

Low Stock Items:
${lowStock.map(i => `- ${i.product} (${i.variant}): ${i.quantity} units @ $${i.price}`).join('\n')}

Out of Stock:
${outOfStock.length > 0 ? outOfStock.map(i => `- ${i.product} (${i.variant})`).join('\n') : 'None'}
`;

        const systemPrompt = `You are the Inventory Manager Agent for the Shopify store "KhakiSol".
Your job is to analyze inventory levels and provide actionable recommendations.
Be concise and professional. Focus on urgent issues first.`;

        const response = await this.makeOpenAIRequest([
            { role: 'user', content: `Analyze this inventory data and provide recommendations:\n${inventorySummary}` }
        ], systemPrompt);

        console.log('\n🤖 AI Analysis:');
        console.log(response);
        
        this.reports.inventory = response;
        return response;
    }

    async runCustomerServiceAgent() {
        console.log('\n💬 CUSTOMER SERVICE AGENT');
        console.log('-'.repeat(40));

        const customers = await this.getCustomers();
        const orders = await this.getOrders();

        const customerSummary = `
Customer Overview:
- Total Customers: ${customers.length}
- Recent Customers (with email): ${customers.filter(c => c.email).length}

Recent Orders: ${orders.length}
${orders.slice(0, 5).map(o => `- Order #${o.order_number}: $${o.total_price} - ${o.financial_status}`).join('\n')}

Sample Customer Inquiries to Address:
1. "Where is my order #1001?" - Customer waiting for shipping update
2. "Can I return an item I bought last week?" - Return policy question
3. "Do you have the Bomber Jacket in size XL?" - Product availability
`;

        const systemPrompt = `You are the Customer Service Agent for the Shopify store "KhakiSol".
Your job is to draft helpful, professional responses to customer inquiries.
Be empathetic, clear, and solution-oriented.`;

        const response = await this.makeOpenAIRequest([
            { role: 'user', content: `Here's the customer context. Draft responses for the sample inquiries:\n${customerSummary}` }
        ], systemPrompt);

        console.log('\n🤖 AI Responses:');
        console.log(response);
        
        this.reports.customerService = response;
        return response;
    }

    async runMarketingAgent() {
        console.log('\n📊 MARKETING AGENT');
        console.log('-'.repeat(40));

        const products = await this.getProducts();
        const orders = await this.getOrders();

        // Analyze products
        const productsByType = {};
        products.forEach(p => {
            const type = p.product_type || 'Uncategorized';
            productsByType[type] = (productsByType[type] || 0) + 1;
        });

        const priceRanges = products.map(p => parseFloat(p.variants[0]?.price || 0));
        const avgPrice = priceRanges.reduce((a, b) => a + b, 0) / priceRanges.length;

        const marketingSummary = `
Store Analytics:
- Total Products: ${products.length}
- Product Categories: ${Object.entries(productsByType).map(([k, v]) => `${k}: ${v}`).join(', ')}
- Average Product Price: $${avgPrice.toFixed(2)}
- Price Range: $${Math.min(...priceRanges).toFixed(2)} - $${Math.max(...priceRanges).toFixed(2)}

Top Products by Price:
${products.sort((a, b) => parseFloat(b.variants[0]?.price || 0) - parseFloat(a.variants[0]?.price || 0))
    .slice(0, 5)
    .map(p => `- ${p.title}: $${p.variants[0]?.price}`).join('\n')}

Orders Summary:
- Total Orders: ${orders.length}
- Order Value Range: ${orders.length > 0 ? `$${Math.min(...orders.map(o => parseFloat(o.total_price)))} - $${Math.max(...orders.map(o => parseFloat(o.total_price)))}` : 'No orders yet'}

Current Date: December 4, 2025 (Holiday Season!)
`;

        const systemPrompt = `You are the Marketing Agent for the Shopify store "KhakiSol" (casual/outdoor clothing).
Your job is to analyze sales data and suggest marketing campaigns and promotions.
Focus on actionable strategies. Consider the holiday season timing.`;

        const response = await this.makeOpenAIRequest([
            { role: 'user', content: `Analyze this data and suggest marketing strategies:\n${marketingSummary}` }
        ], systemPrompt);

        console.log('\n🤖 AI Recommendations:');
        console.log(response);
        
        this.reports.marketing = response;
        return response;
    }

    async runOrderFulfillmentAgent() {
        console.log('\n📋 ORDER FULFILLMENT AGENT');
        console.log('-'.repeat(40));

        const orders = await this.getOrders();
        
        const pendingOrders = orders.filter(o => o.fulfillment_status === null);
        const fulfilledOrders = orders.filter(o => o.fulfillment_status === 'fulfilled');

        const orderSummary = `
Order Fulfillment Status:
- Total Orders: ${orders.length}
- Pending Fulfillment: ${pendingOrders.length}
- Fulfilled: ${fulfilledOrders.length}

Pending Orders Detail:
${pendingOrders.length > 0 
    ? pendingOrders.slice(0, 5).map(o => 
        `- Order #${o.order_number}: ${o.line_items?.length || 0} items, $${o.total_price}, Customer: ${o.customer?.first_name || 'Guest'}`
    ).join('\n')
    : 'No pending orders'}

Fulfillment Priority Factors:
- Express shipping orders
- High-value orders
- Orders older than 2 days
`;

        const systemPrompt = `You are the Order Fulfillment Agent for the Shopify store "KhakiSol".
Your job is to prioritize orders and create fulfillment plans.
Be efficient and customer-focused.`;

        const response = await this.makeOpenAIRequest([
            { role: 'user', content: `Create a fulfillment plan based on this order data:\n${orderSummary}` }
        ], systemPrompt);

        console.log('\n🤖 AI Fulfillment Plan:');
        console.log(response);
        
        this.reports.fulfillment = response;
        return response;
    }

    async runOrchestratorAgent() {
        console.log('\n🎯 ORCHESTRATOR AGENT - FINAL SUMMARY');
        console.log('='.repeat(50));

        const summaryPrompt = `
You received reports from 4 specialized agents. Compile an executive summary.

INVENTORY REPORT:
${this.reports.inventory}

CUSTOMER SERVICE REPORT:
${this.reports.customerService}

MARKETING REPORT:
${this.reports.marketing}

ORDER FULFILLMENT REPORT:
${this.reports.fulfillment}

Create a brief executive summary with:
1. Key metrics
2. Top 3 priorities for today
3. Action items for the store owner
`;

        const systemPrompt = `You are the Orchestrator Agent for "KhakiSol" Shopify store.
Your job is to compile reports from other agents into an actionable executive summary.
Be concise and focus on the most important actions.`;

        const response = await this.makeOpenAIRequest([
            { role: 'user', content: summaryPrompt }
        ], systemPrompt);

        console.log('\n🤖 Executive Summary:');
        console.log(response);
        
        return response;
    }

    // ========== MAIN RUNNER ==========

    async runFullSimulation() {
        console.log('\n' + '='.repeat(60));
        console.log('🚀 AI STORE MANAGER - FULL WORKFLOW SIMULATION');
        console.log('='.repeat(60));
        console.log(`\n📍 Store: ${SHOPIFY_STORE_URL}`);
        console.log(`📅 Date: December 4, 2025`);
        console.log(`🤖 Model: gpt-4o-mini`);

        const startTime = Date.now();

        try {
            // Run all agents in sequence (like n8n workflow)
            await this.runInventoryAgent();
            await this.runCustomerServiceAgent();
            await this.runMarketingAgent();
            await this.runOrderFulfillmentAgent();
            
            // Final orchestration
            await this.runOrchestratorAgent();

            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

            console.log('\n' + '='.repeat(60));
            console.log('✅ SIMULATION COMPLETE');
            console.log('='.repeat(60));
            console.log(`⏱️  Total time: ${elapsed} seconds`);
            console.log(`🤖 AI Agents run: 5`);
            console.log(`📊 Reports generated: 4 + Executive Summary`);
            console.log('\n💡 This simulates what the n8n workflow does automatically!');
            console.log('='.repeat(60));

        } catch (error) {
            console.error('\n❌ Simulation failed:', error.message);
        }
    }
}

// Run the simulation
const manager = new AIStoreManager();
manager.runFullSimulation();
