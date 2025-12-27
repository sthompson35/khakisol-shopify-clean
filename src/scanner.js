import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║              🔍 KHAKISOL PROJECT SCANNER                         ║
 * ║         Scans and reports on project health & status             ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

class ProjectScanner {
    constructor() {
        this.issues = [];
        this.warnings = [];
        this.successes = [];
    }

    async scan() {
        console.log('\n' + '═'.repeat(60));
        console.log('🔍 KHAKISOL PROJECT SCANNER');
        console.log('═'.repeat(60));

        await this.checkEnvironment();
        await this.checkFiles();
        await this.checkShopifyConnection();
        await this.checkOpenAIConnection();
        this.generateReport();
    }

    async checkEnvironment() {
        console.log('\n📋 ENVIRONMENT CHECK');
        console.log('─'.repeat(40));

        const requiredVars = [
            'SHOPIFY_STORE_URL',
            'SHOPIFY_ADMIN_ACCESS_TOKEN',
            'SHOPIFY_API_KEY',
            'SHOPIFY_API_SECRET',
            'OPENAI_API_KEY'
        ];

        const optionalVars = [
            'NOTIFICATION_EMAIL',
            'WEBHOOK_SECRET',
            'N8N_HOST_URL'
        ];

        requiredVars.forEach(v => {
            if (process.env[v] && process.env[v] !== `YOUR_${v}_HERE`) {
                console.log(`   ✅ ${v}: Configured`);
                this.successes.push(`${v} is configured`);
            } else {
                console.log(`   ❌ ${v}: Missing`);
                this.issues.push(`${v} is not configured`);
            }
        });

        optionalVars.forEach(v => {
            if (process.env[v] && !process.env[v].includes('YOUR_')) {
                console.log(`   ✅ ${v}: Configured`);
            } else {
                console.log(`   ⚠️  ${v}: Not set (optional)`);
                this.warnings.push(`${v} is not configured (optional)`);
            }
        });
    }

    async checkFiles() {
        console.log('\n📁 FILE STRUCTURE CHECK');
        console.log('─'.repeat(40));

        const requiredFiles = [
            '.env',
            'package.json',
            'src/index.js',
            'src/server.js',
            'src/aiTroopers.js',
            'src/aiStoreManager.js',
            'src/client/shopifyClient.js'
        ];

        const requiredDirs = [
            'src',
            'src/client',
            'src/services',
            'config',
            'data'
        ];

        requiredDirs.forEach(dir => {
            const fullPath = path.join(rootDir, dir);
            if (fs.existsSync(fullPath)) {
                console.log(`   ✅ ${dir}/`);
            } else {
                console.log(`   ❌ ${dir}/ - Missing`);
                this.issues.push(`Directory ${dir} is missing`);
            }
        });

        requiredFiles.forEach(file => {
            const fullPath = path.join(rootDir, file);
            if (fs.existsSync(fullPath)) {
                const stats = fs.statSync(fullPath);
                const size = (stats.size / 1024).toFixed(1);
                console.log(`   ✅ ${file} (${size} KB)`);
            } else {
                console.log(`   ❌ ${file} - Missing`);
                this.issues.push(`File ${file} is missing`);
            }
        });

        // Count files
        const srcFiles = this.countFiles(path.join(rootDir, 'src'));
        console.log(`\n   📊 Total source files: ${srcFiles}`);
    }

    countFiles(dir) {
        let count = 0;
        if (!fs.existsSync(dir)) return 0;
        
        const items = fs.readdirSync(dir);
        items.forEach(item => {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                count += this.countFiles(fullPath);
            } else if (item.endsWith('.js')) {
                count++;
            }
        });
        return count;
    }

    async checkShopifyConnection() {
        console.log('\n🛍️  SHOPIFY CONNECTION');
        console.log('─'.repeat(40));

        if (!process.env.SHOPIFY_STORE_URL || !process.env.SHOPIFY_ADMIN_ACCESS_TOKEN) {
            console.log('   ❌ Cannot test - credentials missing');
            return;
        }

        try {
            const data = await this.makeShopifyRequest('/shop.json');
            console.log(`   ✅ Connected to: ${data.shop.name}`);
            console.log(`   📍 Store URL: ${data.shop.domain}`);
            console.log(`   💰 Currency: ${data.shop.currency}`);
            console.log(`   🌍 Country: ${data.shop.country_name}`);
            this.successes.push('Shopify connection working');

            // Get counts
            const [products, orders, customers] = await Promise.all([
                this.makeShopifyRequest('/products/count.json'),
                this.makeShopifyRequest('/orders/count.json?status=any'),
                this.makeShopifyRequest('/customers/count.json')
            ]);

            console.log(`\n   📦 Products: ${products.count}`);
            console.log(`   📋 Orders: ${orders.count}`);
            console.log(`   👥 Customers: ${customers.count}`);

        } catch (error) {
            console.log(`   ❌ Connection failed: ${error.message}`);
            this.issues.push('Shopify connection failed');
        }
    }

    async checkOpenAIConnection() {
        console.log('\n🤖 OPENAI CONNECTION');
        console.log('─'.repeat(40));

        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('YOUR_')) {
            console.log('   ❌ Cannot test - API key missing');
            return;
        }

        try {
            const data = await this.makeOpenAIRequest('/v1/models');
            const gptModels = data.data.filter(m => m.id.includes('gpt')).length;
            console.log(`   ✅ API Key valid`);
            console.log(`   🤖 GPT Models available: ${gptModels}`);
            this.successes.push('OpenAI connection working');
        } catch (error) {
            console.log(`   ❌ Connection failed: ${error.message}`);
            this.issues.push('OpenAI connection failed');
        }
    }

    makeShopifyRequest(endpoint) {
        return new Promise((resolve, reject) => {
            const url = `https://${process.env.SHOPIFY_STORE_URL}/admin/api/2024-01${endpoint}`;
            const urlObj = new URL(url);
            
            const options = {
                hostname: urlObj.hostname,
                port: 443,
                path: urlObj.pathname,
                method: 'GET',
                headers: {
                    'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
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
                        reject(new Error(`${res.statusCode}`));
                    }
                });
            });
            req.on('error', reject);
            req.end();
        });
    }

    makeOpenAIRequest(endpoint) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.openai.com',
                port: 443,
                path: endpoint,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(JSON.parse(data));
                    } else {
                        reject(new Error(`${res.statusCode}`));
                    }
                });
            });
            req.on('error', reject);
            req.end();
        });
    }

    generateReport() {
        console.log('\n' + '═'.repeat(60));
        console.log('📊 SCAN REPORT');
        console.log('═'.repeat(60));

        const total = this.issues.length + this.warnings.length + this.successes.length;
        const health = ((this.successes.length / total) * 100).toFixed(0);

        console.log(`\n   🏥 Project Health: ${health}%`);
        console.log(`   ✅ Passed: ${this.successes.length}`);
        console.log(`   ⚠️  Warnings: ${this.warnings.length}`);
        console.log(`   ❌ Issues: ${this.issues.length}`);

        if (this.issues.length > 0) {
            console.log('\n   🔴 ISSUES TO FIX:');
            this.issues.forEach(i => console.log(`      • ${i}`));
        }

        if (this.warnings.length > 0) {
            console.log('\n   🟡 WARNINGS:');
            this.warnings.forEach(w => console.log(`      • ${w}`));
        }

        console.log('\n' + '═'.repeat(60));

        if (this.issues.length === 0) {
            console.log('✅ PROJECT READY - All systems operational!');
        } else {
            console.log('⚠️  Fix issues above before deploying');
        }
        console.log('═'.repeat(60));
    }
}

const scanner = new ProjectScanner();
scanner.scan().catch(console.error);
