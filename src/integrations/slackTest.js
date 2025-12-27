import 'dotenv/config';
import SlackClient from './slack.js';

/**
 * Send a quick test message to Slack
 */

async function sendTestMessage() {
    console.log('📤 Sending test message to Slack...\n');
    
    const slack = new SlackClient();
    
    // First, get available channels
    try {
        const channels = await slack.getChannels();
        console.log('📋 Available channels:');
        channels.slice(0, 10).forEach(ch => {
            console.log(`   #${ch.name} ${ch.is_member ? '(joined)' : ''}`);
        });
        
        // Find general or first available channel
        const targetChannel = channels.find(c => c.name === 'general' || c.name === 'random') 
            || channels.find(c => c.is_member)
            || channels[0];
        
        if (!targetChannel) {
            console.log('\n⚠️  No channels found. Bot may need to be invited to a channel.');
            return;
        }
        
        console.log(`\n📨 Sending to #${targetChannel.name}...`);
        
        const result = await slack.sendRichMessage(targetChannel.id, [{
            color: '#00ff00',
            title: '🎉 KhakiSol Integration Active!',
            text: 'Your Shopify store is now connected to Slack. You will receive:\n• New order notifications\n• Low stock alerts\n• Daily sales reports',
            footer: 'KhakiSol AI Store Manager',
            ts: Math.floor(Date.now() / 1000)
        }]);
        
        if (result.ok) {
            console.log('✅ Message sent successfully!');
            console.log(`   Channel: #${targetChannel.name}`);
            console.log(`   Timestamp: ${result.ts}`);
        } else {
            console.log('❌ Failed:', result.error);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
        
        // Try sending to the default channel ID
        if (process.env.SLACK_CHANNEL_ID && process.env.SLACK_CHANNEL_ID !== 'general') {
            console.log(`\nTrying default channel: ${process.env.SLACK_CHANNEL_ID}`);
            try {
                const result = await slack.sendMessage(
                    process.env.SLACK_CHANNEL_ID,
                    '🎉 KhakiSol Integration Active! Your Shopify store is now connected.'
                );
                console.log(result.ok ? '✅ Sent!' : `❌ ${result.error}`);
            } catch (e) {
                console.log('❌', e.message);
            }
        }
    }
}

sendTestMessage().catch(console.error);
