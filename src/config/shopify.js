import dotenv from 'dotenv';
dotenv.config();

export const shopifyConfig = {
  storeUrl: process.env.SHOPIFY_STORE_URL,
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecret: process.env.SHOPIFY_API_SECRET,
  accessToken: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
  clientId: process.env.SHOPIFY_CLIENT_ID,
  clientSecret: process.env.SHOPIFY_CLIENT_SECRET,
  apiVersion: process.env.SHOPIFY_API_VERSION || '2024-01',
};

// Validate required configuration
export function validateConfig() {
  const required = ['storeUrl', 'accessToken'];
  const missing = required.filter(key => !shopifyConfig[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required Shopify configuration: ${missing.join(', ')}`);
  }
  
  return true;
}

export default shopifyConfig;
