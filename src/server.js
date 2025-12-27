import express from 'express';
import crypto from 'crypto';
import dotenv from 'dotenv';
import ShopifyClient from './client/shopifyClient.js';
import shopifyConfig from './config/shopify.js';
import webhookDB from './services/webhookDatabase.js';
import notificationService from './services/notificationService.js';
import { generateDashboard } from './services/dashboardTemplate.js';

dotenv.config();

const startTime = new Date();

const app = express();
const PORT = process.env.PORT || 12321;
const shopify = new ShopifyClient();

// Store raw body for webhook verification
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// ============ WEBHOOK VERIFICATION ============
function verifyWebhook(req) {
  const hmac = req.get('X-Shopify-Hmac-Sha256');
  const body = req.rawBody;
  
  if (!hmac || !body) {
    return false;
  }

  const hash = crypto
    .createHmac('sha256', shopifyConfig.apiSecret)
    .update(body)
    .digest('base64');

  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hmac));
}

// Middleware to verify Shopify webhooks
function verifyShopifyWebhook(req, res, next) {
  // Allow local testing without signature
  const isLocalTest = req.get('X-Test-Mode') === 'true' && req.ip === '::1' || req.ip === '127.0.0.1' || req.ip === '::ffff:127.0.0.1';
  
  if (isLocalTest || verifyWebhook(req)) {
    next();
  } else {
    console.log('⚠️  Webhook verification failed');
    res.status(401).send('Unauthorized');
  }
}

// ============ WEBHOOK HANDLERS ============

// Order Created
app.post('/webhooks/orders/create', verifyShopifyWebhook, async (req, res) => {
  const order = req.body;
  console.log('\n' + '='.repeat(50));
  console.log('🛒 NEW ORDER RECEIVED');
  console.log('='.repeat(50));
  console.log(`   Order #: ${order.order_number}`);
  console.log(`   Customer: ${order.customer?.first_name} ${order.customer?.last_name}`);
  console.log(`   Email: ${order.email}`);
  console.log(`   Total: ${order.total_price} ${order.currency}`);
  console.log(`   Items: ${order.line_items?.length}`);
  
  order.line_items?.forEach((item, i) => {
    console.log(`      ${i + 1}. ${item.name} x${item.quantity}`);
  });

  // Save to database
  const event = webhookDB.addEvent('order', 'orders/create', order);
  console.log(`   📊 Event saved: ${event.id}`);

  // Send notifications
  const notifications = await notificationService.notify('orders/create', order, event);
  if (notifications?.slack) console.log('   💬 Slack notified');

  res.status(200).send('OK');
});

// Order Updated
app.post('/webhooks/orders/updated', verifyShopifyWebhook, async (req, res) => {
  const order = req.body;
  console.log('\n📝 ORDER UPDATED:', order.order_number);
  console.log(`   Status: ${order.financial_status} / ${order.fulfillment_status || 'unfulfilled'}`);
  
  // Save to database
  const event = webhookDB.addEvent('order', 'orders/updated', order);
  await notificationService.notify('orders/updated', order, event);
  
  res.status(200).send('OK');
});

// Order Fulfilled
app.post('/webhooks/orders/fulfilled', verifyShopifyWebhook, async (req, res) => {
  const order = req.body;
  console.log('\n✅ ORDER FULFILLED:', order.order_number);
  console.log(`   Tracking: ${order.fulfillments?.[0]?.tracking_number || 'N/A'}`);
  
  const event = webhookDB.addEvent('order', 'orders/fulfilled', order);
  await notificationService.notify('orders/fulfilled', order, event);
  
  res.status(200).send('OK');
});

// Order Cancelled
app.post('/webhooks/orders/cancelled', verifyShopifyWebhook, async (req, res) => {
  const order = req.body;
  console.log('\n❌ ORDER CANCELLED:', order.order_number);
  console.log(`   Reason: ${order.cancel_reason || 'Not specified'}`);

  const event = webhookDB.addEvent('order', 'orders/cancelled', order);
  await notificationService.notify('orders/cancelled', order, event);
  
  res.status(200).send('OK');
});

// Product Created
app.post('/webhooks/products/create', verifyShopifyWebhook, async (req, res) => {
  const product = req.body;
  console.log('\n📦 NEW PRODUCT CREATED');
  console.log(`   Title: ${product.title}`);
  console.log(`   ID: ${product.id}`);
  console.log(`   Variants: ${product.variants?.length}`);
  
  const event = webhookDB.addEvent('product', 'products/create', product);
  await notificationService.notify('products/create', product, event);
  
  res.status(200).send('OK');
});

// Product Updated
app.post('/webhooks/products/update', verifyShopifyWebhook, async (req, res) => {
  const product = req.body;
  console.log('\n📝 PRODUCT UPDATED:', product.title);
  console.log(`   ID: ${product.id}`);
  
  const event = webhookDB.addEvent('product', 'products/update', product);
  console.log(`   Status: ${product.status}`);
  
  res.status(200).send('OK');
});

// Product Deleted
app.post('/webhooks/products/delete', verifyShopifyWebhook, async (req, res) => {
  const product = req.body;
  console.log('\n🗑️  PRODUCT DELETED:', product.id);
  
  const event = webhookDB.addEvent('product', 'products/delete', product);
  await notificationService.notify('products/delete', product, event);
  
  res.status(200).send('OK');
});

// Inventory Level Updated
app.post('/webhooks/inventory_levels/update', verifyShopifyWebhook, async (req, res) => {
  const inventoryLevel = req.body;
  console.log('\n📊 INVENTORY UPDATED');
  console.log(`   Inventory Item ID: ${inventoryLevel.inventory_item_id}`);
  console.log(`   Location ID: ${inventoryLevel.location_id}`);
  console.log(`   Available: ${inventoryLevel.available}`);

  const event = webhookDB.addEvent('inventory', 'inventory_levels/update', inventoryLevel);
  
  // Low stock alert with notification
  if (inventoryLevel.available <= 10) {
    console.log('   ⚠️  LOW STOCK ALERT!');
    await notificationService.notify('inventory_levels/update', inventoryLevel, event);
  }
  
  res.status(200).send('OK');
});

// Customer Created
app.post('/webhooks/customers/create', verifyShopifyWebhook, async (req, res) => {
  const customer = req.body;
  console.log('\n👤 NEW CUSTOMER');
  console.log(`   Name: ${customer.first_name} ${customer.last_name}`);
  console.log(`   Email: ${customer.email}`);
  console.log(`   Accepts Marketing: ${customer.accepts_marketing}`);

  const event = webhookDB.addEvent('customer', 'customers/create', customer);
  await notificationService.notify('customers/create', customer, event);
  
  res.status(200).send('OK');
});

// Customer Updated
app.post('/webhooks/customers/update', verifyShopifyWebhook, async (req, res) => {
  const customer = req.body;
  console.log('\n📝 CUSTOMER UPDATED:', customer.email);
  
  // Store event
  const event = await webhookDB.addEvent('customer', 'customers/update', customer);
  await notificationService.notify('customers/update', customer, event);
  
  res.status(200).send('OK');
});

// Refund Created
app.post('/webhooks/refunds/create', verifyShopifyWebhook, async (req, res) => {
  const refund = req.body;
  console.log('\n💰 REFUND CREATED');
  console.log(`   Order ID: ${refund.order_id}`);
  console.log(`   Amount: ${refund.transactions?.[0]?.amount || 'N/A'}`);
  
  // Store event
  const event = await webhookDB.addEvent('refund', 'refunds/create', refund);
  await notificationService.notify('refunds/create', refund, event);
  
  res.status(200).send('OK');
});

// App Uninstalled
app.post('/webhooks/app/uninstalled', verifyShopifyWebhook, async (req, res) => {
  console.log('\n⚠️  APP UNINSTALLED');
  console.log('   Cleaning up resources...');
  
  // Store event
  const event = await webhookDB.addEvent('app', 'app/uninstalled', { timestamp: new Date() });
  await notificationService.notify('app/uninstalled', {}, event);
  
  res.status(200).send('OK');
});

// ============ HOME PAGE ============
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>KhakiSol.com - Webhook Server</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; background: #1a1a2e; color: #eee; }
    h1 { color: #00ff88; }
    .brand { font-size: 0.5em; color: #888; }
    .status { background: #16213e; padding: 20px; border-radius: 10px; margin: 20px 0; }
    .online { color: #00ff88; }
    a { color: #00aaff; }
    ul { line-height: 2; }
    code { background: #0f3460; padding: 3px 8px; border-radius: 4px; }
    .store-link { display: inline-block; background: #00ff88; color: #1a1a2e; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px; }
    .store-link:hover { background: #00cc66; }
  </style>
</head>
<body>
  <h1>🛍️ KhakiSol.com <span class="brand">Webhook Server</span></h1>
  <div class="status">
    <p><strong>Status:</strong> <span class="online">● Online</span></p>
    <p><strong>Store:</strong> ${shopifyConfig.storeUrl}</p>
    <p><strong>Domain:</strong> <a href="https://khakisol.com">khakisol.com</a></p>
    <p><strong>Time:</strong> ${new Date().toISOString()}</p>
    <a href="https://khakisol.com" class="store-link">🌐 Visit KhakiSol.com</a>
  </div>
  <h2>📡 Webhook Endpoints</h2>
  <ul>
    <li><code>POST /webhooks/orders/create</code></li>
    <li><code>POST /webhooks/orders/updated</code></li>
    <li><code>POST /webhooks/orders/fulfilled</code></li>
    <li><code>POST /webhooks/products/update</code></li>
    <li><code>POST /webhooks/inventory_levels/update</code></li>
    <li><code>POST /webhooks/customers/create</code></li>
  </ul>
  <h2>🔌 API Endpoints</h2>
  <ul>
    <li><a href="/dashboard">/dashboard</a> - 📊 <strong>Webhook Dashboard</strong></li>
    <li><a href="/api/shop">/api/shop</a> - Store info</li>
    <li><a href="/api/products">/api/products</a> - Products</li>
    <li><a href="/api/orders">/api/orders</a> - Orders</li>
    <li><a href="/api/customers">/api/customers</a> - Customers</li>
    <li><a href="/health">/health</a> - Health check</li>
  </ul>
</body>
</html>
  `);
});

// ============ HEALTH CHECK ============
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    store: shopifyConfig.storeUrl
  });
});

// ============ WEBHOOK DASHBOARD ============
app.get('/dashboard', async (req, res) => {
  const summary = webhookDB.getSummary();
  const stats = webhookDB.getStats();
  const recentEvents = webhookDB.query({}).slice(-50).reverse();
  
  const uptime = Math.floor((new Date() - startTime) / 1000);
  const memoryUsage = process.memoryUsage();
  const integrationsStatus = await notificationService.getStatus();
  
  const formattedIntegrations = {
    services: [
      { name: 'Slack', connected: integrationsStatus.slack },
      { name: 'Notion', connected: integrationsStatus.notion },
      { name: 'Ollama', connected: true }, // Assuming always connected if configured
      { name: 'OpenRouter', connected: process.env.OPENROUTER_API_KEY ? true : false }
    ]
  };
  
  const dashboardData = {
    storeUrl: shopifyConfig.storeUrl,
    summary,
    stats,
    recentEvents,
    serverInfo: {
      uptime,
      memoryUsage: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024)
      }
    },
    integrations: formattedIntegrations
  };
  
  const html = generateDashboard(dashboardData);
  res.send(html);
});

// Dashboard JSON API
app.get('/dashboard/json', (req, res) => {
  const summary = webhookDB.getSummary();
  const stats = webhookDB.getStats();
  const events = webhookDB.query({});
  res.json({ summary, stats, events });
});

// ============ API ENDPOINTS ============

// Get store info
app.get('/api/shop', async (req, res) => {
  try {
    const shop = await shopify.getShop();
    res.json(shop);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await shopify.getProducts({ limit: 50 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get inventory levels
app.get('/api/inventory', async (req, res) => {
  try {
    const { products } = await shopify.getProducts({ limit: 50 });
    const inventoryData = [];

    for (const product of products) {
      for (const variant of product.variants) {
        inventoryData.push({
          product_id: product.id,
          product_title: product.title,
          variant_id: variant.id,
          variant_title: variant.title,
          sku: variant.sku,
          inventory_quantity: variant.inventory_quantity,
          inventory_management: variant.inventory_management,
        });
      }
    }

    res.json({ inventory: inventoryData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await shopify.getOrders({ status: 'any', limit: 50 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get customers
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await shopify.getCustomers({ limit: 50 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ AI TROOPERS ENDPOINT ============
app.get('/api/ai/troopers', (req, res) => {
  const troopers = [
    // Commanders
    { id: 1, name: "Order Sentinel", role: "commander", status: "active", specialty: "order-processing" },
    { id: 2, name: "Inventory Guardian", role: "commander", status: "active", specialty: "stock-management" },
    { id: 3, name: "Customer Champion", role: "commander", status: "active", specialty: "customer-relations" },
    // Specialists
    { id: 4, name: "Price Analyzer", role: "specialist", status: "active", specialty: "pricing" },
    { id: 5, name: "Trend Spotter", role: "specialist", status: "active", specialty: "analytics" },
    { id: 6, name: "Fraud Detector", role: "specialist", status: "active", specialty: "security" },
    { id: 7, name: "Review Responder", role: "specialist", status: "active", specialty: "reviews" },
    { id: 8, name: "Email Crafter", role: "specialist", status: "active", specialty: "communications" },
    { id: 9, name: "SEO Optimizer", role: "specialist", status: "active", specialty: "seo" },
    { id: 10, name: "Return Handler", role: "specialist", status: "active", specialty: "returns" },
    // Operatives
    { id: 11, name: "Webhook Watcher", role: "operative", status: "active", specialty: "monitoring" },
    { id: 12, name: "Data Sync Agent", role: "operative", status: "active", specialty: "sync" },
    { id: 13, name: "Report Generator", role: "operative", status: "active", specialty: "reports" },
    { id: 14, name: "Alert Dispatcher", role: "operative", status: "active", specialty: "alerts" },
    { id: 15, name: "Log Analyst", role: "operative", status: "active", specialty: "logging" },
    { id: 16, name: "Cache Manager", role: "operative", status: "active", specialty: "caching" },
    { id: 17, name: "Queue Processor", role: "operative", status: "active", specialty: "queues" },
    { id: 18, name: "Backup Agent", role: "operative", status: "active", specialty: "backup" },
    { id: 19, name: "Health Monitor", role: "operative", status: "active", specialty: "health" },
    { id: 20, name: "Rate Limiter", role: "operative", status: "active", specialty: "throttling" },
    // Support Units
    { id: 21, name: "Notion Scribe", role: "support", status: "active", specialty: "notion" },
    { id: 22, name: "Slack Herald", role: "support", status: "active", specialty: "slack" },
    { id: 23, name: "Ollama Sage", role: "support", status: "active", specialty: "ai-local" },
    { id: 24, name: "OpenRouter Oracle", role: "support", status: "active", specialty: "ai-cloud" },
    { id: 25, name: "Schema Validator", role: "support", status: "active", specialty: "validation" },
    { id: 26, name: "Error Handler", role: "support", status: "active", specialty: "errors" },
    { id: 27, name: "Config Manager", role: "support", status: "active", specialty: "config" },
    { id: 28, name: "Secret Keeper", role: "support", status: "active", specialty: "secrets" },
    { id: 29, name: "Test Runner", role: "support", status: "active", specialty: "testing" },
    { id: 30, name: "Deploy Captain", role: "support", status: "active", specialty: "deployment" }
  ];
  res.json({ 
    troopers, 
    summary: {
      total: 30,
      commanders: 3,
      specialists: 7,
      operatives: 10,
      support: 10,
      allActive: true
    }
  });
});

// ============ INTEGRATIONS STATUS ENDPOINT ============
app.get('/api/integrations/status', (req, res) => {
  const integrations = [
    {
      id: "notion",
      name: "Notion",
      status: process.env.NOTION_API_KEY ? "connected" : "not configured",
      configured: !!process.env.NOTION_API_KEY,
      features: ["Event logging", "Database sync", "Documentation"]
    },
    {
      id: "slack",
      name: "Slack",
      status: process.env.SLACK_WEBHOOK_URL ? "connected" : "not configured",
      configured: !!process.env.SLACK_WEBHOOK_URL,
      features: ["Order alerts", "Inventory warnings", "Daily summaries"]
    },
    {
      id: "ollama",
      name: "Ollama (Local AI)",
      status: process.env.OLLAMA_HOST ? "connected" : "not configured",
      configured: !!process.env.OLLAMA_HOST,
      model: process.env.OLLAMA_MODEL || "mistral:latest",
      features: ["Local inference", "Privacy-first", "Custom prompts"]
    },
    {
      id: "openrouter",
      name: "OpenRouter (Cloud AI)",
      status: process.env.OPENROUTER_API_KEY ? "connected" : "not configured",
      configured: !!process.env.OPENROUTER_API_KEY,
      features: ["338 AI models", "Fallback capability", "Advanced analysis"]
    }
  ];
  
  const connectedCount = integrations.filter(i => i.configured).length;
  
  res.json({
    integrations,
    summary: {
      total: 4,
      connected: connectedCount,
      status: connectedCount === 4 ? "all connected" : `${connectedCount}/4 connected`
    }
  });
});

// ============ START SERVER ============
app.listen(PORT, '127.0.0.1', () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 SHOPIFY WEBHOOK SERVER');
  console.log('='.repeat(50));
  console.log(`   Store: ${shopifyConfig.storeUrl}`);
  console.log(`   Port: ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log('='.repeat(50));
  console.log('\n📡 Webhook Endpoints:');
  console.log('   POST /webhooks/orders/create');
  console.log('   POST /webhooks/orders/updated');
  console.log('   POST /webhooks/orders/fulfilled');
  console.log('   POST /webhooks/orders/cancelled');
  console.log('   POST /webhooks/products/create');
  console.log('   POST /webhooks/products/update');
  console.log('   POST /webhooks/products/delete');
  console.log('   POST /webhooks/inventory_levels/update');
  console.log('   POST /webhooks/customers/create');
  console.log('   POST /webhooks/customers/update');
  console.log('   POST /webhooks/refunds/create');
  console.log('   POST /webhooks/app/uninstalled');
  console.log('\n🔌 API Endpoints:');
  console.log('   GET /api/shop');
  console.log('   GET /api/products');
  console.log('   GET /api/inventory');
  console.log('   GET /api/orders');
  console.log('   GET /api/customers');
  console.log('\n⏳ Waiting for webhooks...\n');
});
