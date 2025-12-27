import 'dotenv/config';
import https from 'https';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function makeRequest(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.openai.com',
            port: 443,
            path: path,
            method: method,
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`API Error ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', reject);
        
        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function testOpenAIConnection() {
    console.log('\n' + '='.repeat(50));
    console.log('🤖 OPENAI API CONNECTION TEST');
    console.log('='.repeat(50));

    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
        console.log('\n❌ OpenAI API key not configured!');
        console.log('   Add your key to .env file');
        return;
    }

    console.log(`\n🔑 API Key: ${OPENAI_API_KEY.substring(0, 20)}...`);

    try {
        // Test 1: List models (simple API check)
        console.log('\n📋 Test 1: Checking API access...');
        const modelsData = await makeRequest('/v1/models');
        
        console.log(`   ✅ API access confirmed!`);
        console.log(`   📊 Available models: ${modelsData.data.length}`);

        // Show some relevant models
        const relevantModels = modelsData.data
            .filter(m => m.id.includes('gpt'))
            .map(m => m.id)
            .slice(0, 5);
        console.log(`   🎯 GPT models available: ${relevantModels.join(', ')}`);

        // Test 2: Make a simple completion
        console.log('\n💬 Test 2: Testing chat completion...');
        const chatData = await makeRequest('/v1/chat/completions', 'POST', {
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant for a Shopify store called KhakiSol.'
                },
                {
                    role: 'user',
                    content: 'Say hello and confirm you can help manage a Shopify store. Keep it brief (1-2 sentences).'
                }
            ],
            max_tokens: 100
        });

        const reply = chatData.choices[0].message.content;

        console.log(`   ✅ Chat completion successful!`);
        console.log(`   🤖 AI Response: "${reply}"`);
        console.log(`   📊 Tokens used: ${chatData.usage.total_tokens}`);

        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('📊 CONNECTION SUMMARY');
        console.log('='.repeat(50));
        console.log('   ✅ API Key: Valid');
        console.log('   ✅ Models: Accessible');
        console.log('   ✅ Chat Completions: Working');
        console.log('   ✅ Model: gpt-4o-mini (ready for n8n)');
        console.log('\n🎉 OpenAI is ready for your n8n workflows!');
        console.log('='.repeat(50));

    } catch (error) {
        console.log(`\n❌ Connection failed: ${error.message}`);
        
        if (error.message.includes('401')) {
            console.log('\n⚠️  Invalid API key. Please check:');
            console.log('   1. The key is correct');
            console.log('   2. The key has not been revoked');
            console.log('   3. Get a new key at: https://platform.openai.com/api-keys');
        } else if (error.message.includes('429')) {
            console.log('\n⚠️  Rate limited or quota exceeded. Please check:');
            console.log('   1. Your OpenAI billing/usage limits');
            console.log('   2. Add payment method at: https://platform.openai.com/account/billing');
        }
    }
}

testOpenAIConnection();
