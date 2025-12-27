import 'dotenv/config';

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                 📊 NOTION DASHBOARD INTEGRATION                 ║
 * ║              Daily Metrics & Content Management                ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

class NotionDashboard {
    constructor() {
        this.apiKey = process.env.NOTION_API_KEY;
        this.metricsDatabaseId = process.env.NOTION_METRICS_DATABASE_ID;
        this.contentDatabaseId = process.env.NOTION_CONTENT_DATABASE_ID;
        this.baseUrl = 'https://api.notion.com/v1';
    }

    // ─────────────────────────────────────────────────────────────
    // DATABASE SETUP
    // ─────────────────────────────────────────────────────────────

    async createMetricsDatabase(parentPageId) {
        if (!this.apiKey) {
            throw new Error('NOTION_API_KEY not configured');
        }

        const databaseData = {
            parent: { page_id: parentPageId },
            title: [{ text: { content: 'KhakiSol Daily Metrics' } }],
            properties: {
                'Date': {
                    date: {}
                },
                'Sessions': {
                    number: { format: 'number' }
                },
                'Bounce Rate': {
                    number: { format: 'percent' }
                },
                'Add to Carts': {
                    number: { format: 'number' }
                },
                'Checkout Starts': {
                    number: { format: 'number' }
                },
                'Purchases': {
                    number: { format: 'number' }
                },
                'AOV': {
                    number: { format: 'dollar' }
                },
                'Site Speed (ms)': {
                    number: { format: 'number' }
                },
                '404 Errors': {
                    number: { format: 'number' }
                },
                'Failed Payments': {
                    number: { format: 'number' }
                },
                'Status': {
                    select: {
                        options: [
                            { name: '✅ Healthy', color: 'green' },
                            { name: '⚠️ Needs Attention', color: 'yellow' },
                            { name: '🔥 Critical', color: 'red' }
                        ]
                    }
                },
                'Alerts': {
                    number: { format: 'number' }
                },
                'Top Source': {
                    select: {
                        options: [
                            { name: 'Organic', color: 'blue' },
                            { name: 'Social', color: 'green' },
                            { name: 'Direct', color: 'gray' },
                            { name: 'Paid', color: 'purple' },
                            { name: 'Referral', color: 'orange' }
                        ]
                    }
                }
            }
        };

        const response = await fetch(`${this.baseUrl}/databases`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(databaseData)
        });

        if (!response.ok) {
            throw new Error(`Failed to create metrics database: ${response.status}`);
        }

        const result = await response.json();
        this.metricsDatabaseId = result.id;
        return result;
    }

    async createContentDatabase(parentPageId) {
        const databaseData = {
            parent: { page_id: parentPageId },
            title: [{ text: { content: 'KhakiSol Content Scheduler' } }],
            properties: {
                'Content Type': {
                    select: {
                        options: [
                            { name: '🎥 TikTok Reel', color: 'red' },
                            { name: '📸 Instagram Post', color: 'pink' },
                            { name: '📧 Email', color: 'blue' },
                            { name: '💬 Creator Outreach', color: 'green' },
                            { name: '📝 Blog Post', color: 'yellow' }
                        ]
                    }
                },
                'Title': {
                    title: {}
                },
                'Status': {
                    status: {
                        options: [
                            { name: '📝 Draft', color: 'gray' },
                            { name: '⏰ Scheduled', color: 'yellow' },
                            { name: '📤 Published', color: 'green' },
                            { name: '📊 Analyzing', color: 'blue' }
                        ]
                    }
                },
                'Publish Date': {
                    date: {}
                },
                'Platform': {
                    multi_select: {
                        options: [
                            { name: 'TikTok', color: 'red' },
                            { name: 'Instagram', color: 'pink' },
                            { name: 'Email', color: 'blue' },
                            { name: 'LinkedIn', color: 'blue' },
                            { name: 'Website', color: 'green' }
                        ]
                    }
                },
                'Target Audience': {
                    select: {
                        options: [
                            { name: '🎯 Tactical Enthusiasts', color: 'orange' },
                            { name: '🏔️ Outdoor Adventurers', color: 'green' },
                            { name: '👔 Professional Operators', color: 'blue' },
                            { name: '🛍️ General Shoppers', color: 'gray' }
                        ]
                    }
                },
                'Expected Reach': {
                    number: { format: 'number' }
                },
                'Performance': {
                    number: { format: 'number' }
                },
                'Notes': {
                    rich_text: {}
                }
            }
        };

        const response = await fetch(`${this.baseUrl}/databases`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(databaseData)
        });

        if (!response.ok) {
            throw new Error(`Failed to create content database: ${response.status}`);
        }

        const result = await response.json();
        this.contentDatabaseId = result.id;
        return result;
    }

    // ─────────────────────────────────────────────────────────────
    // METRICS TRACKING
    // ─────────────────────────────────────────────────────────────

    async addDailyMetrics(metricsData) {
        if (!this.metricsDatabaseId) {
            throw new Error('Metrics database not configured');
        }

        const pageData = {
            parent: { database_id: this.metricsDatabaseId },
            properties: {
                'Date': {
                    date: { start: metricsData.date }
                },
                'Sessions': {
                    number: metricsData.metrics.traffic.sessions
                },
                'Bounce Rate': {
                    number: metricsData.metrics.traffic.bounceRate
                },
                'Add to Carts': {
                    number: metricsData.metrics.commerce.addToCarts
                },
                'Checkout Starts': {
                    number: metricsData.metrics.commerce.checkoutStarts
                },
                'Purchases': {
                    number: metricsData.metrics.commerce.purchases
                },
                'AOV': {
                    number: metricsData.metrics.commerce.averageOrderValue
                },
                'Site Speed (ms)': {
                    number: metricsData.metrics.technical.siteSpeed
                },
                '404 Errors': {
                    number: metricsData.metrics.technical.errors.four04s
                },
                'Failed Payments': {
                    number: metricsData.metrics.technical.errors.failedPayments
                },
                'Status': {
                    select: {
                        name: this.getStatusName(metricsData.summary.status)
                    }
                },
                'Alerts': {
                    number: metricsData.alerts.length
                },
                'Top Source': {
                    select: {
                        name: this.getSourceName(metricsData.metrics.traffic.topSource)
                    }
                }
            },
            children: this.buildMetricsContent(metricsData)
        };

        const response = await fetch(`${this.baseUrl}/pages`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(pageData)
        });

        if (!response.ok) {
            throw new Error(`Failed to add metrics: ${response.status}`);
        }

        return await response.json();
    }

    buildMetricsContent(metricsData) {
        const blocks = [];

        // Key Insights
        blocks.push({
            object: 'block',
            type: 'heading_2',
            heading_2: {
                rich_text: [{ text: { content: '🎯 Key Insights' } }]
            }
        });

        metricsData.summary.keyInsights.forEach(insight => {
            blocks.push({
                object: 'block',
                type: 'paragraph',
                paragraph: {
                    rich_text: [{ text: { content: insight } }]
                }
            });
        });

        // Recommendations
        blocks.push({
            object: 'block',
            type: 'heading_2',
            heading_2: {
                rich_text: [{ text: { content: '💡 Recommendations' } }]
            }
        });

        metricsData.summary.recommendations.forEach(rec => {
            blocks.push({
                object: 'block',
                type: 'paragraph',
                paragraph: {
                    rich_text: [{ text: { content: rec } }]
                }
            });
        });

        // Alerts
        if (metricsData.alerts.length > 0) {
            blocks.push({
                object: 'block',
                type: 'heading_2',
                heading_2: {
                    rich_text: [{ text: { content: '🚨 Active Alerts' } }]
                }
            });

            metricsData.alerts.forEach(alert => {
                blocks.push({
                    object: 'block',
                    type: 'callout',
                    callout: {
                        rich_text: [{ text: { content: alert.message } }],
                        icon: { emoji: '⚠️' }
                    }
                });
            });
        }

        return blocks;
    }

    // ─────────────────────────────────────────────────────────────
    // CONTENT SCHEDULER
    // ─────────────────────────────────────────────────────────────

    async scheduleContent(contentData) {
        if (!this.contentDatabaseId) {
            throw new Error('Content database not configured');
        }

        const pageData = {
            parent: { database_id: this.contentDatabaseId },
            properties: {
                'Content Type': {
                    select: { name: contentData.type }
                },
                'Title': {
                    title: [{ text: { content: contentData.title } }]
                },
                'Status': {
                    status: { name: '⏰ Scheduled' }
                },
                'Publish Date': {
                    date: { start: contentData.publishDate }
                },
                'Platform': {
                    multi_select: contentData.platforms.map(p => ({ name: p }))
                },
                'Target Audience': {
                    select: { name: contentData.audience }
                },
                'Expected Reach': {
                    number: contentData.expectedReach
                },
                'Notes': {
                    rich_text: [{ text: { content: contentData.notes || '' } }]
                }
            }
        };

        const response = await fetch(`${this.baseUrl}/pages`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(pageData)
        });

        if (!response.ok) {
            throw new Error(`Failed to schedule content: ${response.status}`);
        }

        return await response.json();
    }

    async getTodaysContent() {
        if (!this.contentDatabaseId) {
            return [];
        }

        const today = new Date().toISOString().split('T')[0];

        const query = {
            filter: {
                and: [
                    {
                        property: 'Publish Date',
                        date: { equals: today }
                    },
                    {
                        property: 'Status',
                        status: { equals: '⏰ Scheduled' }
                    }
                ]
            }
        };

        const response = await fetch(`${this.baseUrl}/databases/${this.contentDatabaseId}/query`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(query)
        });

        if (!response.ok) {
            throw new Error(`Failed to get today's content: ${response.status}`);
        }

        const result = await response.json();
        return result.results;
    }

    async markContentPublished(contentId, performance = null) {
        const updateData = {
            properties: {
                'Status': {
                    status: { name: '📤 Published' }
                }
            }
        };

        if (performance !== null) {
            updateData.properties['Performance'] = { number: performance };
        }

        const response = await fetch(`${this.baseUrl}/pages/${contentId}`, {
            method: 'PATCH',
            headers: this.getHeaders(),
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            throw new Error(`Failed to mark content published: ${response.status}`);
        }

        return await response.json();
    }

    // ─────────────────────────────────────────────────────────────
    // UTILITIES
    // ─────────────────────────────────────────────────────────────

    getHeaders() {
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28'
        };
    }

    getStatusName(status) {
        switch (status) {
            case 'HEALTHY': return '✅ Healthy';
            case 'NEEDS_ATTENTION': return '⚠️ Needs Attention';
            case 'CRITICAL': return '🔥 Critical';
            default: return '⚠️ Needs Attention';
        }
    }

    getSourceName(source) {
        const sources = {
            'organic': 'Organic',
            'social': 'Social',
            'direct': 'Direct',
            'paid': 'Paid',
            'referral': 'Referral'
        };
        return sources[source] || 'Direct';
    }

    // ─────────────────────────────────────────────────────────────
    // SETUP WIZARD
    // ─────────────────────────────────────────────────────────────

    async setupDashboard() {
        console.log('🚀 Setting up KhakiSol Notion Dashboard...');

        // Check if Notion API is configured
        if (!this.apiKey || !process.env.NOTION_PARENT_PAGE_ID) {
            console.log('📝 Notion API not configured - running in mock mode');
            console.log('   Add NOTION_API_KEY and NOTION_PARENT_PAGE_ID to .env for full automation');
            return {
                mock: true,
                message: 'Notion dashboard will run in mock mode'
            };
        }

        try {
            // Create parent page
            const parentPage = await this.createParentPage();
            console.log('📄 Parent page created');

            // Create databases
            const metricsDb = await this.createMetricsDatabase(parentPage.id);
            const contentDb = await this.createContentDatabase(parentPage.id);
            console.log('🗄️ Databases created');

            // Create initial content schedule
            await this.createInitialContentSchedule();
            console.log('📅 Initial content schedule created');

            return {
                parentPageId: parentPage.id,
                metricsDatabaseId: metricsDb.id,
                contentDatabaseId: contentDb.id
            };

        } catch (error) {
            console.error('❌ Dashboard setup failed:', error.message);
            throw error;
        }
    }

    async createParentPage() {
        const pageData = {
            parent: { page_id: process.env.NOTION_PARENT_PAGE_ID || 'your-parent-page-id' },
            properties: {
                title: {
                    title: [{ text: { content: '🚀 KhakiSol Post-Launch OS' } }]
                }
            },
            children: [
                {
                    object: 'block',
                    type: 'heading_1',
                    heading_1: {
                        rich_text: [{ text: { content: 'KhakiSol Post-Launch Operating System' } }]
                    }
                },
                {
                    object: 'block',
                    type: 'paragraph',
                    paragraph: {
                        rich_text: [{ text: { content: 'Daily metrics, content scheduling, and growth tracking for the first 21 days post-launch.' } }]
                    }
                }
            ]
        };

        const response = await fetch(`${this.baseUrl}/pages`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(pageData)
        });

        if (!response.ok) {
            throw new Error(`Failed to create parent page: ${response.status}`);
        }

        return await response.json();
    }

    async createInitialContentSchedule() {
        const contentItems = [
            {
                type: '🎥 TikTok Reel',
                title: 'Desert Combat Boots Unboxing',
                publishDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
                platforms: ['TikTok'],
                audience: '🎯 Tactical Enthusiasts',
                expectedReach: 5000,
                notes: 'Show boots in action, highlight durability features'
            },
            {
                type: '📧 Email',
                title: 'Welcome to KhakiSol - Your First 10% Off',
                publishDate: new Date().toISOString().split('T')[0], // Today
                platforms: ['Email'],
                audience: '🛍️ General Shoppers',
                expectedReach: 100,
                notes: 'Welcome flow for new subscribers'
            },
            {
                type: '💬 Creator Outreach',
                title: 'Reach out to @tactical_gear_pro',
                publishDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Day after tomorrow
                platforms: ['Instagram', 'TikTok'],
                audience: '🎯 Tactical Enthusiasts',
                expectedReach: 15000,
                notes: 'Creator with 12k followers, focus on product reviews'
            }
        ];

        for (const item of contentItems) {
            await this.scheduleContent(item);
        }
    }
}

export default NotionDashboard;