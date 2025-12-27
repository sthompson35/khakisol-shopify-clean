import ShopifyClient from '../client/shopifyClient.js';

/**
 * Webhook Registration Service
 * Registers webhooks with Shopify
 */

const WEBHOOK_TOPICS = [
  'orders/create',
  'orders/updated',
  'orders/fulfilled',
  'orders/cancelled',
  'products/create',
  'products/update',
  'products/delete',
  'inventory_levels/update',
  'customers/create',
  'customers/update',
  'refunds/create',
  'app/uninstalled',
];

class WebhookManager {
  constructor() {
    this.shopify = new ShopifyClient();
  }

  /**
   * Get all registered webhooks
   */
  async listWebhooks() {
    const response = await this.shopify.request('/webhooks.json');
    return response.webhooks;
  }

  /**
   * Register a single webhook
   */
  async registerWebhook(topic, address) {
    try {
      const response = await this.shopify.request('/webhooks.json', 'POST', {
        webhook: {
          topic: topic,
          address: address,
          format: 'json'
        }
      });
      return { success: true, webhook: response.webhook };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(webhookId) {
    try {
      await this.shopify.request(`/webhooks/${webhookId}.json`, 'DELETE');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Register all webhooks
   */
  async registerAllWebhooks(baseUrl) {
    console.log('📡 Registering Shopify webhooks...\n');
    
    const results = { success: [], failed: [] };

    for (const topic of WEBHOOK_TOPICS) {
      const address = `${baseUrl}/webhooks/${topic.replace('/', '/')}`;
      console.log(`   Registering: ${topic}`);
      
      const result = await this.registerWebhook(topic, address);
      
      if (result.success) {
        console.log(`   ✅ Registered: ${topic}`);
        results.success.push({ topic, id: result.webhook.id });
      } else {
        console.log(`   ❌ Failed: ${topic} - ${result.error}`);
        results.failed.push({ topic, error: result.error });
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    return results;
  }

  /**
   * Delete all webhooks
   */
  async deleteAllWebhooks() {
    console.log('🗑️  Deleting all webhooks...\n');
    
    const webhooks = await this.listWebhooks();
    const results = { deleted: [], failed: [] };

    for (const webhook of webhooks) {
      console.log(`   Deleting: ${webhook.topic}`);
      
      const result = await this.deleteWebhook(webhook.id);
      
      if (result.success) {
        console.log(`   ✅ Deleted: ${webhook.topic}`);
        results.deleted.push(webhook.topic);
      } else {
        console.log(`   ❌ Failed: ${webhook.topic}`);
        results.failed.push({ topic: webhook.topic, error: result.error });
      }

      await new Promise(resolve => setTimeout(resolve, 300));
    }

    return results;
  }
}

// ============ CLI ============
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const baseUrl = args[1];

  const manager = new WebhookManager();

  console.log('\n' + '='.repeat(50));
  console.log('📡 SHOPIFY WEBHOOK MANAGER');
  console.log('='.repeat(50) + '\n');

  try {
    switch (command) {
      case 'list':
        console.log('📋 Registered Webhooks:\n');
        const webhooks = await manager.listWebhooks();
        
        if (webhooks.length === 0) {
          console.log('   No webhooks registered.');
        } else {
          webhooks.forEach((wh, i) => {
            console.log(`${i + 1}. ${wh.topic}`);
            console.log(`   ID: ${wh.id}`);
            console.log(`   Address: ${wh.address}`);
            console.log(`   Format: ${wh.format}`);
            console.log('');
          });
        }
        break;

      case 'register':
        if (!baseUrl) {
          console.log('❌ Error: Please provide base URL');
          console.log('   Usage: node webhookManager.js register https://your-domain.com');
          process.exit(1);
        }
        
        const registerResults = await manager.registerAllWebhooks(baseUrl);
        console.log('\n📊 Summary:');
        console.log(`   ✅ Registered: ${registerResults.success.length}`);
        console.log(`   ❌ Failed: ${registerResults.failed.length}`);
        break;

      case 'delete':
        const deleteResults = await manager.deleteAllWebhooks();
        console.log('\n📊 Summary:');
        console.log(`   ✅ Deleted: ${deleteResults.deleted.length}`);
        console.log(`   ❌ Failed: ${deleteResults.failed.length}`);
        break;

      default:
        console.log('📚 Usage:');
        console.log('   node webhookManager.js list                    - List all webhooks');
        console.log('   node webhookManager.js register <base-url>     - Register all webhooks');
        console.log('   node webhookManager.js delete                  - Delete all webhooks');
        console.log('\n📝 Example:');
        console.log('   node webhookManager.js register https://myserver.ngrok.io');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(50));
}

export { WebhookManager };
export default main;

main();
