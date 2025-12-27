import 'dotenv/config';
import http from 'http';

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                    🦙 OLLAMA INTEGRATION                         ║
 * ║              Local AI Models for KhakiSol                        ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_DEFAULT_MODEL || process.env.OLLAMA_MODEL || 'mistral:latest';

class OllamaClient {
    constructor(host = OLLAMA_HOST, model = OLLAMA_MODEL) {
        const url = new URL(host);
        this.hostname = url.hostname;
        this.port = url.port || 11434;
        this.model = model;
    }

    async makeRequest(path, method = 'POST', body = null, stream = false) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: this.hostname,
                port: this.port,
                path: path,
                method: method,
                headers: { 'Content-Type': 'application/json' }
            };

            const req = http.request(options, (res) => {
                let data = '';
                
                res.on('data', chunk => {
                    data += chunk;
                    if (stream) {
                        // Handle streaming responses
                        const lines = data.split('\n').filter(l => l.trim());
                        lines.forEach(line => {
                            try {
                                const json = JSON.parse(line);
                                if (json.response) process.stdout.write(json.response);
                            } catch {}
                        });
                    }
                });
                
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            // For streaming, get the last complete response
                            if (stream) {
                                const lines = data.split('\n').filter(l => l.trim());
                                const lastLine = lines[lines.length - 1];
                                resolve(JSON.parse(lastLine));
                            } else {
                                resolve(JSON.parse(data));
                            }
                        } catch {
                            resolve(data);
                        }
                    } else {
                        reject(new Error(`Ollama Error ${res.statusCode}: ${data}`));
                    }
                });
            });

            req.on('error', (error) => {
                if (error.code === 'ECONNREFUSED') {
                    reject(new Error('Ollama is not running. Start it with: ollama serve'));
                } else {
                    reject(error);
                }
            });

            if (body) req.write(JSON.stringify(body));
            req.end();
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // GENERATION
    // ═══════════════════════════════════════════════════════════════

    async generate(prompt, options = {}) {
        const body = {
            model: options.model || this.model,
            prompt: prompt,
            stream: false,
            ...options
        };

        const result = await this.makeRequest('/api/generate', 'POST', body);
        return result.response;
    }

    async generateStream(prompt, options = {}) {
        const body = {
            model: options.model || this.model,
            prompt: prompt,
            stream: true,
            ...options
        };

        return this.makeRequest('/api/generate', 'POST', body, true);
    }

    // ═══════════════════════════════════════════════════════════════
    // CHAT
    // ═══════════════════════════════════════════════════════════════

    async chat(messages, options = {}) {
        const body = {
            model: options.model || this.model,
            messages: messages,
            stream: false,
            ...options
        };

        const result = await this.makeRequest('/api/chat', 'POST', body);
        return result.message;
    }

    async chatWithHistory(userMessage, history = [], systemPrompt = null) {
        const messages = [];
        
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }
        
        messages.push(...history);
        messages.push({ role: 'user', content: userMessage });

        return this.chat(messages);
    }

    // ═══════════════════════════════════════════════════════════════
    // MODEL MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    async listModels() {
        return this.makeRequest('/api/tags', 'GET');
    }

    async showModel(modelName) {
        return this.makeRequest('/api/show', 'POST', { name: modelName || this.model });
    }

    async pullModel(modelName) {
        console.log(`Pulling model: ${modelName}...`);
        return this.makeRequest('/api/pull', 'POST', { name: modelName, stream: false });
    }

    async deleteModel(modelName) {
        return this.makeRequest('/api/delete', 'DELETE', { name: modelName });
    }

    // ═══════════════════════════════════════════════════════════════
    // EMBEDDINGS
    // ═══════════════════════════════════════════════════════════════

    async embed(text, model = 'nomic-embed-text') {
        const body = {
            model: model,
            prompt: text
        };

        return this.makeRequest('/api/embeddings', 'POST', body);
    }

    // ═══════════════════════════════════════════════════════════════
    // KHAKISOL AI AGENTS (Local)
    // ═══════════════════════════════════════════════════════════════

    async analyzeInventory(inventoryData) {
        const prompt = `You are an inventory analyst for KhakiSol, a casual outdoor clothing store.

Analyze this inventory data and provide recommendations:
${JSON.stringify(inventoryData, null, 2)}

Provide:
1. Stock status summary
2. Reorder recommendations
3. Potential issues
4. Optimization suggestions

Be concise and actionable.`;

        return this.generate(prompt);
    }

    async generateProductDescription(productData) {
        const prompt = `You are a copywriter for KhakiSol, a casual outdoor clothing brand.

Write a compelling product description for:
Name: ${productData.name}
Type: ${productData.type}
Features: ${productData.features || 'Not specified'}
Price: $${productData.price}

Write a 2-3 sentence description that:
- Highlights key benefits
- Appeals to outdoor enthusiasts
- Maintains a casual, friendly tone`;

        return this.generate(prompt);
    }

    async handleCustomerQuery(query, context = {}) {
        const systemPrompt = `You are a helpful customer service agent for KhakiSol, a casual outdoor clothing store.
Store: pygcet-kp.myshopify.com
Be friendly, helpful, and professional.`;

        return this.chatWithHistory(query, [], systemPrompt);
    }

    async generateMarketingCopy(campaignType, details) {
        const prompt = `You are a marketing specialist for KhakiSol, a casual outdoor clothing brand.

Create ${campaignType} marketing copy:
${JSON.stringify(details, null, 2)}

Write engaging copy that:
- Captures attention
- Drives action
- Fits the brand voice (adventurous, authentic, casual)`;

        return this.generate(prompt);
    }

    async summarizeReports(reports) {
        const prompt = `Summarize these store reports into a brief executive summary:

${JSON.stringify(reports, null, 2)}

Provide:
1. Key metrics
2. Top 3 priorities
3. Recommended actions

Keep it under 200 words.`;

        return this.generate(prompt);
    }

    // ═══════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════

    async isRunning() {
        try {
            await this.listModels();
            return true;
        } catch {
            return false;
        }
    }

    async testConnection() {
        try {
            const models = await this.listModels();
            return { 
                success: true, 
                models: models.models?.map(m => m.name) || [],
                currentModel: this.model
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

export default OllamaClient;

// Test if running directly
if (process.argv[1].includes('ollama')) {
    const ollama = new OllamaClient();
    
    console.log('\n' + '═'.repeat(50));
    console.log('🦙 OLLAMA INTEGRATION TEST');
    console.log('═'.repeat(50));
    console.log(`\n   Host: ${OLLAMA_HOST}`);
    console.log(`   Model: ${OLLAMA_MODEL}`);
    
    ollama.testConnection().then(async result => {
        if (result.success) {
            console.log('\n✅ Connected to Ollama!');
            console.log(`   Available models: ${result.models.join(', ') || 'None'}`);
            
            if (result.models.length > 0) {
                console.log('\n📝 Testing generation...');
                try {
                    const response = await ollama.generate('Say hello to KhakiSol store in one sentence.');
                    console.log(`   Response: ${response}`);
                } catch (e) {
                    console.log(`   Generation test failed: ${e.message}`);
                }
            } else {
                console.log('\n⚠️  No models installed. Run: ollama pull llama3.2');
            }
        } else {
            console.log('\n❌ Connection failed:', result.error);
            console.log('\n   To install Ollama:');
            console.log('   1. Download from: https://ollama.ai');
            console.log('   2. Run: ollama serve');
            console.log('   3. Pull a model: ollama pull llama3.2');
        }
    });
}
