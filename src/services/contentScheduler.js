import 'dotenv/config';
import fs from 'fs';
import path from 'path';

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                 📅 CONTENT SCHEDULER                            ║
 * ║              TikTok, Instagram, Email Automation               ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

class ContentScheduler {
    constructor() {
        this.notionDashboard = null;
        this.contentQueue = [];
        this.postedContent = [];
        this.loadContentQueue();
    }

    // ─────────────────────────────────────────────────────────────
    // DAILY CONTENT GENERATION
    // ─────────────────────────────────────────────────────────────

    async generateDailyContent() {
        console.log('🎨 Generating daily content plan...');

        const today = new Date();
        const contentPlan = {
            date: today.toISOString().split('T')[0],
            content: [],
            status: 'generated'
        };

        // TikTok Reel
        contentPlan.content.push({
            type: 'tiktok_reel',
            title: this.generateTikTokTitle(),
            description: this.generateTikTokDescription(),
            hashtags: this.getTikTokHashtags(),
            scheduledTime: this.getRandomTime(today, 9, 12), // 9 AM - 12 PM
            status: 'draft'
        });

        // Instagram Post
        contentPlan.content.push({
            type: 'instagram_post',
            title: this.generateInstagramTitle(),
            description: this.generateInstagramDescription(),
            hashtags: this.getInstagramHashtags(),
            scheduledTime: this.getRandomTime(today, 11, 14), // 11 AM - 2 PM
            status: 'draft'
        });

        // Creator Outreach
        if (this.shouldDoCreatorOutreach(today)) {
            contentPlan.content.push({
                type: 'creator_outreach',
                title: this.generateCreatorOutreachTitle(),
                description: this.generateCreatorOutreachMessage(),
                targets: this.getCreatorTargets(),
                scheduledTime: this.getRandomTime(today, 10, 16), // 10 AM - 4 PM
                status: 'draft'
            });
        }

        // Email Content (if applicable)
        if (this.shouldSendEmail(today)) {
            contentPlan.content.push({
                type: 'email',
                title: this.generateEmailTitle(),
                subject: this.generateEmailSubject(),
                content: this.generateEmailContent(),
                scheduledTime: this.getRandomTime(today, 8, 10), // 8 AM - 10 AM
                status: 'draft'
            });
        }

        this.contentQueue.push(contentPlan);
        this.saveContentQueue();

        console.log(`✅ Generated ${contentPlan.content.length} content pieces for ${contentPlan.date}`);
        return contentPlan;
    }

    generateTikTokTitle() {
        const titles = [
            'Desert Combat Boots in Action',
            'Tactical Gear That Lasts',
            'KhakiSol Field Jacket Review',
            'Military-Grade Backpack Test',
            'Duty Belt Setup Guide',
            'Tactical T-Shirt Moisture Test',
            'Operator Cap Style Guide',
            'All-Weather Gloves Demo',
            'Tactical Watch Features',
            'MOLLE Pouch System'
        ];
        return titles[Math.floor(Math.random() * titles.length)];
    }

    generateTikTokDescription() {
        const descriptions = [
            'Testing these boots in real desert conditions. Built for operators who demand durability. #TacticalGear #MilitaryBoots',
            'KhakiSol gear is designed for the harshest environments. From desert to mountain, we\'ve got you covered.',
            'Field jacket that handles wind, rain, and extreme temperatures. Perfect for any mission.',
            '40L tactical backpack with MOLLE system. Organize your gear like a professional.',
            'Rigger\'s duty belt - the standard for tactical professionals worldwide.',
            'Moisture-wicking tactical t-shirt that keeps you cool and dry in any situation.',
            'Operator-style cap with adjustable fit and professional look.',
            'All-weather tactical gloves that maintain dexterity in extreme conditions.',
            'Military-grade watch with features operators need in the field.',
            'Modular pouch system that adapts to your mission requirements.'
        ];
        return descriptions[Math.floor(Math.random() * descriptions.length)];
    }

    getTikTokHashtags() {
        return [
            '#TacticalGear', '#MilitaryGear', '#OutdoorGear', '#KhakiSol',
            '#TacticalLife', '#GearReview', '#MilitaryStyle', '#OperatorGear',
            '#FieldGear', '#TacticalEquipment', '#MilitaryBoots', '#CombatGear'
        ];
    }

    generateInstagramTitle() {
        const titles = [
            'KhakiSol Desert Combat Boots',
            'Tactical Cargo Pants Review',
            'Windproof Field Jacket',
            '40L Tactical Backpack',
            'Rigger Duty Belt',
            'Moisture Wicking T-Shirt',
            'Operator Style Cap',
            'All-Weather Tactical Gloves',
            'Military Grade Watch',
            'MOLLE Pouch System'
        ];
        return titles[Math.floor(Math.random() * titles.length)];
    }

    generateInstagramDescription() {
        const descriptions = [
            'Built for extreme durability and comfort. These desert combat boots feature reinforced toe caps, breathable mesh panels, and slip-resistant soles. Perfect for outdoor adventures and tactical operations. #KhakiSol #TacticalGear',
            'Tactical cargo pants designed for professionals. Multiple pockets, reinforced knees, and water-resistant fabric. Available in Khaki and Olive Drab. #MilitaryGear #TacticalPants',
            'Windproof field jacket that protects against the elements. Lightweight yet durable, with multiple pockets for organization. Essential gear for any outdoor enthusiast. #FieldJacket #OutdoorGear',
            '40-liter tactical backpack with MOLLE webbing. Perfect for hiking, camping, or tactical operations. Durable construction and ergonomic design. #TacticalBackpack #GearReview',
            'Professional rigger\'s duty belt with quick-release buckle. Adjustable sizing and durable construction. The standard choice for tactical professionals. #DutyBelt #TacticalEquipment',
            'Moisture-wicking tactical t-shirt that keeps you cool and dry. Reinforced shoulders and underarm panels. Available in multiple colors. #TacticalShirt #MilitaryStyle',
            'Operator-style tactical cap with adjustable fit. Professional appearance with functional design. Perfect for any tactical situation. #OperatorCap #TacticalHeadwear',
            'All-weather tactical gloves that maintain dexterity in extreme conditions. Reinforced palms and flexible materials. #TacticalGloves #MilitaryGloves',
            'Military-grade tactical watch with luminous dial and durable construction. Features operators need in the field. #TacticalWatch #MilitaryWatch',
            'Modular MOLLE pouch system that adapts to your needs. Compatible with most tactical platforms. #MOLLE #TacticalPouches'
        ];
        return descriptions[Math.floor(Math.random() * descriptions.length)];
    }

    getInstagramHashtags() {
        return [
            '#KhakiSol', '#TacticalGear', '#MilitaryGear', '#OutdoorGear',
            '#TacticalLife', '#GearReview', '#MilitaryStyle', '#OperatorGear',
            '#FieldGear', '#TacticalEquipment', '#CombatGear', '#MilitaryBoots',
            '#TacticalPants', '#FieldJacket', '#TacticalBackpack', '#DutyBelt'
        ];
    }

    generateCreatorOutreachTitle() {
        const titles = [
            'Tactical Gear Collaboration Opportunity',
            'KhakiSol Product Review Partnership',
            'Military-Grade Equipment Testing',
            'Outdoor Gear Brand Partnership',
            'Tactical Equipment Review'
        ];
        return titles[Math.floor(Math.random() * titles.length)];
    }

    generateCreatorOutreachMessage() {
        return `Hi [Creator Name],

I came across your amazing content and thought you'd be perfect for reviewing our KhakiSol tactical gear. We're a brand focused on military-grade equipment for outdoor enthusiasts and professionals.

We'd love to send you our [Product Name] for an honest review. Our gear is designed for real-world use - durable, functional, and built to last.

Would you be interested in collaborating? We can discuss the details and make sure it aligns with your audience.

Looking forward to hearing from you!

Best,
[Your Name]
KhakiSol`;
    }

    getCreatorTargets() {
        // In a real implementation, this would pull from a database of potential creators
        return [
            { handle: '@tactical_gear_pro', followers: 12500, niche: 'tactical gear' },
            { handle: '@outdoor_enthusiast', followers: 8900, niche: 'outdoor adventure' },
            { handle: '@military_gear_review', followers: 15600, niche: 'military equipment' },
            { handle: '@field_operations', followers: 7200, niche: 'field operations' }
        ];
    }

    generateEmailTitle() {
        const titles = [
            'Welcome to KhakiSol - Your Tactical Gear Journey Begins',
            'KhakiSol Exclusive: Early Access to New Products',
            'Tactical Gear Tips: Getting Started with KhakiSol',
            'Your KhakiSol Order Confirmation',
            'KhakiSol Care Guide: Maintaining Your Gear'
        ];
        return titles[Math.floor(Math.random() * titles.length)];
    }

    generateEmailSubject() {
        const subjects = [
            'Welcome to KhakiSol! Here\'s 10% Off Your First Order',
            'Your Tactical Gear Journey Starts Here',
            'KhakiSol: Built for Those Who Demand Excellence',
            'New Arrivals: Military-Grade Tactical Equipment',
            'Gear Care Tips from KhakiSol Professionals'
        ];
        return subjects[Math.floor(Math.random() * subjects.length)];
    }

    generateEmailContent() {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>KhakiSol Welcome</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
        <img src="https://khakisol.com/logo.png" alt="KhakiSol" style="max-width: 200px;">
        <h1 style="color: #2c3e50;">Welcome to KhakiSol</h1>
    </div>

    <div style="padding: 20px;">
        <p>Thank you for joining the KhakiSol community!</p>

        <p>You're now part of a select group of outdoor enthusiasts and professionals who demand the highest quality tactical gear.</p>

        <h2>Your Exclusive Welcome Offer</h2>
        <p>Use code <strong>WELCOME10</strong> for 10% off your first order.</p>

        <div style="background-color: #ecf0f1; padding: 15px; margin: 20px 0; border-left: 4px solid #3498db;">
            <h3>Featured Product: Desert Combat Boots</h3>
            <p>Military-grade desert combat boots designed for extreme durability and comfort.</p>
            <a href="https://khakisol.com/products/desert-combat-boots" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Shop Now</a>
        </div>

        <p>Stay connected for tactical gear tips, product updates, and exclusive offers.</p>

        <p>Best regards,<br>The KhakiSol Team</p>
    </div>

    <div style="background-color: #34495e; color: white; padding: 20px; text-align: center;">
        <p>KhakiSol - Built for Those Who Demand Excellence</p>
        <p><a href="https://khakisol.com" style="color: #3498db;">Visit Our Store</a> | <a href="https://khakisol.com/unsubscribe" style="color: #3498db;">Unsubscribe</a></p>
    </div>
</body>
</html>`;
    }

    // ─────────────────────────────────────────────────────────────
    // CONTENT EXECUTION
    // ─────────────────────────────────────────────────────────────

    async executeDailyContent() {
        console.log('🚀 Executing daily content plan...');

        const today = new Date().toISOString().split('T')[0];
        const todaysContent = this.contentQueue.find(plan => plan.date === today);

        if (!todaysContent) {
            console.log('No content plan found for today');
            return;
        }

        for (const content of todaysContent.content) {
            if (content.status === 'draft' && this.shouldExecuteContent(content)) {
                await this.executeContent(content);
                content.status = 'posted';
                content.postedAt = new Date().toISOString();
            }
        }

        this.saveContentQueue();
        console.log('✅ Daily content execution complete');
    }

    shouldExecuteContent(content) {
        const now = new Date();
        const scheduledTime = new Date(content.scheduledTime);
        const timeDiff = (now - scheduledTime) / (1000 * 60); // minutes

        // Execute if within 30 minutes of scheduled time
        return Math.abs(timeDiff) <= 30;
    }

    async executeContent(content) {
        console.log(`📤 Executing content: ${content.title}`);

        try {
            switch (content.type) {
                case 'tiktok_reel':
                    await this.postToTikTok(content);
                    break;
                case 'instagram_post':
                    await this.postToInstagram(content);
                    break;
                case 'creator_outreach':
                    await this.sendCreatorOutreach(content);
                    break;
                case 'email':
                    await this.sendEmail(content);
                    break;
            }

            // Track in Notion
            if (this.notionDashboard) {
                await this.notionDashboard.scheduleContent({
                    type: this.mapContentType(content.type),
                    title: content.title,
                    publishDate: new Date().toISOString().split('T')[0],
                    platforms: [this.mapPlatform(content.type)],
                    audience: '🎯 Tactical Enthusiasts',
                    expectedReach: this.getExpectedReach(content.type),
                    notes: content.description
                });
            }

        } catch (error) {
            console.error(`Failed to execute content ${content.title}:`, error.message);
            content.status = 'failed';
            content.error = error.message;
        }
    }

    async postToTikTok(content) {
        // In a real implementation, this would use TikTok's API
        console.log(`🎥 Posting to TikTok: ${content.title}`);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Track the post
        this.postedContent.push({
            ...content,
            platform: 'tiktok',
            postedAt: new Date().toISOString()
        });
    }

    async postToInstagram(content) {
        // In a real implementation, this would use Instagram's API or a scheduling tool
        console.log(`📸 Posting to Instagram: ${content.title}`);

        await new Promise(resolve => setTimeout(resolve, 1000));

        this.postedContent.push({
            ...content,
            platform: 'instagram',
            postedAt: new Date().toISOString()
        });
    }

    async sendCreatorOutreach(content) {
        console.log(`💬 Sending creator outreach: ${content.title}`);

        // In a real implementation, this would use email or DM APIs
        for (const target of content.targets.slice(0, 3)) { // Limit to 3 per day
            console.log(`  → Reaching out to ${target.handle} (${target.followers} followers)`);
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        this.postedContent.push({
            ...content,
            platform: 'creator_outreach',
            postedAt: new Date().toISOString()
        });
    }

    async sendEmail(content) {
        console.log(`📧 Sending email: ${content.title}`);

        // In a real implementation, this would use an email service like SendGrid
        console.log(`  → Subject: ${content.subject}`);
        console.log(`  → Recipients: Welcome flow subscribers`);

        await new Promise(resolve => setTimeout(resolve, 1000));

        this.postedContent.push({
            ...content,
            platform: 'email',
            postedAt: new Date().toISOString()
        });
    }

    // ─────────────────────────────────────────────────────────────
    // UTILITY METHODS
    // ─────────────────────────────────────────────────────────────

    getRandomTime(date, startHour, endHour) {
        const randomHour = Math.floor(Math.random() * (endHour - startHour)) + startHour;
        const randomMinute = Math.floor(Math.random() * 60);
        const scheduledTime = new Date(date);
        scheduledTime.setHours(randomHour, randomMinute, 0, 0);
        return scheduledTime.toISOString();
    }

    shouldDoCreatorOutreach(date) {
        // Do creator outreach 3 times per week
        const dayOfWeek = date.getDay();
        return [1, 3, 5].includes(dayOfWeek); // Monday, Wednesday, Friday
    }

    shouldSendEmail(date) {
        // Send emails on Tuesdays and Thursdays
        const dayOfWeek = date.getDay();
        return [2, 4].includes(dayOfWeek);
    }

    mapContentType(type) {
        const typeMap = {
            'tiktok_reel': '🎥 TikTok Reel',
            'instagram_post': '📸 Instagram Post',
            'creator_outreach': '💬 Creator Outreach',
            'email': '📧 Email'
        };
        return typeMap[type] || type;
    }

    mapPlatform(type) {
        const platformMap = {
            'tiktok_reel': 'TikTok',
            'instagram_post': 'Instagram',
            'creator_outreach': 'Instagram',
            'email': 'Email'
        };
        return platformMap[type] || 'Social';
    }

    getExpectedReach(type) {
        const reachMap = {
            'tiktok_reel': 5000,
            'instagram_post': 3000,
            'creator_outreach': 15000,
            'email': 500
        };
        return reachMap[type] || 1000;
    }

    // ─────────────────────────────────────────────────────────────
    // PERSISTENCE
    // ─────────────────────────────────────────────────────────────

    loadContentQueue() {
        try {
            const filePath = path.join(process.cwd(), 'data', 'content-queue.json');

            if (fs.existsSync(filePath)) {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                this.contentQueue = data.contentQueue || [];
                this.postedContent = data.postedContent || [];
            }
        } catch (error) {
            console.log('No existing content queue found');
        }
    }

    saveContentQueue() {
        try {
            const dir = path.join(process.cwd(), 'data');

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            const filePath = path.join(dir, 'content-queue.json');
            fs.writeFileSync(filePath, JSON.stringify({
                contentQueue: this.contentQueue,
                postedContent: this.postedContent,
                lastUpdated: new Date().toISOString()
            }, null, 2));
        } catch (error) {
            console.error('Failed to save content queue:', error.message);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // REPORTING
    // ─────────────────────────────────────────────────────────────

    getContentReport(days = 7) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const recentContent = this.postedContent.filter(
            content => new Date(content.postedAt) > cutoffDate
        );

        const byType = {};
        const byPlatform = {};

        recentContent.forEach(content => {
            byType[content.type] = (byType[content.type] || 0) + 1;
            byPlatform[content.platform] = (byPlatform[content.platform] || 0) + 1;
        });

        return {
            period: { days, startDate: cutoffDate.toISOString().split('T')[0] },
            totalContent: recentContent.length,
            byType,
            byPlatform,
            topPerforming: this.getTopPerformingContent(recentContent),
            engagement: this.calculateEngagement(recentContent)
        };
    }

    getTopPerformingContent(content) {
        // Mock performance calculation
        return content.slice(0, 3).map(item => ({
            title: item.title,
            type: item.type,
            platform: item.platform,
            estimatedReach: this.getExpectedReach(item.type),
            postedAt: item.postedAt
        }));
    }

    calculateEngagement(content) {
        // Mock engagement metrics
        const totalReach = content.reduce((sum, item) => sum + this.getExpectedReach(item.type), 0);
        const avgEngagement = Math.random() * 0.05 + 0.02; // 2-7% engagement

        return {
            totalReach,
            avgEngagement,
            totalEngagements: Math.floor(totalReach * avgEngagement)
        };
    }
}

export default ContentScheduler;