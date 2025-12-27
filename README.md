# 🏪 KhakiSol - AI-Powered Shopify Store Management

A comprehensive Node.js integration for **KhakiSol** Shopify store with AI agents, multi-platform integrations, automated workflows, and webhook processing.

**Store:** `pygcet-kp.myshopify.com` | **Dashboard:** `http://localhost:12321/dashboard`

## ✅ Current Status

| System | Status | Details |
|--------|--------|---------|
| Shopify API | ✅ Connected | 19 products, 10 customers, 12 webhooks |
| Webhook Server | ✅ Running | Port 12321, ngrok tunnel active |
| OpenAI | ✅ 72 GPT models | Integrated |
| Notion | ✅ Connected | Documentation & databases |
| Slack | ✅ Bot: ultimate-dynasty-os | Notifications & alerts |
| Ollama | ✅ Local LLM (mistral) | No API costs |
| OpenRouter | ✅ 338 AI models | Multi-model AI |
| Stripe | ✅ Configured | Test mode |
| Shopify App | ✅ Running | Cloudflare tunnel: `https://fat-taxation-those-maiden.trycloudflare.com` |

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Webhook Server

```bash
npm run server
```

The webhook server will start on port 12321 with ngrok tunneling enabled.

### 3. Run Commands

```bash
npm start              # Test connection & show overview
npm run scan           # Full project health scan
npm run integrations   # Test all integrations
npm run troopers       # Deploy 30 AI agents
npm run dashboard      # Open webhook dashboard in browser
```

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `npm start` | Test connection and show store overview |
| `npm run scan` | Full project health scan |
| `npm run status` | Status dashboard |
| `npm run server` | **Start webhook server** (port 12321) |
| `npm run dashboard` | Open webhook dashboard in browser |
| `npm run integrations` | Test all integrations |
| `npm run troopers` | Deploy 30 AI agents |
| `npm run troopers:list` | List all AI agents |
| `npm run products` | List products |
| `npm run customers` | List customers |
| `npm run webhooks:list` | List registered Shopify webhooks |
| `npm run webhooks:register` | Register all webhooks with Shopify |

## 🤖 AI Troopers (30 Agents)

| Squadron | Agents |
|----------|--------|
| Inventory | 5 agents |
| Customer Service | 5 agents |
| Marketing | 5 agents |
| Fulfillment | 5 agents |
| Analytics | 5 agents |
| Security | 3 agents |
| Operations | 2 agents |

## 🪝 Webhook System

### Active Webhooks (12 registered)
- **Orders**: `orders/create`, `orders/updated`, `orders/fulfilled`, `orders/cancelled`
- **Products**: `products/create`, `products/update`, `products/delete`
- **Customers**: `customers/create`, `customers/update`
- **Inventory**: `inventory_levels/update`
- **Refunds**: `refunds/create`
- **App**: `app/uninstalled`

### Dashboard Features
- **Real-time monitoring** at `http://localhost:12321/dashboard`
- **KhakiSol branding** with professional UI
- **Server status** (uptime, memory usage)
- **Events chart** (24-hour activity)
- **Integration status** (Slack, Notion, Ollama, OpenRouter)
- **Auto-refresh** every 30 seconds

### Webhook Processing
- **HMAC verification** with Shopify secret
- **Event logging** to JSON database
- **Multi-platform notifications** (Slack, Notion)
- **AI processing** via Ollama/OpenRouter
- **Test mode support** for development

## 🔌 Integrations

- **Notion** - Documentation & databases
- **Slack** - Notifications & alerts
- **Ollama** - Local AI (no API costs)
- **OpenRouter** - 338 cloud AI models
- **Stripe** - Payment processing

## 📁 Project Structure

```
shopify/
├── .env                      # All credentials (Shopify, OpenAI, Slack, etc.)
├── package.json              # Dependencies & scripts
├── cspell.json               # Spell checker config
├── data/
│   └── webhooks.json         # Webhook event storage
└── src/
    ├── index.js              # Main entry point
    ├── server.js             # **Webhook server** (Express, port 12321)
    ├── scanner.js            # Project health scanner
    ├── status.js             # Status dashboard
    ├── aiTroopers.js         # 30 AI agents system
    ├── aiStoreManager.js     # AI workflow manager
    ├── client/
    │   └── shopifyClient.js  # Shopify REST/GraphQL client
    ├── services/
    │   ├── inventorySync.js  # Inventory management
    │   ├── orderSync.js      # Order processing
    │   ├── webhookManager.js # Webhook registration & management
    │   ├── webhookDatabase.js # Webhook event storage & querying
    │   ├── notificationService.js # Multi-platform notifications
    │   └── dashboardTemplate.js # HTML dashboard generation
    └── integrations/
        ├── index.js          # Integrations index
        ├── hub.js            # Unified integration hub
        ├── notion.js         # Notion API client
        ├── slack.js          # Slack API client
        ├── ollama.js         # Local LLM integration
        ├── openrouter.js     # Multi-model AI (338 models)
        └── test.js           # Integration test suite
```

## 🔧 API Client Usage

```javascript
import ShopifyClient from './client/shopifyClient.js';

const shopify = new ShopifyClient();

// Get shop info
const { shop } = await shopify.getShop();

// Get products
const { products } = await shopify.getProducts({ limit: 50 });

// Get orders
const { orders } = await shopify.getOrders({ status: 'any' });

// Get customers
const { customers } = await shopify.getCustomers();

// GraphQL query
const data = await shopify.graphql(`
  query {
    products(first: 10) {
      edges {
        node {
          id
          title
        }
      }
    }
  }
`);
```

## 📦 Available Methods

### Products
- `getProducts(params)` - Get all products
- `getProduct(id)` - Get single product
- `createProduct(data)` - Create new product
- `updateProduct(id, data)` - Update product
- `deleteProduct(id)` - Delete product

### Orders
- `getOrders(params)` - Get all orders
- `getOrder(id)` - Get single order
- `getOrderCount(params)` - Get order count

### Customers
- `getCustomers(params)` - Get all customers
- `getCustomer(id)` - Get single customer
- `createCustomer(data)` - Create customer
- `searchCustomers(query)` - Search customers

### Inventory
- `getInventoryLevels(params)` - Get inventory levels
- `adjustInventory(itemId, locationId, adjustment)` - Adjust inventory

### Collections
- `getCustomCollections(params)` - Get custom collections
- `getSmartCollections(params)` - Get smart collections

### GraphQL
- `graphql(query, variables)` - Execute GraphQL query

## 🌐 Webhook Endpoints

### Webhook URLs
All webhooks are registered with Shopify and point to:
```
https://dante-intricate-margeret.ngrok-free.dev/webhooks/{topic}
```

### Available Endpoints
- `GET /` - Home page with KhakiSol branding
- `GET /health` - Server health check
- `GET /dashboard` - **Enhanced dashboard** with charts & status
- `GET /dashboard/json` - Raw dashboard data (JSON)
- `POST /webhooks/{topic}` - Webhook receivers (12 topics)
- `GET /api/shop` - Shop information
- `GET /api/products` - Product listings
- `GET /api/inventory` - Inventory levels
- `GET /api/orders` - Order history
- `GET /api/customers` - Customer data
- `GET /api/integrations/status` - Integration health

### Dashboard Features
- **Real-time webhook monitoring**
- **Interactive charts** (Chart.js)
- **Server status** (uptime, memory)
- **Integration status cards**
- **Event history** with filtering
- **Auto-refresh** capability

## 🔐 Security Notes

⚠️ **IMPORTANT**:
- Never commit the `.env` file to version control
- Keep your API keys and access tokens secure
- The `.gitignore` file is configured to exclude sensitive files
- **Webhook secret** is HMAC-validated for all incoming webhooks
- All webhook payloads are verified against Shopify's signature
- Test mode bypass available for local development

## 🪝 Webhook Security

### HMAC Verification
- All webhooks are signed with SHA256 HMAC
- Secret: `91477e2c970f1f16ffff456b78abe19f9cc4bc314ba5986cf66e7c5ecb51634c`
- Automatic verification on all `/webhooks/*` endpoints
- Invalid signatures are rejected with 401 status

### Data Storage
- Webhook events stored in `data/webhooks.json`
- Includes full payload, metadata, and processing status
- Queryable by topic, timestamp, and status
- Automatic cleanup for old events (configurable)

## 📚 Resources

- [Shopify Admin API Reference](https://shopify.dev/docs/api/admin-rest)
- [Shopify GraphQL API Reference](https://shopify.dev/docs/api/admin-graphql)
- [Shopify API Rate Limits](https://shopify.dev/docs/api/usage/rate-limits)

## 🆘 Troubleshooting

### Connection Errors
- Verify your access token is correct
- Check that API scopes are properly configured
- Ensure the store URL is correct

### Webhook Issues
- **Server not responding**: Check if `npm run server` is running on port 12321
- **Ngrok offline**: Restart ngrok tunnel: `ngrok http 12321`
- **Invalid signatures**: Verify webhook secret matches Shopify settings
- **Missing events**: Check webhook registration with `npm run webhooks:list`

### Rate Limiting
- Shopify has rate limits (40 requests/second for REST)
- Implement retry logic for production applications
- Consider using GraphQL for complex queries (higher rate limits)

### Integration Issues
- **Slack**: Verify bot token and channel permissions
- **Notion**: Check API key and database access
- **Ollama**: Ensure local server is running (`ollama serve`)
- **OpenRouter**: Verify API key and model availability

### Port Conflicts
- Default webhook port: **12321** (changed from 3000)
- Check for conflicts: `netstat -ano | findstr :12321`
- Kill conflicting processes if needed
"# khakisol-shopify" 
