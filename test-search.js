const fetch = require('node-fetch');

// Test the search API
async function testSearchAPI() {
  try {
    console.log('🔍 Testing Search API...\n');
    
    // Test 1: Get all appointments first
    console.log('1. Getting all appointments:');
    const allResponse = await fetch('http://localhost:5001/api/appointments');
    
    if (allResponse.ok) {
      const allData = await allResponse.json();
      console.log(`   ✅ Found ${allData.results || 0} appointments`);
      console.log(`   📊 Sample data:`, JSON.stringify(allData.data?.[0] || {}, null, 2));
    } else {
      console.log(`   ❌ Failed: ${allResponse.status} ${allResponse.statusText}`);
    }
    
    console.log('\n2. Testing search for "consultation":');
    const searchResponse = await fetch('http://localhost:5001/api/appointments/search?query=consultation&searchType=type');
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      console.log(`   ✅ Search found ${searchData.results || 0} appointments`);
      console.log(`   🔍 Search results:`, JSON.stringify(searchData, null, 2));
    } else {
      console.log(`   ❌ Search failed: ${searchResponse.status} ${searchResponse.statusText}`);
    }
    
    console.log('\n3. Testing search for "follow-up":');
    const followUpResponse = await fetch('http://localhost:5001/api/appointments/search?query=follow-up&searchType=type');
    
    if (followUpResponse.ok) {
      const followUpData = await followUpResponse.json();
      console.log(`   ✅ Follow-up search found ${followUpData.results || 0} appointments`);
      console.log(`   🔍 Follow-up results:`, JSON.stringify(followUpData, null, 2));
    } else {
      console.log(`   ❌ Follow-up search failed: ${followUpResponse.status} ${followUpResponse.statusText}`);
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

testSearchAPI();