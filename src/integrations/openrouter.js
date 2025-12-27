import 'dotenv/config';

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                   🌐 OPENROUTER INTEGRATION                      ║
 * ║            Multi-Model AI Access for KhakiSol                    ║
 * ╚══════════════════════════════════════════════════════════════════╝
 * 
 * OpenRouter provides access to 100+ AI models through a single API:
 * - GPT-4, Claude, Gemini, Llama, Mistral, and more
 * - Automatic fallback and load balancing
 * - Cost-effective model selection
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

class OpenRouterClient {
    constructor(apiKey = OPENROUTER_API_KEY) {
        this.apiKey = apiKey;
        this.baseUrl = OPENROUTER_BASE_URL;
        this.defaultModel = 'openai/gpt-4o-mini'; // Cost-effective default
    }

    // ─────────────────────────────────────────────────────────────
    // CONNECTION TEST
    // ─────────────────────────────────────────────────────────────

    async testConnection() {
        try {
            const models = await this.listModels();
            return {
                success: true,
                modelsAvailable: models.length,
                sampleModels: models.slice(0, 5).map(m => m.id)
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ─────────────────────────────────────────────────────────────
    // API REQUESTS
    // ─────────────────────────────────────────────────────────────

    async makeRequest(endpoint, method = 'GET', body = null) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const options = {
            method,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://khakisol.com',
                'X-Title': 'KhakiSol AI Store Manager'
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`OpenRouter Error ${response.status}: ${error}`);
        }

        return response.json();
    }

    // ─────────────────────────────────────────────────────────────
    // MODELS
    // ─────────────────────────────────────────────────────────────

    async listModels() {
        const response = await this.makeRequest('/models');
        return response.data || [];
    }

    async getModelInfo(modelId) {
        const models = await this.listModels();
        return models.find(m => m.id === modelId);
    }

    // Popular models for quick access
    static MODELS = {
        // OpenAI
        GPT4O: 'openai/gpt-4o',
        GPT4O_MINI: 'openai/gpt-4o-mini',
        GPT4_TURBO: 'openai/gpt-4-turbo',
        
        // Anthropic
        CLAUDE_3_5_SONNET: 'anthropic/claude-3.5-sonnet',
        CLAUDE_3_OPUS: 'anthropic/claude-3-opus',
        CLAUDE_3_HAIKU: 'anthropic/claude-3-haiku',
        
        // Google
        GEMINI_PRO: 'google/gemini-pro-1.5',
        GEMINI_FLASH: 'google/gemini-flash-1.5',
        
        // Meta
        LLAMA_3_70B: 'meta-llama/llama-3-70b-instruct',
        LLAMA_3_8B: 'meta-llama/llama-3-8b-instruct',
        
        // Mistral
        MISTRAL_LARGE: 'mistralai/mistral-large',
        MISTRAL_MEDIUM: 'mistralai/mistral-medium',
        
        // Free tier
        LLAMA_FREE: 'meta-llama/llama-3.2-3b-instruct:free',
        GEMMA_FREE: 'google/gemma-2-9b-it:free'
    };

    // ─────────────────────────────────────────────────────────────
    // CHAT COMPLETIONS
    // ─────────────────────────────────────────────────────────────

    async chat(messages, options = {}) {
        const {
            model = this.defaultModel,
            temperature = 0.7,
            maxTokens = 1000,
            topP = 1,
            stream = false
        } = options;

        const response = await this.makeRequest('/chat/completions', 'POST', {
            model,
            messages,
            temperature,
            max_tokens: maxTokens,
            top_p: topP,
            stream
        });

        return response.choices[0].message.content;
    }

    async generate(prompt, options = {}) {
        return this.chat([{ role: 'user', content: prompt }], options);
    }

    // ─────────────────────────────────────────────────────────────
    // SPECIALIZED METHODS
    // ─────────────────────────────────────────────────────────────

    async analyzeProduct(product) {
        const prompt = `Analyze this e-commerce product and provide:
1. SEO optimization suggestions
2. Pricing recommendations
3. Target audience insights

Product: ${JSON.stringify(product, null, 2)}`;

        return this.chat([
            { role: 'system', content: 'You are an e-commerce expert helping optimize product listings.' },
            { role: 'user', content: prompt }
        ], { model: OpenRouterClient.MODELS.GPT4O_MINI });
    }

    async generateProductDescription(title, features, style = 'professional') {
        const prompt = `Write a compelling product description for:
Title: ${title}
Features: ${features.join(', ')}
Style: ${style}

Keep it under 150 words.`;

        return this.generate(prompt, { model: OpenRouterClient.MODELS.GPT4O_MINI });
    }

    async analyzeCustomerFeedback(reviews) {
        const prompt = `Analyze these customer reviews and provide:
1. Overall sentiment
2. Common praise points
3. Common complaints
4. Actionable improvements

Reviews:
${reviews.map((r, i) => `${i + 1}. ${r}`).join('\n')}`;

        return this.chat([
            { role: 'system', content: 'You are a customer experience analyst.' },
            { role: 'user', content: prompt }
        ]);
    }

    async suggestMarketingCopy(product, campaign) {
        const prompt = `Create marketing copy for:
Product: ${product}
Campaign: ${campaign}

Provide:
1. Headline (under 10 words)
2. Tagline (under 7 words)  
3. Social media post (under 280 chars)
4. Email subject line`;

        return this.generate(prompt);
    }

    async translateContent(content, targetLanguage) {
        const prompt = `Translate the following to ${targetLanguage}, maintaining the original tone and meaning:

${content}`;

        return this.generate(prompt, { model: OpenRouterClient.MODELS.GPT4O_MINI });
    }

    // ─────────────────────────────────────────────────────────────
    // MULTI-MODEL COMPARISON
    // ─────────────────────────────────────────────────────────────

    async compareModels(prompt, models = ['openai/gpt-4o-mini', 'anthropic/claude-3-haiku', 'google/gemini-flash-1.5']) {
        const results = await Promise.allSettled(
            models.map(async (model) => {
                const start = Date.now();
                const response = await this.generate(prompt, { model });
                const duration = Date.now() - start;
                return { model, response, duration };
            })
        );

        return results.map((r, i) => ({
            model: models[i],
            success: r.status === 'fulfilled',
            response: r.status === 'fulfilled' ? r.value.response : null,
            duration: r.status === 'fulfilled' ? r.value.duration : null,
            error: r.status === 'rejected' ? r.reason.message : null
        }));
    }

    // ─────────────────────────────────────────────────────────────
    // COST-OPTIMIZED ROUTING
    // ─────────────────────────────────────────────────────────────

    async smartGenerate(prompt, priority = 'balanced') {
        // Select model based on priority
        const modelMap = {
            speed: OpenRouterClient.MODELS.GEMINI_FLASH,
            quality: OpenRouterClient.MODELS.GPT4O,
            cost: OpenRouterClient.MODELS.LLAMA_FREE,
            balanced: OpenRouterClient.MODELS.GPT4O_MINI
        };

        const model = modelMap[priority] || modelMap.balanced;
        return this.generate(prompt, { model });
    }
}

// ─────────────────────────────────────────────────────────────────
// DEMO & TESTING
// ─────────────────────────────────────────────────────────────────

async function demo() {
    console.log('\n' + '═'.repeat(60));
    console.log('🌐 OPENROUTER INTEGRATION TEST');
    console.log('═'.repeat(60));

    if (!OPENROUTER_API_KEY) {
        console.log('\n⚠️  OPENROUTER_API_KEY not configured in .env');
        return;
    }

    const client = new OpenRouterClient();
    
    console.log('\n🔌 Testing connection...');
    const test = await client.testConnection();
    
    if (test.success) {
        console.log(`   ✅ Connected`);
        console.log(`   📊 Models available: ${test.modelsAvailable}`);
        console.log(`   🔥 Sample: ${test.sampleModels.join(', ')}`);

        console.log('\n🤖 Testing generation...');
        const response = await client.generate(
            'Say "Hello KhakiSol!" and give one e-commerce tip in under 30 words.'
        );
        console.log(`   Response: ${response}`);
    } else {
        console.log(`   ❌ Failed: ${test.error}`);
    }

    console.log('\n' + '═'.repeat(60));
}

// Run demo if called directly
const isMainModule = import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`;
if (isMainModule) {
    demo().catch(console.error);
}

export default OpenRouterClient;
