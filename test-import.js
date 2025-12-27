// Test script to check imports
import fs from 'fs';
import ShopifyClient from './src/client/shopifyClient.js';

console.log('✅ Imports successful');
console.log('📁 Testing CSV access...');

const csvPath = 'c:\\Users\\sdtho\\Downloads\\khakisol-products-FIXED.csv';
try {
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  console.log(`📊 CSV loaded: ${lines.length} lines`);
  console.log('🎯 First line:', lines[0]);
} catch (error) {
  console.error('❌ CSV error:', error.message);
}

console.log('🏁 Test complete');