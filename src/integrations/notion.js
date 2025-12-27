import 'dotenv/config';
import https from 'https';

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                    📝 NOTION INTEGRATION                         ║
 * ║              Database & Page Management for KhakiSol             ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_VERSION = '2022-06-28';

class NotionClient {
    constructor() {
        this.baseUrl = 'api.notion.com';
        this.headers = {
            'Authorization': `Bearer ${NOTION_API_KEY}`,
            'Content-Type': 'application/json',
            'Notion-Version': NOTION_VERSION
        };
    }

    async makeRequest(path, method = 'GET', body = null) {
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
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(JSON.parse(data));
                    } else {
                        reject(new Error(`Notion API Error ${res.statusCode}: ${data}`));
                    }
                });
            });

            req.on('error', reject);
            if (body) req.write(JSON.stringify(body));
            req.end();
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // DATABASE OPERATIONS
    // ═══════════════════════════════════════════════════════════════

    async queryDatabase(databaseId, filter = null, sorts = null) {
        const body = {};
        if (filter) body.filter = filter;
        if (sorts) body.sorts = sorts;
        
        return this.makeRequest(`/v1/databases/${databaseId}/query`, 'POST', body);
    }

    async createDatabase(parentPageId, title, properties) {
        const body = {
            parent: { type: 'page_id', page_id: parentPageId },
            title: [{ type: 'text', text: { content: title } }],
            properties: properties
        };
        
        return this.makeRequest('/v1/databases', 'POST', body);
    }

    async getDatabase(databaseId) {
        return this.makeRequest(`/v1/databases/${databaseId}`);
    }

    // ═══════════════════════════════════════════════════════════════
    // PAGE OPERATIONS
    // ═══════════════════════════════════════════════════════════════

    async createPage(parentId, properties, children = [], isDatabase = true) {
        const body = {
            parent: isDatabase 
                ? { database_id: parentId }
                : { page_id: parentId },
            properties: properties
        };
        
        if (children.length > 0) {
            body.children = children;
        }
        
        return this.makeRequest('/v1/pages', 'POST', body);
    }

    async getPage(pageId) {
        return this.makeRequest(`/v1/pages/${pageId}`);
    }

    async updatePage(pageId, properties) {
        return this.makeRequest(`/v1/pages/${pageId}`, 'PATCH', { properties });
    }

    async archivePage(pageId) {
        return this.makeRequest(`/v1/pages/${pageId}`, 'PATCH', { archived: true });
    }

    // ═══════════════════════════════════════════════════════════════
    // BLOCK OPERATIONS
    // ═══════════════════════════════════════════════════════════════

    async getBlockChildren(blockId) {
        return this.makeRequest(`/v1/blocks/${blockId}/children`);
    }

    async appendBlockChildren(blockId, children) {
        return this.makeRequest(`/v1/blocks/${blockId}/children`, 'PATCH', { children });
    }

    // ═══════════════════════════════════════════════════════════════
    // SEARCH
    // ═══════════════════════════════════════════════════════════════

    async search(query, filter = null) {
        const body = { query };
        if (filter) body.filter = filter;
        
        return this.makeRequest('/v1/search', 'POST', body);
    }

    // ═══════════════════════════════════════════════════════════════
    // KHAKISOL SPECIFIC HELPERS
    // ═══════════════════════════════════════════════════════════════

    // Create an order tracking entry
    async createOrderEntry(databaseId, orderData) {
        const properties = {
            'Order Number': { title: [{ text: { content: orderData.orderNumber } }] },
            'Customer': { rich_text: [{ text: { content: orderData.customer } }] },
            'Total': { number: orderData.total },
            'Status': { select: { name: orderData.status || 'Pending' } },
            'Date': { date: { start: orderData.date || new Date().toISOString() } }
        };
        
        return this.createPage(databaseId, properties);
    }

    // Create a task entry
    async createTask(databaseId, taskData) {
        const properties = {
            'Task': { title: [{ text: { content: taskData.title } }] },
            'Description': { rich_text: [{ text: { content: taskData.description || '' } }] },
            'Priority': { select: { name: taskData.priority || 'Medium' } },
            'Status': { select: { name: taskData.status || 'To Do' } },
            'Due Date': taskData.dueDate ? { date: { start: taskData.dueDate } } : undefined
        };
        
        // Remove undefined properties
        Object.keys(properties).forEach(key => 
            properties[key] === undefined && delete properties[key]
        );
        
        return this.createPage(databaseId, properties);
    }

    // Create inventory alert
    async createInventoryAlert(databaseId, alertData) {
        const properties = {
            'Product': { title: [{ text: { content: alertData.product } }] },
            'Current Stock': { number: alertData.currentStock },
            'Threshold': { number: alertData.threshold || 10 },
            'Alert Type': { select: { name: alertData.type || 'Low Stock' } },
            'Created': { date: { start: new Date().toISOString() } }
        };
        
        return this.createPage(databaseId, properties);
    }

    // Create daily report page
    async createDailyReport(parentPageId, reportData) {
        const today = new Date().toISOString().split('T')[0];
        
        const properties = {
            'title': { title: [{ text: { content: `Daily Report - ${today}` } }] }
        };
        
        const children = [
            {
                object: 'block',
                type: 'heading_1',
                heading_1: {
                    rich_text: [{ type: 'text', text: { content: '📊 KhakiSol Daily Report' } }]
                }
            },
            {
                object: 'block',
                type: 'paragraph',
                paragraph: {
                    rich_text: [{ type: 'text', text: { content: `Generated: ${new Date().toLocaleString()}` } }]
                }
            },
            {
                object: 'block',
                type: 'heading_2',
                heading_2: {
                    rich_text: [{ type: 'text', text: { content: '📦 Inventory Status' } }]
                }
            },
            {
                object: 'block',
                type: 'bulleted_list_item',
                bulleted_list_item: {
                    rich_text: [{ type: 'text', text: { content: `Total Products: ${reportData.totalProducts || 0}` } }]
                }
            },
            {
                object: 'block',
                type: 'bulleted_list_item',
                bulleted_list_item: {
                    rich_text: [{ type: 'text', text: { content: `Inventory Value: $${reportData.inventoryValue || 0}` } }]
                }
            },
            {
                object: 'block',
                type: 'heading_2',
                heading_2: {
                    rich_text: [{ type: 'text', text: { content: '💰 Sales Summary' } }]
                }
            },
            {
                object: 'block',
                type: 'bulleted_list_item',
                bulleted_list_item: {
                    rich_text: [{ type: 'text', text: { content: `Orders: ${reportData.orders || 0}` } }]
                }
            },
            {
                object: 'block',
                type: 'bulleted_list_item',
                bulleted_list_item: {
                    rich_text: [{ type: 'text', text: { content: `Revenue: $${reportData.revenue || 0}` } }]
                }
            }
        ];
        
        return this.createPage(parentPageId, properties, children, false);
    }

    // Test connection
    async testConnection() {
        try {
            const result = await this.makeRequest('/v1/users/me');
            return { success: true, user: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

export default NotionClient;

// Test if running directly
if (process.argv[1].includes('notion')) {
    const notion = new NotionClient();
    
    console.log('\n' + '═'.repeat(50));
    console.log('📝 NOTION INTEGRATION TEST');
    console.log('═'.repeat(50));
    
    if (!NOTION_API_KEY || NOTION_API_KEY.includes('YOUR_')) {
        console.log('\n⚠️  Notion API key not configured!');
        console.log('   Add NOTION_API_KEY to your .env file');
        console.log('   Get your key at: https://www.notion.so/my-integrations');
    } else {
        notion.testConnection().then(result => {
            if (result.success) {
                console.log('\n✅ Connected to Notion!');
                console.log(`   User: ${result.user.name || result.user.id}`);
            } else {
                console.log('\n❌ Connection failed:', result.error);
            }
        });
    }
}
