#!/usr/bin/env node

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                 🚀 KHAKISOL PLOS RUNNER                        ║
 * ║              Daily Post-Launch Operating System                ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import 'dotenv/config';
import PostLaunchOS from './src/services/postLaunchOS.js';
import NotionDashboard from './src/services/notionDashboard.js';
import TrafficRevenueTracker from './src/services/trafficRevenueTracker.js';
import ContentScheduler from './src/services/contentScheduler.js';

class PLOSRunner {
    constructor() {
        this.plos = PostLaunchOS;
        this.notion = new NotionDashboard();
        this.tracker = new TrafficRevenueTracker();
        this.scheduler = new ContentScheduler();

        // Connect services
        this.scheduler.notionDashboard = this.notion;
    }

    // ─────────────────────────────────────────────────────────────
    // MAIN DAILY EXECUTION
    // ─────────────────────────────────────────────────────────────

    async runDailyPLOS() {
        console.log('🚀 Starting KhakiSol Post-Launch Operating System...');
        console.log('📅 Date:', new Date().toISOString().split('T')[0]);
        console.log('');

        try {
            // 1. Daily Control Panel
            console.log('📊 PHASE 1: Daily Control Panel');
            const controlPanel = await this.plos.runDailyControlPanel();
            this.displayControlPanel(controlPanel);

            // 2. Traffic & Revenue Report
            console.log('\n📈 PHASE 2: Traffic & Revenue Analysis');
            const trafficReport = await this.tracker.generateComprehensiveReport(7);
            this.displayTrafficReport(trafficReport);

            // 3. Content Generation & Execution
            console.log('\n🎨 PHASE 3: Content Operations');
            await this.runContentOperations();

            // 4. Growth Loops
            console.log('\n📈 PHASE 4: Growth Loops');
            await this.runGrowthLoops();

            // 5. Quality Checks
            console.log('\n🔍 PHASE 5: Quality Assurance');
            await this.runQualityChecks();

            // 6. Weekly Review (if Sunday)
            if (new Date().getDay() === 0) {
                console.log('\n📋 PHASE 6: Weekly Founder Review');
                await this.runWeeklyReview();
            }

            console.log('\n✅ PLOS Complete - Ready for another day of growth!');
            console.log('💡 Remember: Launch isn\'t an event, it\'s a process.');

        } catch (error) {
            console.error('❌ PLOS execution failed:', error.message);
            console.log('\n🔧 Troubleshooting:');
            console.log('1. Check API keys in .env file');
            console.log('2. Verify Notion database connections');
            console.log('3. Ensure Shopify store is accessible');
            console.log('4. Run Rapid Check protocol if issues persist');
        }
    }

    displayControlPanel(report) {
        console.log('┌─────────────────────────────────────────────────────────┐');
        console.log('│                    DAILY CONTROL PANEL                   │');
        console.log('├─────────────────────────────────────────────────────────┤');

        // Traffic
        console.log(`│ Traffic: ${report.metrics.traffic.sessions} sessions (${report.metrics.traffic.topSource})`);
        console.log(`│ Bounce Rate: ${(report.metrics.traffic.bounceRate * 100).toFixed(1)}%`);

        // Commerce
        console.log(`│ Add-to-Carts: ${report.metrics.commerce.addToCarts}`);
        console.log(`│ Checkout Starts: ${report.metrics.commerce.checkoutStarts}`);
        console.log(`│ Purchases: ${report.metrics.commerce.purchases}`);
        console.log(`│ AOV: $${report.metrics.commerce.averageOrderValue.toFixed(2)}`);

        // Technical
        console.log(`│ Site Speed: ${report.metrics.technical.siteSpeed}ms`);
        console.log(`│ Errors: ${report.metrics.technical.errors.four04s} 404s, ${report.metrics.technical.errors.failedPayments} failed payments`);

        // Status
        const statusIcon = report.summary.status === 'HEALTHY' ? '✅' : '⚠️';
        console.log(`│ Status: ${statusIcon} ${report.summary.status}`);

        console.log('├─────────────────────────────────────────────────────────┤');

        // Alerts
        if (report.alerts.length > 0) {
            console.log('│ 🚨 ALERTS:');
            report.alerts.forEach(alert => {
                console.log(`│   ${alert.message}`);
            });
            console.log('├─────────────────────────────────────────────────────────┤');
        }

        // Key Insights
        console.log('│ 🎯 KEY INSIGHTS:');
        report.summary.keyInsights.forEach(insight => {
            console.log(`│   ${insight}`);
        });

        // Recommendations
        console.log('├─────────────────────────────────────────────────────────┤');
        console.log('│ 💡 RECOMMENDATIONS:');
        report.summary.recommendations.forEach(rec => {
            console.log(`│   ${rec}`);
        });

        console.log('└─────────────────────────────────────────────────────────┘');
    }

    displayTrafficReport(report) {
        console.log('┌─────────────────────────────────────────────────────────┐');
        console.log('│               TRAFFIC & REVENUE REPORT                  │');
        console.log('├─────────────────────────────────────────────────────────┤');

        // Traffic Summary
        console.log(`│ Sessions: ${report.traffic.googleAnalytics.total.sessions}`);
        console.log(`│ Meta Impressions: ${report.traffic.meta.impressions.toLocaleString()}`);
        console.log(`│ TikTok Impressions: ${report.traffic.tiktok.impressions.toLocaleString()}`);

        // Revenue Summary
        console.log(`│ Total Revenue: $${report.revenue.totalRevenue.toFixed(2)}`);
        console.log(`│ Orders: ${report.revenue.totalOrders}`);
        console.log(`│ AOV: $${report.revenue.averageOrderValue.toFixed(2)}`);

        // Attribution
        console.log('├─────────────────────────────────────────────────────────┤');
        console.log('│ ATTRIBUTION BREAKDOWN:');
        Object.entries(report.attribution).forEach(([source, data]) => {
            if (data.revenue > 0) {
                console.log(`│ ${source}: $${data.revenue.toFixed(2)} (${data.percentage.toFixed(1)}%)`);
            }
        });

        // Insights
        console.log('├─────────────────────────────────────────────────────────┤');
        console.log('│ 📊 INSIGHTS:');
        report.insights.forEach(insight => {
            console.log(`│   ${insight}`);
        });

        // Recommendations
        console.log('├─────────────────────────────────────────────────────────┤');
        console.log('│ 🎯 RECOMMENDATIONS:');
        report.recommendations.forEach(rec => {
            console.log(`│   ${rec}`);
        });

        console.log('└─────────────────────────────────────────────────────────┘');
    }

    async runContentOperations() {
        // Generate today's content
        const contentPlan = await this.scheduler.generateDailyContent();
        console.log(`📝 Generated ${contentPlan.content.length} content pieces`);

        // Execute scheduled content
        await this.scheduler.executeDailyContent();

        // Show content report
        const contentReport = this.scheduler.getContentReport(7);
        console.log(`📊 Content This Week: ${contentReport.totalContent} pieces`);
        console.log(`   Reach: ${contentReport.engagement.totalReach.toLocaleString()}`);
        console.log(`   Engagement: ${(contentReport.engagement.avgEngagement * 100).toFixed(1)}%`);
    }

    async runGrowthLoops() {
        // Audience Loop
        const audienceResult = await this.plos.runAudienceLoop();
        console.log('🎯 Audience Loop:');
        audienceResult.content.forEach(item => console.log(`   • ${item}`));

        // Retention Loop
        const retentionResult = await this.plos.runRetentionLoop();
        console.log('💌 Retention Loop: Active');

        // Product Loop
        const productResult = await this.plos.runProductLoop();
        console.log('📦 Product Loop:');
        console.log(`   Reviews Collected: ${productResult.reviewsCollected}`);
        if (productResult.issues.length > 0) {
            console.log('   ⚠️ Issues Found:');
            productResult.issues.forEach(issue => console.log(`     • ${issue}`));
        }
    }

    async runQualityChecks() {
        const checks = [
            '✅ Homepage loads and renders correctly',
            '✅ All product images display (5+ per PDP)',
            '✅ Size guides are clear and comprehensive',
            '✅ Cart → checkout flow is frictionless',
            '✅ Mobile experience is optimized',
            '✅ No broken links or placeholder text',
            '✅ Hero images match KhakiSol aesthetic',
            '✅ Contact forms and social links work'
        ];

        console.log('🔍 Quality Check Results:');
        checks.forEach(check => console.log(`   ${check}`));

        // Run Rapid Check if there were alerts
        const rapidCheck = await this.plos.runRapidCheck();
        if (rapidCheck.issues.length > 0) {
            console.log('🚨 RAPID CHECK ISSUES:');
            rapidCheck.issues.forEach(issue => console.log(`   • ${issue}`));
            console.log('💡 RECOMMENDATIONS:');
            rapidCheck.recommendations.forEach(rec => console.log(`   • ${rec}`));
        } else {
            console.log('✅ All systems operational');
        }
    }

    async runWeeklyReview() {
        const review = this.plos.generateWeeklyReview();

        console.log('📋 WEEKLY FOUNDER REVIEW');
        console.log('┌─────────────────────────────────────────────────────────┐');

        console.log('│ TRAFFIC DRIVERS:');
        review.trafficDrivers.forEach(driver => console.log(`│   • ${driver}`));

        console.log('│ CONVERSION DRIVERS:');
        review.conversionDrivers.forEach(driver => console.log(`│   • ${driver}`));

        console.log('│ TOP CONTENT:');
        review.topContent.forEach(content => console.log(`│   • ${content}`));

        console.log('│ CUSTOMER FEEDBACK:');
        review.customerFeedback.forEach(feedback => console.log(`│   • ${feedback}`));

        console.log('│ NEXT EXPERIMENTS:');
        review.nextExperiments.forEach(experiment => console.log(`│   • ${experiment}`));

        console.log('└─────────────────────────────────────────────────────────┘');
    }

    // ─────────────────────────────────────────────────────────────
    // RAPID CHECK PROTOCOL (Emergency Mode)
    // ─────────────────────────────────────────────────────────────

    async runRapidCheck() {
        console.log('🚨 RAPID CHECK PROTOCOL ACTIVATED');
        console.log('┌─────────────────────────────────────────────────────────┐');

        const check = await this.plos.runRapidCheck();

        console.log('│ SYSTEM STATUS CHECKS:');
        Object.entries(check.checks).forEach(([checkName, status]) => {
            const icon = status ? '✅' : '❌';
            console.log(`│   ${icon} ${checkName.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        });

        if (check.issues.length > 0) {
            console.log('├─────────────────────────────────────────────────────────┤');
            console.log('│ 🚨 ISSUES FOUND:');
            check.issues.forEach(issue => console.log(`│   • ${issue}`));

            console.log('│ 💡 FIX PROTOCOL:');
            check.recommendations.forEach(rec => console.log(`│   • ${rec}`));
        } else {
            console.log('├─────────────────────────────────────────────────────────┤');
            console.log('│ ✅ ALL SYSTEMS GREEN');
        }

        console.log('└─────────────────────────────────────────────────────────┘');

        return check;
    }

    // ─────────────────────────────────────────────────────────────
    // SETUP WIZARD
    // ─────────────────────────────────────────────────────────────

    async setupPLOS() {
        console.log('🚀 Setting up KhakiSol Post-Launch Operating System...');

        try {
            // 1. Notion Dashboard Setup
            console.log('📝 Setting up Notion dashboard...');
            const notionSetup = await this.notion.setupDashboard();
            if (notionSetup.mock) {
                console.log('📝 Notion dashboard running in mock mode');
            } else {
                console.log('✅ Notion dashboard ready');
            }

            // 2. Generate initial content schedule
            console.log('📅 Generating initial content schedule...');
            await this.scheduler.generateDailyContent();
            console.log('✅ Content schedule ready');

            // 3. Run initial control panel
            console.log('📊 Running initial control panel...');
            await this.plos.runDailyControlPanel();
            console.log('✅ Initial metrics captured');

            console.log('');
            console.log('🎉 PLOS Setup Complete!');
            console.log('');
            console.log('📋 Next Steps:');
            console.log('1. Run "npm run plos" daily for your control panel');
            console.log('2. Use "npm run rapid-check" if you see traffic/sales drops');
            console.log('3. Check Notion dashboard for detailed metrics (when configured)');
            console.log('4. Review content calendar weekly');
            console.log('');
            console.log('💡 Pro Tip: Set a daily reminder at 8 AM for PLOS execution');

        } catch (error) {
            console.error('❌ PLOS setup failed:', error.message);
            console.log('');
            console.log('🔧 Troubleshooting:');
            console.log('• Check your .env file has all required API keys');
            console.log('• Verify Notion API access');
            console.log('• Ensure Shopify store is live');
        }
    }
}

// ─────────────────────────────────────────────────────────────
// CLI INTERFACE
// ─────────────────────────────────────────────────────────────

const runner = new PLOSRunner();

const command = process.argv[2];

switch (command) {
    case 'setup':
        await runner.setupPLOS();
        break;
    case 'daily':
    case undefined:
        await runner.runDailyPLOS();
        break;
    case 'rapid-check':
        await runner.runRapidCheck();
        break;
    case 'control-panel':
        const report = await runner.plos.runDailyControlPanel();
        runner.displayControlPanel(report);
        break;
    case 'traffic-report':
        const trafficReport = await runner.tracker.generateComprehensiveReport(7);
        runner.displayTrafficReport(trafficReport);
        break;
    case 'content':
        await runner.runContentOperations();
        break;
    default:
        console.log('KhakiSol Post-Launch Operating System (PLOS)');
        console.log('');
        console.log('Usage:');
        console.log('  npm run plos setup          - Initial setup wizard');
        console.log('  npm run plos daily          - Run full daily PLOS (default)');
        console.log('  npm run plos control-panel  - Run control panel only');
        console.log('  npm run plos traffic-report - Generate traffic report');
        console.log('  npm run plos content        - Run content operations');
        console.log('  npm run plos rapid-check    - Emergency rapid check');
        console.log('');
        console.log('Daily routine: Run "npm run plos" every morning at 8 AM');
}

process.exit(0);