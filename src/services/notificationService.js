import 'dotenv/config';
import SlackClient from '../integrations/slack.js';
import NotionClient from '../integrations/notion.js';

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                    🔔 NOTIFICATION SYSTEM                        ║
 * ║              Alert on Important Webhook Events                   ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

class NotificationService {
    constructor() {
        this.slack = new SlackClient();
        this.notion = new NotionClient();
        this.enabled = {
            slack: !!process.env.SLACK_BOT_TOKEN && !process.env.SLACK_BOT_TOKEN.includes('YOUR_'),
            notion: !!process.env.NOTION_API_KEY && !process.env.NOTION_API_KEY.includes('YOUR_')
        };

        // Notification rules
        this.rules = {
            'orders/create': { notify: true, priority: 'high', channels: ['slack'] },
            'orders/fulfilled': { notify: true, priority: 'normal', channels: ['slack'] },
            'orders/cancelled': { notify: true, priority: 'high', channels: ['slack'] },
            'inventory_levels/update': { notify: true, priority: 'low', channels: ['slack'], condition: 'lowStock' },
            'customers/create': { notify: true, priority: 'normal', channels: ['slack'] },
            'products/create': { notify: true, priority: 'normal', channels: ['slack'] },
            'products/delete': { notify: true, priority: 'high', channels: ['slack'] },
            'refunds/create': { notify: true, priority: 'high', channels: ['slack'] }
        };
    }

    // ─────────────────────────────────────────────────────────────
    // MAIN NOTIFICATION HANDLER
    // ─────────────────────────────────────────────────────────────

    async notify(topic, data, event) {
        const rule = this.rules[topic];
        if (!rule || !rule.notify) return null;

        // Check conditions
        if (rule.condition === 'lowStock') {
            const threshold = parseInt(process.env.LOW_STOCK_THRESHOLD) || 10;
            if (data.available > threshold) return null;
        }

        const results = {};

        // Send to configured channels
        if (rule.channels.includes('slack') && this.enabled.slack) {
            results.slack = await this.sendSlackNotification(topic, data, event, rule.priority);
        }

        if (rule.channels.includes('notion') && this.enabled.notion) {
            results.notion = await this.logToNotion(topic, data, event);
        }

        return results;
    }

    // ─────────────────────────────────────────────────────────────
    // SLACK NOTIFICATIONS
    // ─────────────────────────────────────────────────────────────

    async sendSlackNotification(topic, data, event, priority) {
        try {
            const message = this.formatSlackMessage(topic, data, event, priority);
            const channelId = process.env.SLACK_CHANNEL_ID || 'general';
            
            // Use postMessage with attachments, or sendWebhook if no bot token
            if (process.env.SLACK_BOT_TOKEN) {
                return await this.slack.postMessage(channelId, message.text, null, message.attachments);
            } else if (process.env.SLACK_WEBHOOK_URL) {
                return await this.slack.sendWebhook({ text: message.text, attachments: message.attachments });
            }
            return { error: 'No Slack credentials configured' };
        } catch (error) {
            console.error('Slack notification failed:', error.message);
            return { error: error.message };
        }
    }

    formatSlackMessage(topic, data, event, priority) {
        const colors = {
            high: '#ff0000',
            normal: '#36a64f',
            low: '#cccccc'
        };

        const icons = {
            'orders/create': '🛒',
            'orders/fulfilled': '✅',
            'orders/cancelled': '❌',
            'orders/updated': '📝',
            'inventory_levels/update': '📦',
            'customers/create': '👤',
            'products/create': '🆕',
            'products/update': '📝',
            'products/delete': '🗑️',
            'refunds/create': '💸'
        };

        const icon = icons[topic] || '📡';
        let title, text, fields = [];

        switch (topic) {
            case 'orders/create':
                title = `${icon} New Order #${data.order_number}`;
                text = `Customer: ${data.customer?.first_name || ''} ${data.customer?.last_name || data.email}`;
                fields = [
                    { title: 'Total', value: `${data.total_price} ${data.currency}`, short: true },
                    { title: 'Items', value: `${data.line_items?.length || 0}`, short: true }
                ];
                break;

            case 'orders/fulfilled':
                title = `${icon} Order Fulfilled #${data.order_number}`;
                text = `Tracking: ${data.fulfillments?.[0]?.tracking_number || 'N/A'}`;
                break;

            case 'orders/cancelled':
                title = `${icon} Order Cancelled #${data.order_number}`;
                text = `Reason: ${data.cancel_reason || 'Not specified'}`;
                fields = [
                    { title: 'Refund', value: data.refunds?.length ? 'Yes' : 'No', short: true }
                ];
                break;

            case 'inventory_levels/update':
                title = `${icon} Low Stock Alert`;
                text = `Inventory level: ${data.available} units`;
                fields = [
                    { title: 'Item ID', value: `${data.inventory_item_id}`, short: true },
                    { title: 'Available', value: `${data.available}`, short: true }
                ];
                break;

            case 'customers/create':
                title = `${icon} New Customer`;
                text = `${data.first_name || ''} ${data.last_name || ''} (${data.email})`;
                break;

            case 'products/create':
                title = `${icon} New Product Created`;
                text = data.title;
                fields = [
                    { title: 'Vendor', value: data.vendor || 'N/A', short: true },
                    { title: 'Variants', value: `${data.variants?.length || 0}`, short: true }
                ];
                break;

            case 'products/delete':
                title = `${icon} Product Deleted`;
                text = `Product ID: ${data.id}`;
                break;

            case 'refunds/create':
                title = `${icon} Refund Issued`;
                text = `Order #${data.order_id}`;
                fields = [
                    { title: 'Amount', value: data.transactions?.[0]?.amount || 'N/A', short: true }
                ];
                break;

            default:
                title = `${icon} ${topic}`;
                text = 'Webhook received';
        }

        return {
            text: title,
            attachments: [{
                color: colors[priority] || colors.normal,
                title,
                text,
                fields,
                footer: 'KhakiSol.com | Webhook Server',
                footer_icon: 'https://khakisol.com/favicon.ico',
                ts: Math.floor(Date.now() / 1000)
            }]
        };
    }

    // ─────────────────────────────────────────────────────────────
    // NOTION LOGGING
    // ─────────────────────────────────────────────────────────────

    async logToNotion(topic, data, event) {
        if (!process.env.NOTION_DATABASE_ID || process.env.NOTION_DATABASE_ID.includes('YOUR_')) {
            return null;
        }

        try {
            return await this.notion.createPage(process.env.NOTION_DATABASE_ID, {
                'Event': { title: [{ text: { content: topic } }] },
                'Type': { select: { name: event.type } },
                'Summary': { rich_text: [{ text: { content: this.getEventSummary(topic, data) } }] },
                'Date': { date: { start: new Date().toISOString() } }
            });
        } catch (error) {
            console.error('Notion logging failed:', error.message);
            return { error: error.message };
        }
    }

    getEventSummary(topic, data) {
        switch (topic) {
            case 'orders/create':
                return `Order #${data.order_number} - ${data.total_price} ${data.currency}`;
            case 'orders/fulfilled':
                return `Order #${data.order_number} fulfilled`;
            case 'orders/cancelled':
                return `Order #${data.order_number} cancelled`;
            case 'customers/create':
                return `${data.first_name || ''} ${data.last_name || ''} (${data.email})`;
            case 'products/create':
                return data.title;
            case 'inventory_levels/update':
                return `Stock: ${data.available} units`;
            default:
                return topic;
        }
    }

    // ─────────────────────────────────────────────────────────────
    // CONFIGURATION
    // ─────────────────────────────────────────────────────────────

    setRule(topic, config) {
        this.rules[topic] = { ...this.rules[topic], ...config };
    }

    getStatus() {
        return {
            slack: this.enabled.slack,
            notion: this.enabled.notion,
            rules: Object.entries(this.rules).map(([topic, rule]) => ({
                topic,
                enabled: rule.notify,
                priority: rule.priority,
                channels: rule.channels
            }))
        };
    }
}

// Singleton instance
const notificationService = new NotificationService();

export default notificationService;
