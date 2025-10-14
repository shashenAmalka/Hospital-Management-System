/**
 * Quick Network Connectivity Test
 * Tests the health endpoint to verify server accessibility
 */

// Test server connectivity
async function testServerConnectivity() {
  const testUrl = 'http://localhost:5000/api/health';
  
  console.log('🧪 Testing server connectivity...');
  console.log('🎯 Target URL:', testUrl);
  
  try {
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      // Add a timeout
      signal: AbortSignal.timeout(5000)
    });
    
    console.log('📊 Response Status:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Server is healthy!');
      console.log('📦 Health Data:', JSON.stringify(data, null, 2));
      return true;
    } else {
      console.log('⚠️ Server responded with error status');
      const errorText = await response.text();
      console.log('📄 Error Response:', errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.name === 'AbortError') {
      console.log('⏱️ Request timed out - server may not be running');
    } else if (error.message.includes('fetch')) {
      console.log('🌐 Network error - check if server is running on localhost:5000');
    }
    
    return false;
  }
}

// Test API test endpoint
async function testAPIEndpoint() {
  const testUrl = 'http://localhost:5000/api/test';
  
  console.log('\n🧪 Testing API test endpoint...');
  console.log('🎯 Target URL:', testUrl);
  
  try {
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(5000)
    });
    
    console.log('📊 Response Status:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API test endpoint is working!');
      console.log('📦 Test Data:', JSON.stringify(data, null, 2));
      return true;
    } else {
      console.log('⚠️ API test endpoint error');
      return false;
    }
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    return false;
  }
}

// Test pharmacy items endpoint
async function testPharmacyEndpoint() {
  const testUrl = 'http://localhost:5000/api/medication/items';
  
  console.log('\n🧪 Testing pharmacy items endpoint...');
  console.log('🎯 Target URL:', testUrl);
  
  try {
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(10000)
    });
    
    console.log('📊 Response Status:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Pharmacy endpoint is working!');
      console.log('📊 Items count:', data?.data?.length || 0);
      return true;
    } else {
      console.log('⚠️ Pharmacy endpoint error');
      const errorText = await response.text();
      console.log('📄 Error:', errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Pharmacy endpoint test failed:', error.message);
    return false;
  }
}

// Run all tests
async function runConnectivityTests() {
  console.log('🏁 Starting Network Connectivity Tests');
  console.log('=' * 50);
  
  const tests = [
    { name: 'Server Health Check', test: testServerConnectivity },
    { name: 'API Test Endpoint', test: testAPIEndpoint },
    { name: 'Pharmacy Items Endpoint', test: testPharmacyEndpoint }
  ];
  
  const results = [];
  
  for (const { name, test } of tests) {
    console.log(`\n🧪 Running: ${name}`);
    console.log('-'.repeat(30));
    
    try {
      const success = await test();
      results.push({ name, success, error: null });
    } catch (error) {
      console.error(`💥 Test "${name}" threw an exception:`, error.message);
      results.push({ name, success: false, error: error.message });
    }
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  results.forEach((result, index) => {
    const emoji = result.success ? '✅' : '❌';
    console.log(`${emoji} ${index + 1}. ${result.name}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log(`\n📈 Results: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    console.log('\n🔧 Troubleshooting Tips:');
    console.log('1. Check if backend server is running: npm start (in backend directory)');
    console.log('2. Verify port 5000 is not blocked by firewall');
    console.log('3. Check if MongoDB connection is working');
    console.log('4. Review server logs for errors');
  } else {
    console.log('\n🎉 All tests passed! Server is accessible and working correctly.');
  }
}

// Run tests if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  runConnectivityTests().catch(error => {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
  });
}

// For browser environments
if (typeof window !== 'undefined') {
  window.runConnectivityTests = runConnectivityTests;
  console.log('🌐 Connectivity tests loaded. Run: runConnectivityTests()');
}

module.exports = {
  testServerConnectivity,
  testAPIEndpoint,
  testPharmacyEndpoint,
  runConnectivityTests
};