import 'dotenv/config';
import https from 'https';

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                    💬 SLACK INTEGRATION                          ║
 * ║              Messaging & Notifications for KhakiSol              ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;

class SlackClient {
    constructor() {
        this.baseUrl = 'slack.com';
        this.headers = {
            'Authorization': `Bearer ${SLACK_BOT_TOKEN}`,
            'Content-Type': 'application/json'
        };
    }

    async makeRequest(path, method = 'POST', body = null) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: this.baseUrl,
                port: 443,
                path: path,
                method: method,
                headers: this.headers
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        if (json.ok === false) {
                            reject(new Error(`Slack API Error: ${json.error}`));
                        } else {
                            resolve(json);
                        }
                    } catch {
                        resolve(data);
                    }
                });
            });

            req.on('error', reject);
            if (body) req.write(JSON.stringify(body));
            req.end();
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // MESSAGE OPERATIONS
    // ═══════════════════════════════════════════════════════════════

    async postMessage(channel, text, blocks = null, attachments = null) {
        const body = { channel, text };
        if (blocks) body.blocks = blocks;
        if (attachments) body.attachments = attachments;
        
        return this.makeRequest('/api/chat.postMessage', 'POST', body);
    }

    async updateMessage(channel, ts, text, blocks = null) {
        const body = { channel, ts, text };
        if (blocks) body.blocks = blocks;
        
        return this.makeRequest('/api/chat.update', 'POST', body);
    }

    async deleteMessage(channel, ts) {
        return this.makeRequest('/api/chat.delete', 'POST', { channel, ts });
    }

    // ═══════════════════════════════════════════════════════════════
    // WEBHOOK MESSAGES (No token needed)
    // ═══════════════════════════════════════════════════════════════

    async sendWebhook(message) {
        if (!SLACK_WEBHOOK_URL) {
            throw new Error('SLACK_WEBHOOK_URL not configured');
        }

        const url = new URL(SLACK_WEBHOOK_URL);
        
        return new Promise((resolve, reject) => {
            const options = {
                hostname: url.hostname,
                port: 443,
                path: url.pathname,
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(data));
            });

            req.on('error', reject);
            req.write(JSON.stringify(message));
            req.end();
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // CHANNEL OPERATIONS
    // ═══════════════════════════════════════════════════════════════

    async listChannels() {
        return this.makeRequest('/api/conversations.list', 'POST', { 
            types: 'public_channel,private_channel' 
        });
    }

    async getChannelInfo(channelId) {
        return this.makeRequest('/api/conversations.info', 'POST', { channel: channelId });
    }

    async joinChannel(channelId) {
        return this.makeRequest('/api/conversations.join', 'POST', { channel: channelId });
    }

    // ═══════════════════════════════════════════════════════════════
    // USER OPERATIONS
    // ═══════════════════════════════════════════════════════════════

    async listUsers() {
        return this.makeRequest('/api/users.list', 'POST', {});
    }

    async getUserInfo(userId) {
        return this.makeRequest('/api/users.info', 'POST', { user: userId });
    }

    // ═══════════════════════════════════════════════════════════════
    // KHAKISOL NOTIFICATION TEMPLATES
    // ═══════════════════════════════════════════════════════════════

    // New order notification
    async notifyNewOrder(channel, orderData) {
        const blocks = [
            {
                type: 'header',
                text: { type: 'plain_text', text: '🛒 New Order Received!', emoji: true }
            },
            {
                type: 'section',
                fields: [
                    { type: 'mrkdwn', text: `*Order:*\n#${orderData.orderNumber}` },
                    { type: 'mrkdwn', text: `*Customer:*\n${orderData.customer}` },
                    { type: 'mrkdwn', text: `*Total:*\n$${orderData.total}` },
                    { type: 'mrkdwn', text: `*Items:*\n${orderData.itemCount}` }
                ]
            },
            {
                type: 'actions',
                elements: [
                    {
                        type: 'button',
                        text: { type: 'plain_text', text: 'View Order', emoji: true },
                        url: `https://admin.shopify.com/store/pygcet-kp/orders/${orderData.orderId}`,
                        style: 'primary'
                    }
                ]
            }
        ];

        return this.postMessage(channel, `New order #${orderData.orderNumber} - $${orderData.total}`, blocks);
    }

    // Low stock alert
    async notifyLowStock(channel, products) {
        const productList = products.map(p => `• ${p.name}: ${p.quantity} left`).join('\n');
        
        const blocks = [
            {
                type: 'header',
                text: { type: 'plain_text', text: '⚠️ Low Stock Alert', emoji: true }
            },
            {
                type: 'section',
                text: { type: 'mrkdwn', text: `*${products.length} products need attention:*\n${productList}` }
            },
            {
                type: 'actions',
                elements: [
                    {
                        type: 'button',
                        text: { type: 'plain_text', text: 'View Inventory', emoji: true },
                        url: 'https://admin.shopify.com/store/pygcet-kp/products/inventory',
                        style: 'danger'
                    }
                ]
            }
        ];

        return this.postMessage(channel, `⚠️ Low stock alert: ${products.length} products`, blocks);
    }

    // Daily summary
    async notifyDailySummary(channel, summaryData) {
        const blocks = [
            {
                type: 'header',
                text: { type: 'plain_text', text: '📊 Daily Summary - KhakiSol', emoji: true }
            },
            {
                type: 'section',
                fields: [
                    { type: 'mrkdwn', text: `*Orders Today:*\n${summaryData.orders}` },
                    { type: 'mrkdwn', text: `*Revenue:*\n$${summaryData.revenue}` },
                    { type: 'mrkdwn', text: `*New Customers:*\n${summaryData.newCustomers}` },
                    { type: 'mrkdwn', text: `*Inventory Value:*\n$${summaryData.inventoryValue}` }
                ]
            },
            {
                type: 'divider'
            },
            {
                type: 'section',
                text: { type: 'mrkdwn', text: `*AI Troopers Status:* ✅ 30 agents ready` }
            }
        ];

        return this.postMessage(channel, `📊 Daily Summary: ${summaryData.orders} orders, $${summaryData.revenue} revenue`, blocks);
    }

    // Customer inquiry
    async notifyCustomerInquiry(channel, inquiryData) {
        const blocks = [
            {
                type: 'header',
                text: { type: 'plain_text', text: '💬 New Customer Inquiry', emoji: true }
            },
            {
                type: 'section',
                text: { type: 'mrkdwn', text: `*From:* ${inquiryData.customer}\n*Subject:* ${inquiryData.subject}` }
            },
            {
                type: 'section',
                text: { type: 'mrkdwn', text: `"${inquiryData.message}"` }
            },
            {
                type: 'actions',
                elements: [
                    {
                        type: 'button',
                        text: { type: 'plain_text', text: 'Reply', emoji: true },
                        style: 'primary'
                    },
                    {
                        type: 'button',
                        text: { type: 'plain_text', text: 'Assign to Agent', emoji: true }
                    }
                ]
            }
        ];

        return this.postMessage(channel, `💬 New inquiry from ${inquiryData.customer}`, blocks);
    }

    // AI Trooper report
    async notifyTrooperReport(channel, reportData) {
        const blocks = [
            {
                type: 'header',
                text: { type: 'plain_text', text: '🎖️ AI Troopers Report', emoji: true }
            },
            {
                type: 'section',
                text: { type: 'mrkdwn', text: `*Squadron:* ${reportData.squadron}\n*Agent:* ${reportData.agent}` }
            },
            {
                type: 'section',
                text: { type: 'mrkdwn', text: reportData.summary }
            },
            {
                type: 'context',
                elements: [
                    { type: 'mrkdwn', text: `Completed at ${new Date().toLocaleTimeString()}` }
                ]
            }
        ];

        return this.postMessage(channel, `🎖️ ${reportData.agent} completed analysis`, blocks);
    }

    // Simple text notification
    async notify(channel, message, emoji = '📢') {
        return this.postMessage(channel, `${emoji} ${message}`);
    }

    // Test connection
    async testConnection() {
        try {
            const result = await this.makeRequest('/api/auth.test', 'POST', {});
            return { success: true, team: result.team, user: result.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

export default SlackClient;

// Test if running directly
if (process.argv[1].includes('slack')) {
    const slack = new SlackClient();
    
    console.log('\n' + '═'.repeat(50));
    console.log('💬 SLACK INTEGRATION TEST');
    console.log('═'.repeat(50));
    
    if (!SLACK_BOT_TOKEN || SLACK_BOT_TOKEN.includes('YOUR_')) {
        console.log('\n⚠️  Slack Bot Token not configured!');
        console.log('   Add SLACK_BOT_TOKEN to your .env file');
        console.log('   Create an app at: https://api.slack.com/apps');
        console.log('\n   Required scopes:');
        console.log('   - chat:write');
        console.log('   - channels:read');
        console.log('   - users:read');
    } else {
        slack.testConnection().then(result => {
            if (result.success) {
                console.log('\n✅ Connected to Slack!');
                console.log(`   Team: ${result.team}`);
                console.log(`   Bot User: ${result.user}`);
            } else {
                console.log('\n❌ Connection failed:', result.error);
            }
        });
    }
}
