import 'dotenv/config';
import NotionClient from './notion.js';
import SlackClient from './slack.js';
import OllamaClient from './ollama.js';

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                     🎯 INTEGRATION HUB                           ║
 * ║          Unified Command Center for All Integrations            ║
 * ╚══════════════════════════════════════════════════════════════════╝
 * 
 * This hub provides a unified interface for all integrations:
 * - Notion: Documentation, databases, task management
 * - Slack: Team notifications, alerts, reports
 * - Ollama: Local AI for quick analysis without API costs
 */

class IntegrationHub {
    constructor() {
        this.notion = new NotionClient();
        this.slack = new SlackClient();
        this.ollama = new OllamaClient();
        this.status = {
            notion: false,
            slack: false,
            ollama: false
        };
    }

    // ─────────────────────────────────────────────────────────────
    // INITIALIZATION
    // ─────────────────────────────────────────────────────────────

    async initialize() {
        console.log('🔌 Initializing Integration Hub...');
        
        const tests = await Promise.allSettled([
            this.notion.testConnection(),
            this.slack.testConnection(),
            this.ollama.testConnection()
        ]);

        this.status.notion = tests[0].status === 'fulfilled' && tests[0].value.success;
        this.status.slack = tests[1].status === 'fulfilled' && tests[1].value.success;
        this.status.ollama = tests[2].status === 'fulfilled' && tests[2].value.success;

        const connected = Object.values(this.status).filter(Boolean).length;
        console.log(`   ✅ ${connected}/3 integrations connected`);
        
        return this.status;
    }

    getStatus() {
        return this.status;
    }

    // ─────────────────────────────────────────────────────────────
    // NOTIFICATIONS (Multi-Channel)
    // ─────────────────────────────────────────────────────────────

    async notify(title, message, options = {}) {
        const results = { slack: null, notion: null };
        const { channel, priority = 'normal', logToNotion = true } = options;

        // Send to Slack
        if (this.status.slack) {
            try {
                const emoji = priority === 'high' ? '🚨' : priority === 'low' ? 'ℹ️' : '📢';
                results.slack = await this.slack.sendRichMessage(
                    channel || process.env.SLACK_CHANNEL_ID,
                    [{
                        color: priority === 'high' ? '#ff0000' : priority === 'low' ? '#36a64f' : '#0066cc',
                        title: `${emoji} ${title}`,
                        text: message,
                        footer: 'KhakiSol Integration Hub',
                        ts: Math.floor(Date.now() / 1000)
                    }]
                );
            } catch (e) {
                results.slack = { error: e.message };
            }
        }

        // Log to Notion
        if (this.status.notion && logToNotion && process.env.NOTION_DATABASE_ID) {
            try {
                results.notion = await this.notion.createPage(process.env.NOTION_DATABASE_ID, {
                    'Title': { title: [{ text: { content: title } }] },
                    'Status': { select: { name: priority === 'high' ? 'Urgent' : 'Active' } },
                    'Message': { rich_text: [{ text: { content: message } }] },
                    'Date': { date: { start: new Date().toISOString() } }
                });
            } catch (e) {
                results.notion = { error: e.message };
            }
        }

        return results;
    }

    // ─────────────────────────────────────────────────────────────
    // ORDER NOTIFICATIONS
    // ─────────────────────────────────────────────────────────────

    async notifyNewOrder(order) {
        const { order_number, total_price, customer, line_items } = order;
        
        const message = `
**Order #${order_number}**
Customer: ${customer?.first_name} ${customer?.last_name}
Total: $${total_price}
Items: ${line_items?.length || 0} products
        `.trim();

        return this.notify(`New Order #${order_number}`, message, { priority: 'normal' });
    }

    async notifyLowStock(product, variant, quantity) {
        const message = `
**${product.title}** is running low!
Variant: ${variant.title}
Current Stock: ${quantity}
Threshold: ${process.env.LOW_STOCK_THRESHOLD || 10}
        `.trim();

        return this.notify(`Low Stock Alert: ${product.title}`, message, { priority: 'high' });
    }

    // ─────────────────────────────────────────────────────────────
    // AI ANALYSIS (Local with Ollama)
    // ─────────────────────────────────────────────────────────────

    async analyzeWithLocalAI(prompt, context = {}) {
        if (!this.status.ollama) {
            return { error: 'Ollama not connected', fallback: true };
        }

        try {
            const systemPrompt = `You are an AI assistant for KhakiSol, an e-commerce store management system. 
Provide concise, actionable insights. Context: ${JSON.stringify(context)}`;

            const response = await this.ollama.chat([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ]);

            return { response, source: 'ollama' };
        } catch (e) {
            return { error: e.message, fallback: true };
        }
    }

    async summarizeSalesData(salesData) {
        const prompt = `Analyze this sales data and provide 3 key insights:
${JSON.stringify(salesData, null, 2)}`;

        return this.analyzeWithLocalAI(prompt, { type: 'sales_analysis' });
    }

    async suggestInventoryActions(inventoryData) {
        const prompt = `Review this inventory data and suggest 3 actions:
${JSON.stringify(inventoryData, null, 2)}`;

        return this.analyzeWithLocalAI(prompt, { type: 'inventory_analysis' });
    }

    // ─────────────────────────────────────────────────────────────
    // DOCUMENTATION (Notion)
    // ─────────────────────────────────────────────────────────────

    async logToNotion(title, content, databaseId = null) {
        if (!this.status.notion) {
            return { error: 'Notion not connected' };
        }

        const dbId = databaseId || process.env.NOTION_DATABASE_ID;
        if (!dbId) {
            return { error: 'No database ID provided' };
        }

        return this.notion.createPage(dbId, {
            'Title': { title: [{ text: { content: title } }] },
            'Content': { rich_text: [{ text: { content: content } }] },
            'Created': { date: { start: new Date().toISOString() } }
        });
    }

    async createTaskInNotion(title, description, priority = 'Medium') {
        if (!this.status.notion) {
            return { error: 'Notion not connected' };
        }

        const dbId = process.env.NOTION_TASKS_DATABASE_ID || process.env.NOTION_DATABASE_ID;
        if (!dbId) {
            return { error: 'No tasks database ID provided' };
        }

        return this.notion.createPage(dbId, {
            'Task': { title: [{ text: { content: title } }] },
            'Description': { rich_text: [{ text: { content: description } }] },
            'Priority': { select: { name: priority } },
            'Status': { select: { name: 'Not Started' } },
            'Created': { date: { start: new Date().toISOString() } }
        });
    }

    // ─────────────────────────────────────────────────────────────
    // DAILY OPERATIONS
    // ─────────────────────────────────────────────────────────────

    async sendDailyReport(reportData) {
        const { date, orders, revenue, topProducts, lowStock } = reportData;

        // Format the report
        const slackBlocks = [
            {
                type: 'header',
                text: { type: 'plain_text', text: `📊 Daily Report - ${date}` }
            },
            {
                type: 'section',
                fields: [
                    { type: 'mrkdwn', text: `*Orders:*\n${orders}` },
                    { type: 'mrkdwn', text: `*Revenue:*\n$${revenue}` }
                ]
            }
        ];

        if (topProducts && topProducts.length > 0) {
            slackBlocks.push({
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*Top Products:*\n${topProducts.map((p, i) => `${i + 1}. ${p.name} (${p.sold} sold)`).join('\n')}`
                }
            });
        }

        if (lowStock && lowStock.length > 0) {
            slackBlocks.push({
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*⚠️ Low Stock:*\n${lowStock.map(p => `• ${p.name}: ${p.quantity} left`).join('\n')}`
                }
            });
        }

        // Send to Slack
        if (this.status.slack) {
            await this.slack.sendRichMessage(
                process.env.SLACK_CHANNEL_ID,
                slackBlocks.filter(b => b.type === 'section').map(b => ({
                    color: '#0066cc',
                    text: b.text?.text || b.fields?.map(f => f.text).join(' | '),
                    title: 'KhakiSol Daily Report'
                }))
            );
        }

        // Log to Notion
        if (this.status.notion) {
            await this.logToNotion(`Daily Report - ${date}`, JSON.stringify(reportData, null, 2));
        }

        return { sent: true, date };
    }

    // ─────────────────────────────────────────────────────────────
    // UTILITY METHODS
    // ─────────────────────────────────────────────────────────────

    async broadcastMessage(message) {
        const results = {};

        if (this.status.slack) {
            results.slack = await this.slack.sendMessage(process.env.SLACK_CHANNEL_ID, message);
        }

        return results;
    }

    async askOllama(question) {
        if (!this.status.ollama) {
            throw new Error('Ollama not connected');
        }

        return this.ollama.generate(question);
    }
}

// ─────────────────────────────────────────────────────────────────
// DEMO & TESTING
// ─────────────────────────────────────────────────────────────────

async function demo() {
    console.log('\n' + '═'.repeat(60));
    console.log('🎯 KHAKISOL INTEGRATION HUB');
    console.log('═'.repeat(60));

    const hub = new IntegrationHub();
    await hub.initialize();

    console.log('\n📊 Connection Status:');
    console.log(`   Notion: ${hub.status.notion ? '✅ Connected' : '⚠️ Not configured'}`);
    console.log(`   Slack:  ${hub.status.slack ? '✅ Connected' : '⚠️ Not configured'}`);
    console.log(`   Ollama: ${hub.status.ollama ? '✅ Connected' : '⚠️ Not running'}`);

    // Demo Ollama if connected
    if (hub.status.ollama) {
        console.log('\n🦙 Testing Local AI Analysis...');
        const analysis = await hub.analyzeWithLocalAI(
            'What are 3 tips to improve e-commerce sales during holiday season?'
        );
        
        if (analysis.response) {
            console.log('\n   AI Response:');
            const responseText = typeof analysis.response === 'string' 
                ? analysis.response 
                : JSON.stringify(analysis.response);
            console.log(responseText.split('\n').map(l => '   ' + l).join('\n'));
        }
    }

    console.log('\n' + '═'.repeat(60));
    console.log('✅ Integration Hub ready for use!');
    console.log('═'.repeat(60));

    return hub;
}

// Run demo if called directly
const isMainModule = import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`;
if (isMainModule) {
    demo().catch(console.error);
}

export default IntegrationHub;
