import shopifyConfig, { validateConfig } from '../config/shopify.js';

/**
 * Shopify Admin API Client
 * Handles all REST and GraphQL API requests
 */
class ShopifyClient {
  constructor() {
    validateConfig();
    this.baseUrl = `https://${shopifyConfig.storeUrl}/admin/api/${shopifyConfig.apiVersion}`;
    this.graphqlUrl = `https://${shopifyConfig.storeUrl}/admin/api/${shopifyConfig.apiVersion}/graphql.json`;
    this.accessToken = shopifyConfig.accessToken;
  }

  /**
   * Get default headers for API requests
   */
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': this.accessToken,
    };
  }

  /**
   * Make a REST API request
   * @param {string} endpoint - API endpoint (e.g., '/products.json')
   * @param {string} method - HTTP method
   * @param {object} body - Request body for POST/PUT
   */
  async request(endpoint, method = 'GET', body = null) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const options = {
      method,
      headers: this.getHeaders(),
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Shopify API Error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Shopify API Request Failed:', error.message);
      throw error;
    }
  }

  /**
   * Make a GraphQL API request
   * @param {string} query - GraphQL query or mutation
   * @param {object} variables - Query variables
   */
  async graphql(query, variables = {}) {
    const options = {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ query, variables }),
    };

    try {
      const response = await fetch(this.graphqlUrl, options);
      const data = await response.json();

      if (data.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(data.errors)}`);
      }

      return data.data;
    } catch (error) {
      console.error('Shopify GraphQL Request Failed:', error.message);
      throw error;
    }
  }

  // ============ PRODUCTS ============

  /**
   * Get all products
   * @param {object} params - Query parameters (limit, fields, etc.)
   */
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/products.json${queryString ? '?' + queryString : ''}`;
    return this.request(endpoint);
  }

  /**
   * Get a single product by ID
   */
  async getProduct(productId) {
    return this.request(`/products/${productId}.json`);
  }

  /**
   * Create a new product
   */
  async createProduct(productData) {
    return this.request('/products.json', 'POST', { product: productData });
  }

  /**
   * Update a product
   */
  async updateProduct(productId, productData) {
    return this.request(`/products/${productId}.json`, 'PUT', { product: productData });
  }

  /**
   * Delete a product
   */
  async deleteProduct(productId) {
    return this.request(`/products/${productId}.json`, 'DELETE');
  }

  // ============ ORDERS ============

  /**
   * Get all orders
   */
  async getOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/orders.json${queryString ? '?' + queryString : ''}`;
    return this.request(endpoint);
  }

  /**
   * Get a single order by ID
   */
  async getOrder(orderId) {
    return this.request(`/orders/${orderId}.json`);
  }

  /**
   * Get order count
   */
  async getOrderCount(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/orders/count.json${queryString ? '?' + queryString : ''}`;
    return this.request(endpoint);
  }

  // ============ CUSTOMERS ============

  /**
   * Get all customers
   */
  async getCustomers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/customers.json${queryString ? '?' + queryString : ''}`;
    return this.request(endpoint);
  }

  /**
   * Get a single customer by ID
   */
  async getCustomer(customerId) {
    return this.request(`/customers/${customerId}.json`);
  }

  /**
   * Create a new customer
   */
  async createCustomer(customerData) {
    return this.request('/customers.json', 'POST', { customer: customerData });
  }

  /**
   * Search customers
   */
  async searchCustomers(query) {
    return this.request(`/customers/search.json?query=${encodeURIComponent(query)}`);
  }

  // ============ INVENTORY ============

  /**
   * Get inventory levels
   */
  async getInventoryLevels(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/inventory_levels.json${queryString ? '?' + queryString : ''}`;
    return this.request(endpoint);
  }

  /**
   * Adjust inventory level
   */
  async adjustInventory(inventoryItemId, locationId, adjustment) {
    return this.request('/inventory_levels/adjust.json', 'POST', {
      location_id: locationId,
      inventory_item_id: inventoryItemId,
      available_adjustment: adjustment,
    });
  }

  // ============ COLLECTIONS ============

  /**
   * Get custom collections
   */
  async getCustomCollections(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/custom_collections.json${queryString ? '?' + queryString : ''}`;
    return this.request(endpoint);
  }

  /**
   * Get smart collections
   */
  async getSmartCollections(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/smart_collections.json${queryString ? '?' + queryString : ''}`;
    return this.request(endpoint);
  }

  // ============ SHOP INFO ============

  /**
   * Get shop information
   */
  async getShop() {
    return this.request('/shop.json');
  }
}

export default ShopifyClient;
