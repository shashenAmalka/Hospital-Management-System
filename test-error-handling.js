/**
 * Comprehensive Error Handling Test Script for Pharmacy Dispense System
 * 
 * This script tests the enhanced error handling implemented in:
 * - Backend: PharmacyItemController.js (dispensePharmacyItem function)
 * - Frontend API: api.js (apiRequest with retry logic)
 * - Frontend UI: PharmacistDashboard.jsx (detailed error display)
 */

const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000/api';
const AUTH_TOKEN = 'your-test-token-here'; // Replace with actual token

// Helper function to make API requests
async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(AUTH_TOKEN && { Authorization: `Bearer ${AUTH_TOKEN}` })
    },
    ...options
  };

  console.log(`\n🧪 Testing: ${config.method || 'GET'} ${url}`);
  if (config.body) {
    console.log('📦 Request Body:', JSON.parse(config.body));
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    console.log('📦 Response Data:', JSON.stringify(data, null, 2));
    
    return { response, data };
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    return { error };
  }
}

// Test cases for different error scenarios
const testCases = [
  {
    name: 'Invalid Item ID Format',
    test: async () => {
      return await makeRequest('/medication/items/invalid-id-123/dispense', {
        method: 'POST',
        body: JSON.stringify({
          quantity: 1,
          reason: 'Test invalid ID'
        })
      });
    },
    expectedErrorCode: 'INVALID_ITEM_ID'
  },
  
  {
    name: 'Non-existent Item ID',
    test: async () => {
      return await makeRequest('/medication/items/507f1f77bcf86cd799439011/dispense', {
        method: 'POST',
        body: JSON.stringify({
          quantity: 1,
          reason: 'Test non-existent item'
        })
      });
    },
    expectedErrorCode: 'ITEM_NOT_FOUND'
  },
  
  {
    name: 'Invalid Quantity (Negative)',
    test: async () => {
      // First get a valid item ID
      const { data: items } = await makeRequest('/medication/items');
      const validItemId = items?.data?.[0]?._id;
      
      if (!validItemId) {
        console.log('⚠️ No items available for testing');
        return { data: { message: 'No items available' } };
      }
      
      return await makeRequest(`/medication/items/${validItemId}/dispense`, {
        method: 'POST',
        body: JSON.stringify({
          quantity: -5,
          reason: 'Test negative quantity'
        })
      });
    },
    expectedErrorCode: 'INVALID_QUANTITY'
  },
  
  {
    name: 'Invalid Quantity (Zero)',
    test: async () => {
      // First get a valid item ID
      const { data: items } = await makeRequest('/medication/items');
      const validItemId = items?.data?.[0]?._id;
      
      if (!validItemId) {
        console.log('⚠️ No items available for testing');
        return { data: { message: 'No items available' } };
      }
      
      return await makeRequest(`/medication/items/${validItemId}/dispense`, {
        method: 'POST',
        body: JSON.stringify({
          quantity: 0,
          reason: 'Test zero quantity'
        })
      });
    },
    expectedErrorCode: 'INVALID_QUANTITY'
  },
  
  {
    name: 'Excessive Quantity (More than available)',
    test: async () => {
      // First get a valid item ID
      const { data: items } = await makeRequest('/medication/items');
      const validItem = items?.data?.[0];
      
      if (!validItem) {
        console.log('⚠️ No items available for testing');
        return { data: { message: 'No items available' } };
      }
      
      const excessiveQuantity = (validItem.quantity || 0) + 1000;
      
      return await makeRequest(`/medication/items/${validItem._id}/dispense`, {
        method: 'POST',
        body: JSON.stringify({
          quantity: excessiveQuantity,
          reason: 'Test excessive quantity'
        })
      });
    },
    expectedErrorCode: 'INSUFFICIENT_QUANTITY'
  },
  
  {
    name: 'Valid Dispense Request',
    test: async () => {
      // First get a valid item ID with sufficient quantity
      const { data: items } = await makeRequest('/medication/items');
      const validItem = items?.data?.find(item => item.quantity > 0);
      
      if (!validItem) {
        console.log('⚠️ No items with quantity > 0 available for testing');
        return { data: { message: 'No items with sufficient quantity' } };
      }
      
      return await makeRequest(`/medication/items/${validItem._id}/dispense`, {
        method: 'POST',
        body: JSON.stringify({
          quantity: 1,
          reason: 'Test valid dispense'
        })
      });
    },
    expectedSuccess: true
  }
];

// Function to run all tests
async function runTests() {
  console.log('🧪 Starting Error Handling Tests for Pharmacy Dispense System');
  console.log('=' * 80);
  
  const results = [];
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n📋 Test ${i + 1}/${testCases.length}: ${testCase.name}`);
    console.log('-'.repeat(50));
    
    try {
      const result = await testCase.test();
      
      if (result.error) {
        console.log('❌ Test failed with network error:', result.error.message);
        results.push({
          name: testCase.name,
          status: 'NETWORK_ERROR',
          error: result.error.message
        });
        continue;
      }
      
      const { response, data } = result;
      const errorCode = data?.errorCode;
      const isSuccess = response?.status >= 200 && response?.status < 300;
      
      // Validate test results
      if (testCase.expectedSuccess && isSuccess) {
        console.log('✅ Test passed: Valid request succeeded');
        results.push({
          name: testCase.name,
          status: 'PASSED',
          result: 'Success as expected'
        });
      } else if (testCase.expectedErrorCode && errorCode === testCase.expectedErrorCode) {
        console.log(`✅ Test passed: Got expected error code '${errorCode}'`);
        results.push({
          name: testCase.name,
          status: 'PASSED',
          result: `Got expected error code: ${errorCode}`
        });
      } else if (testCase.expectedErrorCode && !errorCode) {
        console.log(`⚠️ Test partially passed: Expected error code '${testCase.expectedErrorCode}' but got generic error`);
        results.push({
          name: testCase.name,
          status: 'PARTIAL',
          result: `Expected ${testCase.expectedErrorCode} but got generic error`
        });
      } else if (!testCase.expectedSuccess && !isSuccess) {
        console.log('✅ Test passed: Request failed as expected');
        results.push({
          name: testCase.name,
          status: 'PASSED',
          result: 'Failed as expected'
        });
      } else {
        console.log('❌ Test failed: Unexpected result');
        results.push({
          name: testCase.name,
          status: 'FAILED',
          result: 'Unexpected result'
        });
      }
      
    } catch (error) {
      console.log('❌ Test threw an exception:', error.message);
      results.push({
        name: testCase.name,
        status: 'EXCEPTION',
        error: error.message
      });
    }
    
    // Wait between tests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));
  
  const passed = results.filter(r => r.status === 'PASSED').length;
  const partial = results.filter(r => r.status === 'PARTIAL').length;
  const failed = results.filter(r => r.status === 'FAILED').length;
  const errors = results.filter(r => r.status === 'NETWORK_ERROR' || r.status === 'EXCEPTION').length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`⚠️ Partial: ${partial}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`💥 Errors: ${errors}`);
  console.log(`📊 Total: ${results.length}`);
  
  console.log('\nDetailed Results:');
  results.forEach((result, index) => {
    const emoji = result.status === 'PASSED' ? '✅' : 
                  result.status === 'PARTIAL' ? '⚠️' : 
                  result.status === 'FAILED' ? '❌' : '💥';
    console.log(`${emoji} ${index + 1}. ${result.name}: ${result.result || result.error}`);
  });
  
  console.log('\n🏁 Testing complete!');
}

// Check if this script is being run directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests, testCases };