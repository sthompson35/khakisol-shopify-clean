import ShopifyClient from './client/shopifyClient.js';

/**
 * Add customers to your Shopify store
 */

// Define your customers here (without phone numbers to avoid validation issues)
const customers = [
  {
    first_name: "John",
    last_name: "Smith",
    email: "john.smith@email.com",
    verified_email: true,
    accepts_marketing: true,
    tags: "vip, repeat-customer",
    addresses: [
      {
        address1: "123 Main Street",
        address2: "Apt 4B",
        city: "New York",
        province: "NY",
        zip: "10001",
        country: "US",
        default: true,
      }
    ],
    send_email_welcome: false,
  },
  {
    first_name: "Sarah",
    last_name: "Johnson",
    email: "sarah.johnson@email.com",
    verified_email: true,
    accepts_marketing: true,
    tags: "new-customer",
    addresses: [
      {
        address1: "456 Oak Avenue",
        city: "Los Angeles",
        province: "CA",
        zip: "90001",
        country: "US",
        default: true,
      }
    ],
    send_email_welcome: false,
  },
  {
    first_name: "Michael",
    last_name: "Williams",
    email: "michael.williams@email.com",
    verified_email: true,
    accepts_marketing: false,
    tags: "wholesale",
    addresses: [
      {
        address1: "789 Pine Road",
        city: "Chicago",
        province: "IL",
        zip: "60601",
        country: "US",
        default: true,
      }
    ],
    send_email_welcome: false,
  },
  {
    first_name: "Emily",
    last_name: "Brown",
    email: "emily.brown@email.com",
    verified_email: true,
    accepts_marketing: true,
    tags: "vip, loyalty-member",
    addresses: [
      {
        address1: "321 Elm Street",
        city: "Houston",
        province: "TX",
        zip: "77001",
        country: "US",
        default: true,
      }
    ],
    send_email_welcome: false,
  },
  {
    first_name: "David",
    last_name: "Garcia",
    email: "david.garcia@email.com",
    verified_email: true,
    accepts_marketing: true,
    tags: "repeat-customer",
    addresses: [
      {
        address1: "654 Maple Drive",
        city: "Phoenix",
        province: "AZ",
        zip: "85001",
        country: "US",
        default: true,
      }
    ],
    send_email_welcome: false,
  },
  {
    first_name: "Jessica",
    last_name: "Martinez",
    email: "jessica.martinez@email.com",
    verified_email: true,
    accepts_marketing: true,
    tags: "new-customer",
    addresses: [
      {
        address1: "987 Cedar Lane",
        city: "Philadelphia",
        province: "PA",
        zip: "19101",
        country: "US",
        default: true,
      }
    ],
    send_email_welcome: false,
  },
  {
    first_name: "James",
    last_name: "Anderson",
    email: "james.anderson@email.com",
    verified_email: true,
    accepts_marketing: false,
    tags: "wholesale, business",
    addresses: [
      {
        address1: "147 Birch Boulevard",
        city: "San Antonio",
        province: "TX",
        zip: "78201",
        country: "US",
        default: true,
      }
    ],
    send_email_welcome: false,
  },
  {
    first_name: "Amanda",
    last_name: "Taylor",
    email: "amanda.taylor@email.com",
    verified_email: true,
    accepts_marketing: true,
    tags: "vip, influencer",
    addresses: [
      {
        address1: "258 Walnut Way",
        city: "San Diego",
        province: "CA",
        zip: "92101",
        country: "US",
        default: true,
      }
    ],
    send_email_welcome: false,
  },
  {
    first_name: "Robert",
    last_name: "Thomas",
    email: "robert.thomas@email.com",
    verified_email: true,
    accepts_marketing: true,
    tags: "loyalty-member",
    addresses: [
      {
        address1: "369 Spruce Street",
        city: "Dallas",
        province: "TX",
        zip: "75201",
        country: "US",
        default: true,
      }
    ],
    send_email_welcome: false,
  },
  {
    first_name: "Jennifer",
    last_name: "Jackson",
    email: "jennifer.jackson@email.com",
    verified_email: true,
    accepts_marketing: true,
    tags: "new-customer",
    addresses: [
      {
        address1: "741 Aspen Court",
        city: "San Jose",
        province: "CA",
        zip: "95101",
        country: "US",
        default: true,
      }
    ],
    send_email_welcome: false,
  }
];

async function addCustomers() {
  console.log('👥 Adding Customers to KhakiSol Store\n');
  console.log('='.repeat(50));

  const shopify = new ShopifyClient();
  const results = { success: [], failed: [] };

  for (const customer of customers) {
    try {
      console.log(`\n➕ Adding: ${customer.first_name} ${customer.last_name}...`);
      const response = await shopify.createCustomer(customer);
      
      console.log(`   ✅ Created successfully!`);
      console.log(`   ID: ${response.customer.id}`);
      console.log(`   Email: ${response.customer.email}`);
      
      results.success.push({
        name: `${customer.first_name} ${customer.last_name}`,
        id: response.customer.id,
        email: response.customer.email
      });
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      results.failed.push({
        name: `${customer.first_name} ${customer.last_name}`,
        error: error.message
      });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Successfully added: ${results.success.length} customers`);
  console.log(`❌ Failed: ${results.failed.length} customers`);

  if (results.success.length > 0) {
    console.log('\n✅ Added Customers:');
    results.success.forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.name} - ${c.email} (ID: ${c.id})`);
    });
  }

  if (results.failed.length > 0) {
    console.log('\n❌ Failed Customers:');
    results.failed.forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.name}: ${c.error}`);
    });
  }

  console.log('\n🔗 View your customers at:');
  console.log('   https://admin.shopify.com/store/pygcet-kp/customers');
  console.log('');
}

addCustomers();
