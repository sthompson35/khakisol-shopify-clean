import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * N8N Workflow Configurator
 * Updates the n8n workflow JSON with your Shopify credentials
 */

class WorkflowConfigurator {
    constructor() {
        this.workflowPath = path.join(__dirname, '..', 'ultimate-dynasty-os.json');
        this.outputPath = path.join(__dirname, '..', 'configured-workflow.json');
        
        // Your Shopify credentials from .env
        this.config = {
            shopify: {
                storeName: process.env.SHOPIFY_STORE_URL || 'pygcet-kp.myshopify.com',
                apiKey: process.env.SHOPIFY_API_KEY,
                apiSecret: process.env.SHOPIFY_API_SECRET,
                accessToken: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN
            },
            settings: {
                lowStockThreshold: 10,
                customerServiceEmail: process.env.NOTIFICATION_EMAIL || 'your-email@gmail.com'
            }
        };
    }

    async loadWorkflow() {
        const content = fs.readFileSync(this.workflowPath, 'utf8');
        return JSON.parse(content);
    }

    updateWorkflowConfiguration(workflow) {
        // Find and update the Workflow Configuration node
        const configNode = workflow.nodes.find(n => n.name === 'Workflow Configuration');
        
        if (configNode && configNode.parameters?.assignments?.assignments) {
            configNode.parameters.assignments.assignments = [
                {
                    id: 'id-1',
                    name: 'shopifyStoreName',
                    value: this.config.shopify.storeName,
                    type: 'string'
                },
                {
                    id: 'id-2',
                    name: 'lowStockThreshold',
                    value: this.config.settings.lowStockThreshold,
                    type: 'number'
                },
                {
                    id: 'id-3',
                    name: 'customerServiceEmail',
                    value: this.config.settings.customerServiceEmail,
                    type: 'string'
                }
            ];
            console.log('✅ Updated Workflow Configuration node');
        }

        return workflow;
    }

    async configure() {
        console.log('\n' + '='.repeat(60));
        console.log('🔧 N8N WORKFLOW CONFIGURATOR');
        console.log('='.repeat(60));

        console.log('\n📋 Current Configuration:');
        console.log(`   Store: ${this.config.shopify.storeName}`);
        console.log(`   API Key: ${this.config.shopify.apiKey?.substring(0, 10)}...`);
        console.log(`   Access Token: ${this.config.shopify.accessToken?.substring(0, 15)}...`);
        console.log(`   Low Stock Threshold: ${this.config.settings.lowStockThreshold}`);

        // Load and update workflow
        console.log('\n📂 Loading workflow...');
        let workflow = await this.loadWorkflow();
        console.log(`   Workflow: ${workflow.name}`);
        console.log(`   Nodes: ${workflow.nodes.length}`);

        // Update configuration
        workflow = this.updateWorkflowConfiguration(workflow);

        // Save configured workflow
        fs.writeFileSync(this.outputPath, JSON.stringify(workflow, null, 2));
        console.log(`\n💾 Saved configured workflow to: configured-workflow.json`);

        // Print n8n setup instructions
        this.printSetupInstructions();
    }

    printSetupInstructions() {
        console.log('\n' + '='.repeat(60));
        console.log('📚 N8N SETUP INSTRUCTIONS');
        console.log('='.repeat(60));

        console.log(`
┌─────────────────────────────────────────────────────────┐
│  STEP 1: INSTALL N8N                                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Option A - Cloud (Recommended):                        │
│    1. Go to https://n8n.io                              │
│    2. Sign up for free account                          │
│    3. Your instance will be ready instantly             │
│                                                         │
│  Option B - Self-hosted:                                │
│    npm install -g n8n                                   │
│    n8n start                                            │
│                                                         │
│  Option C - Docker:                                     │
│    docker run -it --rm \\                                │
│      -p 5678:5678 \\                                     │
│      -v ~/.n8n:/home/node/.n8n \\                        │
│      n8nio/n8n                                          │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  STEP 2: CREATE SHOPIFY CREDENTIALS IN N8N             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. In n8n, go to Settings → Credentials               │
│  2. Click "Add Credential"                              │
│  3. Search for "Shopify"                                │
│  4. Enter your credentials:                             │
│                                                         │
│     Shop Subdomain: pygcet-kp                           │
│     API Key:        ${this.config.shopify.apiKey?.substring(0, 20)}...
│     Password:       ${this.config.shopify.accessToken?.substring(0, 20)}...
│     Shared Secret:  ${this.config.shopify.apiSecret?.substring(0, 20)}...
│                                                         │
│  5. Click "Save"                                        │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  STEP 3: CREATE OPENAI CREDENTIALS IN N8N              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Get API key from https://platform.openai.com       │
│  2. In n8n, go to Settings → Credentials               │
│  3. Click "Add Credential"                              │
│  4. Search for "OpenAI"                                 │
│  5. Enter your API Key                                  │
│  6. Click "Save"                                        │
│                                                         │
│  Note: The workflow uses gpt-4o-mini (cost-effective)  │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  STEP 4: CREATE GMAIL CREDENTIALS (Optional)           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Create OAuth 2.0 credentials in Google Cloud       │
│     - Go to console.cloud.google.com                   │
│     - Create a project                                  │
│     - Enable Gmail API                                  │
│     - Create OAuth 2.0 Client ID                       │
│                                                         │
│  2. In n8n, go to Settings → Credentials               │
│  3. Click "Add Credential"                              │
│  4. Search for "Gmail OAuth2"                          │
│  5. Enter Client ID and Client Secret                  │
│  6. Complete OAuth flow                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  STEP 5: IMPORT THE WORKFLOW                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. In n8n, click "Workflows" → "Import"               │
│  2. Select the file:                                    │
│     c:\\shopify\\configured-workflow.json                │
│                                                         │
│  3. Connect credentials to each node:                   │
│     - Shopify Tool nodes → Your Shopify credential     │
│     - OpenAI Model nodes → Your OpenAI credential      │
│     - Gmail Tool nodes → Your Gmail credential         │
│                                                         │
│  4. Activate the workflow                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
`);

        console.log('='.repeat(60));
        console.log('✅ Configuration complete!');
        console.log('='.repeat(60));
    }
}

// Run the configurator
const configurator = new WorkflowConfigurator();
configurator.configure().catch(console.error);
