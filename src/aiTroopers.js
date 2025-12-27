import 'dotenv/config';
import https from 'https';

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                    🎖️ AI TROOPERS COMMAND                        ║
 * ║              30 Specialized AI Agents for Shopify                ║
 * ║                     KhakiSol Store Manager                       ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL;
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const API_VERSION = '2024-01';

// ═══════════════════════════════════════════════════════════════════
// 🎖️ AI TROOPER DEFINITIONS - 30 SPECIALIZED AGENTS
// ═══════════════════════════════════════════════════════════════════

const AI_TROOPERS = {
    // ─────────────────────────────────────────────────────────────────
    // 📦 INVENTORY SQUADRON (5 Troopers)
    // ─────────────────────────────────────────────────────────────────
    INVENTORY_SCOUT: {
        id: 'T001',
        name: 'Inventory Scout',
        emoji: '🔍',
        squadron: 'Inventory',
        role: 'Scans all inventory levels and identifies anomalies',
        systemPrompt: `You are the Inventory Scout for KhakiSol store. 
Your mission: Scan inventory data and identify critical issues.
Report: Low stock alerts, out-of-stock items, overstock situations.
Be precise and list items by priority. Format as actionable intel.`
    },
    STOCK_PREDICTOR: {
        id: 'T002',
        name: 'Stock Predictor',
        emoji: '📊',
        squadron: 'Inventory',
        role: 'Predicts future stock needs based on trends',
        systemPrompt: `You are the Stock Predictor for KhakiSol store.
Your mission: Analyze inventory velocity and predict reorder needs.
Consider: Seasonality, current stock levels, typical demand.
Provide: 7-day and 30-day stock forecasts with reorder recommendations.`
    },
    REORDER_COMMANDER: {
        id: 'T003',
        name: 'Reorder Commander',
        emoji: '📋',
        squadron: 'Inventory',
        role: 'Creates purchase orders and restock plans',
        systemPrompt: `You are the Reorder Commander for KhakiSol store.
Your mission: Generate purchase orders for low stock items.
Include: SKU, quantity needed, priority level, suggested vendor.
Format as ready-to-execute purchase orders.`
    },
    WAREHOUSE_OPTIMIZER: {
        id: 'T004',
        name: 'Warehouse Optimizer',
        emoji: '📦',
        squadron: 'Inventory',
        role: 'Optimizes inventory organization and storage',
        systemPrompt: `You are the Warehouse Optimizer for KhakiSol store.
Your mission: Suggest optimal inventory organization strategies.
Analyze: Product categories, turnover rates, storage efficiency.
Recommend: Layout improvements, picking optimization, zone assignments.`
    },
    SHRINKAGE_DETECTIVE: {
        id: 'T005',
        name: 'Shrinkage Detective',
        emoji: '🕵️',
        squadron: 'Inventory',
        role: 'Identifies inventory discrepancies and loss',
        systemPrompt: `You are the Shrinkage Detective for KhakiSol store.
Your mission: Identify potential inventory shrinkage and discrepancies.
Analyze: Expected vs actual quantities, suspicious patterns.
Report: Potential causes and prevention recommendations.`
    },

    // ─────────────────────────────────────────────────────────────────
    // 💬 CUSTOMER SERVICE SQUADRON (5 Troopers)
    // ─────────────────────────────────────────────────────────────────
    GREETING_SPECIALIST: {
        id: 'T006',
        name: 'Greeting Specialist',
        emoji: '👋',
        squadron: 'Customer Service',
        role: 'Crafts personalized welcome messages',
        systemPrompt: `You are the Greeting Specialist for KhakiSol store.
Your mission: Create warm, personalized welcome messages for customers.
Tone: Friendly, professional, brand-aligned (casual outdoor lifestyle).
Include: Personalization, current promotions, helpful navigation tips.`
    },
    COMPLAINT_RESOLVER: {
        id: 'T007',
        name: 'Complaint Resolver',
        emoji: '🛡️',
        squadron: 'Customer Service',
        role: 'Handles customer complaints with empathy',
        systemPrompt: `You are the Complaint Resolver for KhakiSol store.
Your mission: Turn unhappy customers into brand advocates.
Approach: Empathetic listening, acknowledge frustration, provide solutions.
Always offer: Resolution options, compensation when appropriate, follow-up.`
    },
    FAQ_MASTER: {
        id: 'T008',
        name: 'FAQ Master',
        emoji: '❓',
        squadron: 'Customer Service',
        role: 'Answers common questions instantly',
        systemPrompt: `You are the FAQ Master for KhakiSol store.
Your mission: Provide instant, accurate answers to common questions.
Topics: Shipping, returns, sizing, product care, order tracking.
Style: Clear, concise, helpful. Include relevant links when applicable.`
    },
    RETURN_SPECIALIST: {
        id: 'T009',
        name: 'Return Specialist',
        emoji: '↩️',
        squadron: 'Customer Service',
        role: 'Manages returns and exchanges smoothly',
        systemPrompt: `You are the Return Specialist for KhakiSol store.
Your mission: Make returns and exchanges hassle-free.
Process: Explain policy clearly, provide return labels, offer exchanges.
Goal: Retain customer loyalty even through returns.`
    },
    VIP_CONCIERGE: {
        id: 'T010',
        name: 'VIP Concierge',
        emoji: '👑',
        squadron: 'Customer Service',
        role: 'Provides premium service for top customers',
        systemPrompt: `You are the VIP Concierge for KhakiSol store.
Your mission: Deliver white-glove service to high-value customers.
Services: Priority support, exclusive offers, personalized recommendations.
Tone: Sophisticated, attentive, anticipating needs.`
    },

    // ─────────────────────────────────────────────────────────────────
    // 📊 MARKETING SQUADRON (5 Troopers)
    // ─────────────────────────────────────────────────────────────────
    CAMPAIGN_STRATEGIST: {
        id: 'T011',
        name: 'Campaign Strategist',
        emoji: '🎯',
        squadron: 'Marketing',
        role: 'Designs marketing campaigns',
        systemPrompt: `You are the Campaign Strategist for KhakiSol store.
Your mission: Design high-converting marketing campaigns.
Consider: Target audience, seasonality, budget, channels.
Deliver: Campaign briefs with goals, tactics, timelines, KPIs.`
    },
    CONTENT_CREATOR: {
        id: 'T012',
        name: 'Content Creator',
        emoji: '✍️',
        squadron: 'Marketing',
        role: 'Creates compelling marketing content',
        systemPrompt: `You are the Content Creator for KhakiSol store.
Your mission: Write engaging content that converts.
Formats: Email copy, social posts, product descriptions, ads.
Voice: Adventurous, authentic, casual outdoor lifestyle brand.`
    },
    SEO_WARRIOR: {
        id: 'T013',
        name: 'SEO Warrior',
        emoji: '🔎',
        squadron: 'Marketing',
        role: 'Optimizes for search engine visibility',
        systemPrompt: `You are the SEO Warrior for KhakiSol store.
Your mission: Boost organic search visibility.
Focus: Keyword optimization, meta descriptions, content structure.
Deliver: SEO recommendations with priority and expected impact.`
    },
    SOCIAL_MEDIA_CAPTAIN: {
        id: 'T014',
        name: 'Social Media Captain',
        emoji: '📱',
        squadron: 'Marketing',
        role: 'Manages social media presence',
        systemPrompt: `You are the Social Media Captain for KhakiSol store.
Your mission: Build engaging social media presence.
Platforms: Instagram, Facebook, TikTok, Pinterest.
Content: Posts, stories, reels ideas, hashtag strategies, engagement tactics.`
    },
    PROMO_ARCHITECT: {
        id: 'T015',
        name: 'Promo Architect',
        emoji: '🏷️',
        squadron: 'Marketing',
        role: 'Designs promotions and discount strategies',
        systemPrompt: `You are the Promo Architect for KhakiSol store.
Your mission: Create irresistible promotions that drive sales.
Types: Flash sales, bundles, loyalty rewards, seasonal offers.
Balance: Revenue goals with customer value perception.`
    },

    // ─────────────────────────────────────────────────────────────────
    // 📋 ORDER FULFILLMENT SQUADRON (5 Troopers)
    // ─────────────────────────────────────────────────────────────────
    ORDER_PRIORITIZER: {
        id: 'T016',
        name: 'Order Prioritizer',
        emoji: '⚡',
        squadron: 'Fulfillment',
        role: 'Prioritizes orders for efficient processing',
        systemPrompt: `You are the Order Prioritizer for KhakiSol store.
Your mission: Optimize order processing queue.
Factors: Shipping speed, order value, customer tier, order age.
Output: Prioritized order list with processing recommendations.`
    },
    SHIPPING_OPTIMIZER: {
        id: 'T017',
        name: 'Shipping Optimizer',
        emoji: '🚚',
        squadron: 'Fulfillment',
        role: 'Optimizes shipping routes and carriers',
        systemPrompt: `You are the Shipping Optimizer for KhakiSol store.
Your mission: Minimize shipping costs while maintaining speed.
Analyze: Carrier options, delivery zones, package dimensions.
Recommend: Best carrier for each order, cost savings opportunities.`
    },
    PACKING_SPECIALIST: {
        id: 'T018',
        name: 'Packing Specialist',
        emoji: '📦',
        squadron: 'Fulfillment',
        role: 'Optimizes packing and reduces waste',
        systemPrompt: `You are the Packing Specialist for KhakiSol store.
Your mission: Optimize packaging for protection and cost.
Consider: Product fragility, box sizes, materials, branding.
Reduce: Waste, dimensional weight charges, damage rates.`
    },
    TRACKING_COMMUNICATOR: {
        id: 'T019',
        name: 'Tracking Communicator',
        emoji: '📍',
        squadron: 'Fulfillment',
        role: 'Sends proactive shipping updates',
        systemPrompt: `You are the Tracking Communicator for KhakiSol store.
Your mission: Keep customers informed about their orders.
Communications: Shipped notifications, delay alerts, delivery confirmations.
Tone: Friendly, informative, building anticipation.`
    },
    DELIVERY_ANALYST: {
        id: 'T020',
        name: 'Delivery Analyst',
        emoji: '📈',
        squadron: 'Fulfillment',
        role: 'Analyzes delivery performance metrics',
        systemPrompt: `You are the Delivery Analyst for KhakiSol store.
Your mission: Monitor and improve delivery performance.
Metrics: On-time rate, damage rate, customer satisfaction.
Report: Carrier performance comparisons, improvement recommendations.`
    },

    // ─────────────────────────────────────────────────────────────────
    // 💰 SALES & ANALYTICS SQUADRON (5 Troopers)
    // ─────────────────────────────────────────────────────────────────
    REVENUE_ANALYST: {
        id: 'T021',
        name: 'Revenue Analyst',
        emoji: '💵',
        squadron: 'Analytics',
        role: 'Tracks and analyzes revenue metrics',
        systemPrompt: `You are the Revenue Analyst for KhakiSol store.
Your mission: Provide actionable revenue insights.
Metrics: Daily/weekly/monthly revenue, trends, comparisons.
Analysis: Growth drivers, opportunities, concerns.`
    },
    CONVERSION_OPTIMIZER: {
        id: 'T022',
        name: 'Conversion Optimizer',
        emoji: '🎯',
        squadron: 'Analytics',
        role: 'Improves conversion rates',
        systemPrompt: `You are the Conversion Optimizer for KhakiSol store.
Your mission: Increase visitor-to-customer conversion.
Analyze: Funnel drop-offs, cart abandonment, checkout friction.
Recommend: A/B tests, UX improvements, persuasion tactics.`
    },
    CUSTOMER_SEGMENTER: {
        id: 'T023',
        name: 'Customer Segmenter',
        emoji: '👥',
        squadron: 'Analytics',
        role: 'Segments customers for targeted marketing',
        systemPrompt: `You are the Customer Segmenter for KhakiSol store.
Your mission: Create actionable customer segments.
Criteria: Purchase behavior, demographics, engagement, value.
Output: Segment profiles with tailored marketing recommendations.`
    },
    TREND_SPOTTER: {
        id: 'T024',
        name: 'Trend Spotter',
        emoji: '🔮',
        squadron: 'Analytics',
        role: 'Identifies emerging trends and opportunities',
        systemPrompt: `You are the Trend Spotter for KhakiSol store.
Your mission: Identify trends before competitors.
Monitor: Industry trends, customer preferences, seasonal patterns.
Report: Emerging opportunities with actionable recommendations.`
    },
    PROFIT_GUARDIAN: {
        id: 'T025',
        name: 'Profit Guardian',
        emoji: '🛡️',
        squadron: 'Analytics',
        role: 'Monitors margins and profitability',
        systemPrompt: `You are the Profit Guardian for KhakiSol store.
Your mission: Protect and grow profit margins.
Analyze: Product margins, cost trends, pricing opportunities.
Alert: Margin erosion, recommend price adjustments.`
    },

    // ─────────────────────────────────────────────────────────────────
    // 🛡️ OPERATIONS & SECURITY SQUADRON (5 Troopers)
    // ─────────────────────────────────────────────────────────────────
    FRAUD_DETECTOR: {
        id: 'T026',
        name: 'Fraud Detector',
        emoji: '🚨',
        squadron: 'Security',
        role: 'Identifies and prevents fraudulent orders',
        systemPrompt: `You are the Fraud Detector for KhakiSol store.
Your mission: Protect the store from fraud.
Analyze: Order patterns, payment anomalies, high-risk indicators.
Action: Flag suspicious orders, recommend verification steps.`
    },
    COMPLIANCE_OFFICER: {
        id: 'T027',
        name: 'Compliance Officer',
        emoji: '📜',
        squadron: 'Security',
        role: 'Ensures regulatory compliance',
        systemPrompt: `You are the Compliance Officer for KhakiSol store.
Your mission: Ensure all operations are compliant.
Areas: GDPR, PCI-DSS, consumer protection, accessibility.
Report: Compliance status, risks, required actions.`
    },
    BACKUP_COMMANDER: {
        id: 'T028',
        name: 'Backup Commander',
        emoji: '💾',
        squadron: 'Security',
        role: 'Manages data backup and recovery',
        systemPrompt: `You are the Backup Commander for KhakiSol store.
Your mission: Ensure business continuity through proper backups.
Strategy: Data backup schedules, recovery procedures, testing.
Report: Backup status, recovery time objectives, recommendations.`
    },
    PERFORMANCE_MONITOR: {
        id: 'T029',
        name: 'Performance Monitor',
        emoji: '⚙️',
        squadron: 'Operations',
        role: 'Monitors system performance and uptime',
        systemPrompt: `You are the Performance Monitor for KhakiSol store.
Your mission: Ensure optimal store performance.
Monitor: Page load times, API response, checkout speed.
Alert: Performance degradation, recommend optimizations.`
    },
    INTEGRATION_SPECIALIST: {
        id: 'T030',
        name: 'Integration Specialist',
        emoji: '🔗',
        squadron: 'Operations',
        role: 'Manages third-party integrations',
        systemPrompt: `You are the Integration Specialist for KhakiSol store.
Your mission: Ensure smooth operation of all integrations.
Systems: Payment gateways, shipping carriers, marketing tools, analytics.
Report: Integration health, sync status, issue resolution.`
    }
};

// ═══════════════════════════════════════════════════════════════════
// 🎖️ AI TROOPERS COMMAND CENTER
// ═══════════════════════════════════════════════════════════════════

class AITroopersCommand {
    constructor() {
        this.shopifyBaseUrl = `https://${SHOPIFY_STORE_URL}/admin/api/${API_VERSION}`;
        this.troopers = AI_TROOPERS;
        this.missionReports = {};
        this.startTime = null;
    }

    // HTTP Helpers
    async makeOpenAIRequest(messages, systemPrompt) {
        return new Promise((resolve, reject) => {
            const allMessages = [{ role: 'system', content: systemPrompt }, ...messages];
            const body = JSON.stringify({
                model: 'gpt-4o-mini',
                messages: allMessages,
                max_tokens: 800
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
                        reject(new Error(`OpenAI Error: ${data}`));
                    }
                });
            });
            req.on('error', reject);
            req.write(body);
            req.end();
        });
    }

    async makeShopifyRequest(endpoint) {
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
                        reject(new Error(`Shopify Error: ${data}`));
                    }
                });
            });
            req.on('error', reject);
            req.end();
        });
    }

    // Data Collection
    async gatherIntel() {
        console.log('\n📡 Gathering store intelligence...');
        
        const [productsData, ordersData, customersData] = await Promise.all([
            this.makeShopifyRequest('/products.json?limit=250'),
            this.makeShopifyRequest('/orders.json?status=any&limit=100'),
            this.makeShopifyRequest('/customers.json?limit=100')
        ]);

        const products = productsData.products;
        const orders = ordersData.orders;
        const customers = customersData.customers;

        // Calculate metrics
        const inventory = [];
        let totalValue = 0;
        products.forEach(p => {
            p.variants.forEach(v => {
                inventory.push({
                    product: p.title,
                    variant: v.title,
                    sku: v.sku,
                    quantity: v.inventory_quantity,
                    price: parseFloat(v.price)
                });
                totalValue += v.inventory_quantity * parseFloat(v.price);
            });
        });

        const lowStock = inventory.filter(i => i.quantity <= 10 && i.quantity > 0);
        const outOfStock = inventory.filter(i => i.quantity === 0);

        return {
            products,
            orders,
            customers,
            inventory,
            metrics: {
                totalProducts: products.length,
                totalVariants: inventory.length,
                totalOrders: orders.length,
                totalCustomers: customers.length,
                inventoryValue: totalValue,
                lowStockCount: lowStock.length,
                outOfStockCount: outOfStock.length,
                lowStockItems: lowStock,
                outOfStockItems: outOfStock
            }
        };
    }

    // Deploy a single trooper
    async deployTrooper(trooper, intel, context = '') {
        const trooperInfo = `[${trooper.id}] ${trooper.emoji} ${trooper.name}`;
        
        try {
            const prompt = `
Store: KhakiSol (${SHOPIFY_STORE_URL})
Date: ${new Date().toISOString().split('T')[0]}

STORE METRICS:
- Products: ${intel.metrics.totalProducts}
- Variants: ${intel.metrics.totalVariants}
- Orders: ${intel.metrics.totalOrders}
- Customers: ${intel.metrics.totalCustomers}
- Inventory Value: $${intel.metrics.inventoryValue.toFixed(2)}
- Low Stock Items: ${intel.metrics.lowStockCount}
- Out of Stock: ${intel.metrics.outOfStockCount}

${context}

Execute your mission and provide a concise report.`;

            const response = await this.makeOpenAIRequest(
                [{ role: 'user', content: prompt }],
                trooper.systemPrompt
            );

            return { success: true, trooper, response };
        } catch (error) {
            return { success: false, trooper, error: error.message };
        }
    }

    // Deploy squadron
    async deploySquadron(squadronName, intel) {
        const squadronTroopers = Object.values(this.troopers)
            .filter(t => t.squadron === squadronName);

        console.log(`\n${'─'.repeat(60)}`);
        console.log(`🎖️  DEPLOYING ${squadronName.toUpperCase()} SQUADRON`);
        console.log(`${'─'.repeat(60)}`);

        const results = [];
        for (const trooper of squadronTroopers) {
            process.stdout.write(`   ${trooper.emoji} ${trooper.name}...`);
            const result = await this.deployTrooper(trooper, intel);
            if (result.success) {
                console.log(' ✅');
                results.push(result);
            } else {
                console.log(' ❌');
            }
            // Small delay to avoid rate limiting
            await new Promise(r => setTimeout(r, 300));
        }

        return results;
    }

    // Full deployment
    async executeFullDeployment() {
        this.startTime = Date.now();

        console.log('\n' + '═'.repeat(70));
        console.log('║' + ' '.repeat(68) + '║');
        console.log('║' + '   🎖️  AI TROOPERS COMMAND - FULL DEPLOYMENT'.padEnd(68) + '║');
        console.log('║' + '   30 Specialized AI Agents for KhakiSol Store'.padEnd(68) + '║');
        console.log('║' + ' '.repeat(68) + '║');
        console.log('═'.repeat(70));

        // Gather intel
        const intel = await this.gatherIntel();
        console.log(`\n📊 Intel gathered: ${intel.metrics.totalProducts} products, ${intel.metrics.totalOrders} orders, ${intel.metrics.totalCustomers} customers`);

        // Deploy all squadrons
        const squadrons = ['Inventory', 'Customer Service', 'Marketing', 'Fulfillment', 'Analytics', 'Security', 'Operations'];
        const allResults = [];

        for (const squadron of squadrons) {
            const results = await this.deploySquadron(squadron, intel);
            allResults.push(...results);
        }

        // Generate executive briefing
        await this.generateExecutiveBriefing(allResults, intel);

        const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);

        console.log('\n' + '═'.repeat(70));
        console.log('║' + ' '.repeat(68) + '║');
        console.log('║' + '   ✅ DEPLOYMENT COMPLETE'.padEnd(68) + '║');
        console.log('║' + ` `.padEnd(68) + '║');
        console.log('║' + `   ⏱️  Time: ${elapsed} seconds`.padEnd(68) + '║');
        console.log('║' + `   🎖️  Troopers deployed: ${allResults.length}/30`.padEnd(68) + '║');
        console.log('║' + `   📊 Reports generated: ${allResults.length + 1}`.padEnd(68) + '║');
        console.log('║' + ' '.repeat(68) + '║');
        console.log('═'.repeat(70));
    }

    async generateExecutiveBriefing(results, intel) {
        console.log('\n' + '─'.repeat(60));
        console.log('📋 GENERATING EXECUTIVE BRIEFING');
        console.log('─'.repeat(60));

        const summaries = results.slice(0, 10).map(r => 
            `${r.trooper.emoji} ${r.trooper.name}: ${r.response.substring(0, 200)}...`
        ).join('\n\n');

        const briefingPrompt = `
You are the AI Troopers Commander generating an executive briefing.

STORE METRICS:
- Products: ${intel.metrics.totalProducts}
- Inventory Value: $${intel.metrics.inventoryValue.toFixed(2)}
- Orders: ${intel.metrics.totalOrders}
- Customers: ${intel.metrics.totalCustomers}
- Low Stock: ${intel.metrics.lowStockCount} items
- Out of Stock: ${intel.metrics.outOfStockCount} items

SAMPLE TROOPER REPORTS:
${summaries}

Create a brief executive summary with:
1. 🎯 TOP 3 PRIORITIES (urgent actions needed)
2. 💰 REVENUE OPPORTUNITIES (quick wins)
3. ⚠️ RISK ALERTS (issues to address)
4. 📈 GROWTH RECOMMENDATIONS (strategic moves)

Be concise and actionable. Use bullet points.`;

        const briefing = await this.makeOpenAIRequest(
            [{ role: 'user', content: briefingPrompt }],
            'You are the AI Troopers Commander. Create clear, actionable executive briefings.'
        );

        console.log('\n' + '═'.repeat(60));
        console.log('🎖️  EXECUTIVE BRIEFING');
        console.log('═'.repeat(60));
        console.log(briefing);
    }

    // Quick deployment - specific squadrons only
    async quickDeploy(squadronNames) {
        this.startTime = Date.now();
        
        console.log('\n' + '═'.repeat(60));
        console.log('🎖️  AI TROOPERS - QUICK DEPLOYMENT');
        console.log('═'.repeat(60));

        const intel = await this.gatherIntel();
        
        for (const squadron of squadronNames) {
            await this.deploySquadron(squadron, intel);
        }

        const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
        console.log(`\n✅ Quick deployment complete in ${elapsed}s`);
    }

    // List all troopers
    listTroopers() {
        console.log('\n' + '═'.repeat(70));
        console.log('🎖️  AI TROOPERS ROSTER - 30 SPECIALIZED AGENTS');
        console.log('═'.repeat(70));

        const squadrons = {};
        Object.values(this.troopers).forEach(t => {
            if (!squadrons[t.squadron]) squadrons[t.squadron] = [];
            squadrons[t.squadron].push(t);
        });

        for (const [squadron, troopers] of Object.entries(squadrons)) {
            console.log(`\n📁 ${squadron.toUpperCase()} SQUADRON`);
            console.log('─'.repeat(50));
            troopers.forEach(t => {
                console.log(`   ${t.id} ${t.emoji} ${t.name.padEnd(25)} ${t.role}`);
            });
        }

        console.log('\n' + '═'.repeat(70));
    }
}

// ═══════════════════════════════════════════════════════════════════
// 🚀 MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════════

const command = new AITroopersCommand();

// Parse command line arguments
const args = process.argv.slice(2);

if (args.includes('--list')) {
    command.listTroopers();
} else if (args.includes('--quick')) {
    const squadrons = args.filter(a => !a.startsWith('--'));
    command.quickDeploy(squadrons.length > 0 ? squadrons : ['Inventory', 'Analytics']);
} else {
    command.executeFullDeployment().catch(console.error);
}

export { AITroopersCommand, AI_TROOPERS };
