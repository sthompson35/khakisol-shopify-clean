import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Import and parse data from JSON files
 */
class JsonImporter {
  
  /**
   * Load a JSON file
   */
  static loadJson(filePath) {
    try {
      const absolutePath = path.isAbsolute(filePath) 
        ? filePath 
        : path.join(__dirname, '..', filePath);
      
      const content = fs.readFileSync(absolutePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to load JSON: ${error.message}`);
    }
  }

  /**
   * Parse n8n workflow and extract configuration
   */
  static parseN8nWorkflow(data) {
    const config = {
      name: data.name,
      nodes: [],
      agents: [],
      tools: [],
      credentials: [],
      shopifyConfig: null,
    };

    if (!data.nodes) {
      return config;
    }

    for (const node of data.nodes) {
      // Extract node info
      const nodeInfo = {
        id: node.id,
        name: node.name,
        type: node.type,
        notes: node.notes || null,
      };
      config.nodes.push(nodeInfo);

      // Extract agents
      if (node.type?.includes('agent')) {
        config.agents.push({
          name: node.name,
          type: node.type,
          description: node.parameters?.toolDescription || null,
          systemMessage: node.parameters?.options?.systemMessage || null,
        });
      }

      // Extract tools
      if (node.type?.includes('Tool') || node.parameters?.toolDescription) {
        config.tools.push({
          name: node.name,
          type: node.type,
          description: node.parameters?.toolDescription || null,
        });
      }

      // Extract credentials
      if (node.credentials) {
        Object.entries(node.credentials).forEach(([key, value]) => {
          if (!config.credentials.find(c => c.id === value.id)) {
            config.credentials.push({
              type: key,
              id: value.id,
              name: value.name,
            });
          }
        });
      }

      // Extract Shopify configuration
      if (node.parameters?.assignments?.assignments) {
        for (const assignment of node.parameters.assignments.assignments) {
          if (assignment.name === 'shopifyStoreName') {
            config.shopifyConfig = config.shopifyConfig || {};
            config.shopifyConfig.storeName = assignment.value;
          }
          if (assignment.name === 'customerServiceEmail') {
            config.shopifyConfig = config.shopifyConfig || {};
            config.shopifyConfig.customerServiceEmail = assignment.value;
          }
        }
      }
    }

    return config;
  }

  /**
   * Import products from JSON array
   */
  static parseProducts(data) {
    if (!Array.isArray(data)) {
      if (data.products && Array.isArray(data.products)) {
        data = data.products;
      } else {
        throw new Error('Expected array of products');
      }
    }

    return data.map(product => ({
      title: product.title || product.name,
      body_html: product.body_html || product.description || '',
      vendor: product.vendor || 'KhakiSol',
      product_type: product.product_type || product.type || '',
      status: product.status || 'active',
      tags: product.tags || '',
      variants: product.variants || [{
        price: product.price || '0.00',
        sku: product.sku || '',
        inventory_quantity: product.inventory_quantity || product.quantity || 0,
        inventory_management: 'shopify',
      }],
    }));
  }

  /**
   * Import customers from JSON array
   */
  static parseCustomers(data) {
    if (!Array.isArray(data)) {
      if (data.customers && Array.isArray(data.customers)) {
        data = data.customers;
      } else {
        throw new Error('Expected array of customers');
      }
    }

    return data.map(customer => ({
      first_name: customer.first_name || customer.firstName || '',
      last_name: customer.last_name || customer.lastName || '',
      email: customer.email,
      phone: customer.phone || null,
      tags: customer.tags || '',
      addresses: customer.addresses || [],
      accepts_marketing: customer.accepts_marketing ?? true,
      verified_email: true,
      send_email_welcome: false,
    }));
  }

  /**
   * Export parsed data to a clean JSON file
   */
  static exportJson(data, outputPath) {
    const absolutePath = path.isAbsolute(outputPath) 
      ? outputPath 
      : path.join(__dirname, '..', outputPath);
    
    fs.writeFileSync(absolutePath, JSON.stringify(data, null, 2));
    return absolutePath;
  }
}

// ============ MAIN ============
async function main() {
  console.log('📥 JSON Data Importer\n');
  console.log('='.repeat(50));

  const args = process.argv.slice(2);
  const filePath = args[0] || 'ultimate-dynasty-os.json';

  try {
    console.log(`\n📂 Loading: ${filePath}\n`);
    const data = JsonImporter.loadJson(filePath);

    // Detect file type
    if (data.nodes) {
      // n8n workflow
      console.log('📋 Detected: n8n Workflow\n');
      const config = JsonImporter.parseN8nWorkflow(data);

      console.log('='.repeat(50));
      console.log('📊 WORKFLOW SUMMARY');
      console.log('='.repeat(50));
      console.log(`   Name: ${config.name}`);
      console.log(`   Total Nodes: ${config.nodes.length}`);
      console.log(`   Agents: ${config.agents.length}`);
      console.log(`   Tools: ${config.tools.length}`);
      console.log(`   Credentials: ${config.credentials.length}`);

      if (config.shopifyConfig) {
        console.log('\n🛒 SHOPIFY CONFIGURATION');
        console.log('-'.repeat(50));
        console.log(`   Store: ${config.shopifyConfig.storeName || 'N/A'}`);
        console.log(`   Email: ${config.shopifyConfig.customerServiceEmail || 'N/A'}`);
      }

      console.log('\n🤖 AI AGENTS');
      console.log('-'.repeat(50));
      config.agents.forEach((agent, i) => {
        console.log(`   ${i + 1}. ${agent.name}`);
        if (agent.description) {
          console.log(`      ${agent.description}`);
        }
      });

      console.log('\n🔧 TOOLS');
      console.log('-'.repeat(50));
      config.tools.forEach((tool, i) => {
        console.log(`   ${i + 1}. ${tool.name} (${tool.type?.split('.').pop() || 'unknown'})`);
      });

      console.log('\n🔐 CREDENTIALS');
      console.log('-'.repeat(50));
      config.credentials.forEach((cred, i) => {
        console.log(`   ${i + 1}. ${cred.name} (${cred.type})`);
      });

      console.log('\n📄 ALL NODES');
      console.log('-'.repeat(50));
      config.nodes.forEach((node, i) => {
        const type = node.type?.split('.').pop() || 'unknown';
        console.log(`   ${i + 1}. ${node.name} [${type}]`);
      });

      // Export parsed config
      const outputPath = JsonImporter.exportJson(config, 'parsed-workflow-config.json');
      console.log(`\n✅ Parsed config saved to: ${outputPath}`);

    } else if (data.products || Array.isArray(data)) {
      // Products data
      console.log('📋 Detected: Products Data\n');
      const products = JsonImporter.parseProducts(data);
      console.log(`   Found ${products.length} products`);
      products.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.title}`);
      });

    } else if (data.customers) {
      // Customers data
      console.log('📋 Detected: Customers Data\n');
      const customers = JsonImporter.parseCustomers(data);
      console.log(`   Found ${customers.length} customers`);

    } else {
      console.log('📋 Generic JSON Data\n');
      console.log(`   Keys: ${Object.keys(data).join(', ')}`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Import complete!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

export { JsonImporter };
export default main;

main();
