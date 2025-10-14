/**
 * Test Script: Verify Notification System
 * 
 * This script helps test if notifications are being created correctly
 * Run this in MongoDB shell or as a Node.js script with mongoose
 */

// TEST 1: Check if notifications exist in database
console.log('\n📊 TEST 1: Check Notifications in Database');
console.log('Run this in MongoDB shell:');
console.log('--------------------------------------------');
console.log(`
db.notifications.find().sort({ createdAt: -1 }).limit(5).pretty()
`);
console.log('Expected: Should show recent notifications with patient user IDs');

// TEST 2: Count notifications by type
console.log('\n📊 TEST 2: Count Notifications by Type');
console.log('--------------------------------------------');
console.log(`
db.notifications.aggregate([
  { $group: { _id: "$type", count: { $sum: 1 } } }
])
`);
console.log('Expected: Should show counts for info, warning, critical types');

// TEST 3: Check unread notifications for specific user
console.log('\n📊 TEST 3: Check Unread Notifications for User');
console.log('Replace USER_ID with actual patient user ID:');
console.log('--------------------------------------------');
console.log(`
db.notifications.find({ 
  user: ObjectId("USER_ID"), 
  read: false 
}).sort({ createdAt: -1 }).pretty()
`);
console.log('Expected: Should show unread notifications for that user');

// TEST 4: Check lab requests with completed status
console.log('\n📊 TEST 4: Check Completed Lab Requests');
console.log('--------------------------------------------');
console.log(`
db.labrequests.find({ 
  status: "completed" 
}).sort({ completedAt: -1 }).limit(5).pretty()
`);
console.log('Expected: Should show recently completed lab requests');

// TEST 5: Verify notification was created for completed request
console.log('\n📊 TEST 5: Verify Notification for Completed Request');
console.log('Replace LAB_REQUEST_ID with actual request ID:');
console.log('--------------------------------------------');
console.log(`
// First find the lab request
var labRequest = db.labrequests.findOne({ _id: ObjectId("LAB_REQUEST_ID") })
print("Lab Request Patient ID:", labRequest.patientId)
print("Lab Request Status:", labRequest.status)

// Then find notification for that patient
db.notifications.find({ 
  user: labRequest.patientId,
  "relatedTo.id": ObjectId("LAB_REQUEST_ID")
}).pretty()
`);
console.log('Expected: Should show notification linked to that lab request');

// TEST 6: Test API endpoint directly (use curl or Postman)
console.log('\n📊 TEST 6: Test API Endpoint Directly');
console.log('Replace YOUR_AUTH_TOKEN with actual token:');
console.log('--------------------------------------------');
console.log(`
curl -X GET http://localhost:5000/api/notifications \\
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \\
  -H "Content-Type: application/json"
`);
console.log('Expected: Should return JSON with success:true and data array');

// TEST 7: Manual notification creation test
console.log('\n📊 TEST 7: Manual Notification Creation (Node.js)');
console.log('Save as test-notification.js and run: node test-notification.js');
console.log('--------------------------------------------');
console.log(`
const mongoose = require('mongoose');
const Notification = require('./backend/Model/NotificationModel');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/hospital-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Create test notification
async function testNotification() {
  try {
    const notification = new Notification({
      user: 'REPLACE_WITH_PATIENT_USER_ID', // ObjectId string
      title: 'Test Notification',
      message: 'This is a test notification to verify the system works',
      type: 'info',
      read: false,
      relatedTo: {
        model: 'Test',
        id: new mongoose.Types.ObjectId()
      }
    });
    
    await notification.save();
    console.log('✅ Test notification created:', notification._id);
    console.log('Check your notification bell icon now!');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error creating test notification:', error);
    mongoose.connection.close();
  }
}

testNotification();
`);

// TEST 8: Frontend console test
console.log('\n📊 TEST 8: Frontend Console Test');
console.log('Open browser console (F12) and run:');
console.log('--------------------------------------------');
console.log(`
// Test notification service
const token = localStorage.getItem('token') || sessionStorage.getItem('token');
console.log('Auth token:', token);

fetch('http://localhost:5000/api/notifications', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => {
  console.log('✅ Notifications API Response:', data);
  console.log('Notification count:', data.results);
  console.log('Notifications:', data.data);
})
.catch(error => console.error('❌ Error:', error));
`);
console.log('Expected: Should show notifications array in console');

// SUMMARY
console.log('\n' + '='.repeat(60));
console.log('🎯 TESTING SUMMARY');
console.log('='.repeat(60));
console.log(`
To verify the notification system is working:

1. ✅ Check Database: Run MongoDB queries to verify notifications exist
2. ✅ Check Backend Logs: Look for "Lab completion notification created"
3. ✅ Check API Response: Test /api/notifications endpoint directly
4. ✅ Check Frontend: Open bell icon and verify notifications appear
5. ✅ Check Browser Console: Look for notification fetch logs

If ALL tests pass → System is working! 🎉
If ANY test fails → Review logs and check NOTIFICATION_FIX_SUMMARY.md
`);
console.log('='.repeat(60) + '\n');

console.log('📝 Quick Checklist:');
console.log('   [ ] Backend server running on port 5000');
console.log('   [ ] Frontend server running (Vite dev server)');
console.log('   [ ] MongoDB connected and running');
console.log('   [ ] Patient user logged in');
console.log('   [ ] Lab tech submitted at least one report');
console.log('   [ ] Checked all console logs (backend + frontend)');
console.log('   [ ] Verified database has notification documents');
console.log('   [ ] Tested bell icon in UI\n');

module.exports = { 
  // Export for use in other test scripts
  testDescription: 'Notification System Verification Tests'
};
