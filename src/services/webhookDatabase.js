import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                    📊 WEBHOOK DATABASE                           ║
 * ║              Track & Store All Incoming Events                   ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

const DB_PATH = path.join(__dirname, '../../data/webhooks.json');

class WebhookDatabase {
    constructor() {
        this.events = [];
        this.stats = {
            total: 0,
            byType: {},
            byHour: {},
            lastUpdated: null
        };
        this.load();
    }

    // ─────────────────────────────────────────────────────────────
    // PERSISTENCE
    // ─────────────────────────────────────────────────────────────

    load() {
        try {
            if (fs.existsSync(DB_PATH)) {
                const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
                this.events = data.events || [];
                this.stats = data.stats || this.stats;
                console.log(`📊 Loaded ${this.events.length} webhook events from database`);
            }
        } catch (error) {
            console.error('Failed to load webhook database:', error.message);
        }
    }

    save() {
        try {
            const dir = path.dirname(DB_PATH);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(DB_PATH, JSON.stringify({
                events: this.events.slice(-1000), // Keep last 1000 events
                stats: this.stats
            }, null, 2));
        } catch (error) {
            console.error('Failed to save webhook database:', error.message);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // EVENT TRACKING
    // ─────────────────────────────────────────────────────────────

    addEvent(type, topic, data) {
        const event = {
            id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,           // 'order', 'product', 'inventory', 'customer'
            topic,          // 'orders/create', 'products/update', etc.
            timestamp: new Date().toISOString(),
            data: this.extractKeyData(type, data),
            raw: data
        };

        this.events.push(event);
        this.updateStats(event);
        this.save();

        return event;
    }

    extractKeyData(type, data) {
        switch (type) {
            case 'order':
                return {
                    orderNumber: data.order_number,
                    customer: data.customer ? `${data.customer.first_name} ${data.customer.last_name}` : data.email,
                    email: data.email,
                    total: data.total_price,
                    currency: data.currency,
                    itemCount: data.line_items?.length || 0,
                    status: data.financial_status,
                    fulfillment: data.fulfillment_status || 'unfulfilled'
                };
            case 'product':
                return {
                    productId: data.id,
                    title: data.title,
                    vendor: data.vendor,
                    status: data.status,
                    variants: data.variants?.length || 0
                };
            case 'inventory':
                return {
                    inventoryItemId: data.inventory_item_id,
                    locationId: data.location_id,
                    available: data.available,
                    updatedAt: data.updated_at
                };
            case 'customer':
                return {
                    customerId: data.id,
                    name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
                    email: data.email,
                    ordersCount: data.orders_count,
                    totalSpent: data.total_spent
                };
            default:
                return { summary: 'Unknown event type' };
        }
    }

    updateStats(event) {
        this.stats.total++;
        this.stats.lastUpdated = event.timestamp;

        // Count by type
        if (!this.stats.byType[event.topic]) {
            this.stats.byType[event.topic] = 0;
        }
        this.stats.byType[event.topic]++;

        // Count by hour
        const hour = new Date(event.timestamp).toISOString().slice(0, 13);
        if (!this.stats.byHour[hour]) {
            this.stats.byHour[hour] = 0;
        }
        this.stats.byHour[hour]++;

        // Keep only last 24 hours of hourly stats
        const hours = Object.keys(this.stats.byHour).sort();
        if (hours.length > 24) {
            delete this.stats.byHour[hours[0]];
        }
    }

    // ─────────────────────────────────────────────────────────────
    // QUERIES
    // ─────────────────────────────────────────────────────────────

    getEvents(options = {}) {
        let events = [...this.events];
        
        if (options.type) {
            events = events.filter(e => e.type === options.type);
        }
        if (options.topic) {
            events = events.filter(e => e.topic === options.topic);
        }
        if (options.since) {
            events = events.filter(e => new Date(e.timestamp) >= new Date(options.since));
        }
        if (options.limit) {
            events = events.slice(-options.limit);
        }

        return events.reverse(); // Newest first
    }

    getRecentEvents(limit = 20) {
        return this.getEvents({ limit });
    }

    getEventsByType(type, limit = 50) {
        return this.getEvents({ type, limit });
    }

    getStats() {
        return {
            ...this.stats,
            recentActivity: this.getRecentEvents(5).map(e => ({
                topic: e.topic,
                time: e.timestamp,
                summary: this.getEventSummary(e)
            }))
        };
    }

    getEventSummary(event) {
        switch (event.type) {
            case 'order':
                return `Order #${event.data.orderNumber} - ${event.data.total} ${event.data.currency}`;
            case 'product':
                return `${event.data.title}`;
            case 'inventory':
                return `Stock: ${event.data.available} units`;
            case 'customer':
                return `${event.data.name || event.data.email}`;
            default:
                return event.topic;
        }
    }

    // ─────────────────────────────────────────────────────────────
    // ANALYTICS
    // ─────────────────────────────────────────────────────────────

    getOrderStats() {
        const orderEvents = this.events.filter(e => e.type === 'order');
        const totals = orderEvents
            .filter(e => e.topic === 'orders/create')
            .reduce((acc, e) => {
                acc.count++;
                acc.revenue += parseFloat(e.data.total || 0);
                acc.items += e.data.itemCount || 0;
                return acc;
            }, { count: 0, revenue: 0, items: 0 });

        return {
            totalOrders: totals.count,
            totalRevenue: totals.revenue.toFixed(2),
            totalItems: totals.items,
            fulfilled: orderEvents.filter(e => e.topic === 'orders/fulfilled').length,
            cancelled: orderEvents.filter(e => e.topic === 'orders/cancelled').length
        };
    }

    getTodayStats() {
        const today = new Date().toISOString().slice(0, 10);
        const todayEvents = this.events.filter(e => e.timestamp.startsWith(today));

        return {
            date: today,
            total: todayEvents.length,
            orders: todayEvents.filter(e => e.type === 'order').length,
            products: todayEvents.filter(e => e.type === 'product').length,
            inventory: todayEvents.filter(e => e.type === 'inventory').length,
            customers: todayEvents.filter(e => e.type === 'customer').length
        };
    }

    clear() {
        this.events = [];
        this.stats = {
            total: 0,
            byType: {},
            byHour: {},
            lastUpdated: null
        };
        this.save();
    }

    getSummary() {
        const today = this.getTodayStats();
        return {
            totalEvents: this.stats.total,
            todayEvents: today.total,
            byTopic: this.stats.byType,
            lastUpdated: this.stats.lastUpdated,
            todayBreakdown: {
                orders: today.orders,
                products: today.products,
                inventory: today.inventory,
                customers: today.customers
            }
        };
    }

    query(options = {}) {
        return this.getEvents(options);
    }
}

// Singleton instance
const webhookDB = new WebhookDatabase();

export default webhookDB;
