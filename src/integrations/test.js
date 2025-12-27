import 'dotenv/config';
import NotionClient from './notion.js';
import SlackClient from './slack.js';
import OllamaClient from './ollama.js';
import OpenRouterClient from './openrouter.js';

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                 🔌 INTEGRATIONS TEST SUITE                       ║
 * ║           Test all external service connections                  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

async function testAllIntegrations() {
    console.log('\n' + '═'.repeat(60));
    console.log('🔌 KHAKISOL INTEGRATIONS TEST SUITE');
    console.log('═'.repeat(60));

    const results = {
        notion: { status: 'pending' },
        slack: { status: 'pending' },
        ollama: { status: 'pending' },
        openrouter: { status: 'pending' }
    };

    // ─────────────────────────────────────────────────────────────
    // TEST NOTION
    // ─────────────────────────────────────────────────────────────
    console.log('\n📝 NOTION');
    console.log('─'.repeat(40));
    
    if (!process.env.NOTION_API_KEY || process.env.NOTION_API_KEY.includes('YOUR_')) {
        console.log('   ⚠️  Not configured');
        console.log('   Add NOTION_API_KEY to .env');
        results.notion = { status: 'not_configured' };
    } else {
        const notion = new NotionClient();
        const test = await notion.testConnection();
        if (test.success) {
            console.log('   ✅ Connected');
            console.log(`   User: ${test.user?.name || test.user?.id || 'Unknown'}`);
            results.notion = { status: 'connected', ...test };
        } else {
            console.log('   ❌ Failed:', test.error);
            results.notion = { status: 'failed', error: test.error };
        }
    }

    // ─────────────────────────────────────────────────────────────
    // TEST SLACK
    // ─────────────────────────────────────────────────────────────
    console.log('\n💬 SLACK');
    console.log('─'.repeat(40));
    
    if (!process.env.SLACK_BOT_TOKEN || process.env.SLACK_BOT_TOKEN.includes('YOUR_')) {
        console.log('   ⚠️  Not configured');
        console.log('   Add SLACK_BOT_TOKEN to .env');
        results.slack = { status: 'not_configured' };
    } else {
        const slack = new SlackClient();
        const test = await slack.testConnection();
        if (test.success) {
            console.log('   ✅ Connected');
            console.log(`   Team: ${test.team}`);
            console.log(`   Bot: ${test.user}`);
            results.slack = { status: 'connected', ...test };
        } else {
            console.log('   ❌ Failed:', test.error);
            results.slack = { status: 'failed', error: test.error };
        }
    }

    // ─────────────────────────────────────────────────────────────
    // TEST OLLAMA
    // ─────────────────────────────────────────────────────────────
    console.log('\n🦙 OLLAMA');
    console.log('─'.repeat(40));
    
    const ollama = new OllamaClient();
    const ollamaTest = await ollama.testConnection();
    
    if (ollamaTest.success) {
        console.log('   ✅ Connected');
        console.log(`   Models: ${ollamaTest.models.length > 0 ? ollamaTest.models.join(', ') : 'None installed'}`);
        console.log(`   Default: ${ollamaTest.currentModel}`);
        results.ollama = { status: 'connected', ...ollamaTest };
        
        // Quick test if model is available
        if (ollamaTest.models.length > 0) {
            try {
                console.log('\n   Testing generation...');
                const response = await ollama.generate('Say "Hello KhakiSol!" in 5 words or less.');
                console.log(`   Response: ${response.trim()}`);
            } catch (e) {
                console.log(`   ⚠️  Generation failed: ${e.message}`);
            }
        }
    } else {
        console.log('   ⚠️  Not running');
        console.log('   Start with: ollama serve');
        results.ollama = { status: 'not_running', error: ollamaTest.error };
    }

    // ─────────────────────────────────────────────────────────────
    // TEST OPENROUTER
    // ─────────────────────────────────────────────────────────────
    console.log('\n🌐 OPENROUTER');
    console.log('─'.repeat(40));
    
    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY.includes('YOUR_')) {
        console.log('   ⚠️  Not configured');
        console.log('   Add OPENROUTER_API_KEY to .env');
        results.openrouter = { status: 'not_configured' };
    } else {
        const openrouter = new OpenRouterClient();
        const test = await openrouter.testConnection();
        if (test.success) {
            console.log('   ✅ Connected');
            console.log(`   Models: ${test.modelsAvailable} available`);
            results.openrouter = { status: 'connected', ...test };
            
            try {
                console.log('\n   Testing generation...');
                const response = await openrouter.generate('Say "Hello KhakiSol!" in 5 words.');
                console.log(`   Response: ${response.trim()}`);
            } catch (e) {
                console.log(`   ⚠️  Generation failed: ${e.message}`);
            }
        } else {
            console.log('   ❌ Failed:', test.error);
            results.openrouter = { status: 'failed', error: test.error };
        }
    }

    // ─────────────────────────────────────────────────────────────
    // SUMMARY
    // ─────────────────────────────────────────────────────────────
    console.log('\n' + '═'.repeat(60));
    console.log('📊 SUMMARY');
    console.log('═'.repeat(60));

    const statusEmoji = {
        connected: '✅',
        not_configured: '⚠️',
        not_running: '⚠️',
        failed: '❌',
        pending: '⏳'
    };

    console.log(`\n   Notion:     ${statusEmoji[results.notion.status]} ${results.notion.status}`);
    console.log(`   Slack:      ${statusEmoji[results.slack.status]} ${results.slack.status}`);
    console.log(`   Ollama:     ${statusEmoji[results.ollama.status]} ${results.ollama.status}`);
    console.log(`   OpenRouter: ${statusEmoji[results.openrouter.status]} ${results.openrouter.status}`);

    const connected = Object.values(results).filter(r => r.status === 'connected').length;
    console.log(`\n   ${connected}/4 integrations connected`);

    console.log('\n' + '═'.repeat(60));
    
    return results;
}

testAllIntegrations().catch(console.error);
