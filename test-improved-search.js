// Test improved appointment search logic
console.log('=== IMPROVED APPOINTMENT SEARCH TESTS ===\n');

// Sample appointments data
const appointments = [
  {
    _id: 'sample-1',
    patient: 'user123',
    doctor: {
      _id: 'doc1',
      firstName: 'John',
      lastName: 'Smith'
    },
    department: {
      _id: 'dept1',
      name: 'Cardiology'
    },
    appointmentDate: new Date().toISOString(),
    appointmentTime: '10:00',
    type: 'consultation',
    status: 'scheduled',
    reason: 'Regular check-up for heart health',
    notes: 'Patient has history of high blood pressure'
  },
  {
    _id: 'sample-2',
    patient: 'user123',
    doctor: {
      _id: 'doc2',
      firstName: 'Sarah',
      lastName: 'Johnson'
    },
    department: {
      _id: 'dept2',
      name: 'Neurology'
    },
    appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    appointmentTime: '14:30',
    type: 'follow-up',
    status: 'confirmed',
    reason: 'Follow-up after MRI scan',
    notes: 'Review scan results and discuss treatment options'
  },
  {
    _id: 'sample-3',
    patient: 'user123',
    doctor: {
      _id: 'doc3',
      firstName: 'Robert',
      lastName: 'Williams'
    },
    department: {
      _id: 'dept3',
      name: 'Emergency'
    },
    appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    appointmentTime: '09:15',
    type: 'emergency',
    status: 'scheduled',
    reason: 'Urgent consultation for chest pain',
    notes: 'Patient experiencing chest discomfort'
  }
];

// Improved search function
const searchAppointments = (appointments, searchTerm, searchType = 'all') => {
  if (!searchTerm.trim()) {
    return appointments;
  }
  
  const query = searchTerm.toLowerCase().trim();
  
  return appointments.filter(appointment => {
    // Extract searchable fields
    const appointmentType = (appointment.type || '').toLowerCase();
    const doctorName = appointment.doctor && typeof appointment.doctor === 'object'
      ? `${appointment.doctor.firstName || ''} ${appointment.doctor.lastName || ''}`.toLowerCase()
      : '';
    const doctorFirstName = appointment.doctor && typeof appointment.doctor === 'object'
      ? (appointment.doctor.firstName || '').toLowerCase()
      : '';
    const doctorLastName = appointment.doctor && typeof appointment.doctor === 'object'
      ? (appointment.doctor.lastName || '').toLowerCase()
      : '';
    const departmentName = appointment.department && typeof appointment.department === 'object'
      ? appointment.department.name?.toLowerCase() || ''
      : '';
    const reason = (appointment.reason || '').toLowerCase();
    const notes = (appointment.notes || '').toLowerCase();
    
    // Perform search based on type
    let matches = false;
    
    switch (searchType) {
      case 'type':
        matches = appointmentType.includes(query);
        break;
        
      case 'doctor':
        // Precise doctor search using word boundaries
        if (query.includes(' ')) {
          // Multi-word query: search full name
          matches = doctorName.includes(query);
        } else {
          // Single word query: use exact word matching
          // Create a regex that matches the query as a complete word
          const wordBoundaryRegex = new RegExp(`\\b${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          matches = wordBoundaryRegex.test(doctorName);
        }
        break;
        
      case 'department':
        matches = departmentName.includes(query);
        break;
        
      case 'reason':
        matches = reason.includes(query) || notes.includes(query);
        break;
        
      case 'all':
      default:
        // Use improved doctor search logic for 'all' search as well
        let doctorMatch = false;
        if (query.includes(' ')) {
          // Multi-word query: search full name
          doctorMatch = doctorName.includes(query);
        } else {
          // Single word query: use exact word matching
          const wordBoundaryRegex = new RegExp(`\\b${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          doctorMatch = wordBoundaryRegex.test(doctorName);
        }
        
        matches = appointmentType.includes(query) || 
                 doctorMatch || 
                 departmentName.includes(query) || 
                 reason.includes(query) || 
                 notes.includes(query);
        break;
    }
    
    return matches;
  });
};

// Test cases
const testCases = [
  { query: 'consultation', searchType: 'type', expected: 1, description: 'Type search for "consultation"' },
  { query: 'john', searchType: 'doctor', expected: 1, description: 'Doctor search for "john" (should only match John Smith, not Sarah Johnson)' },
  { query: 'johnson', searchType: 'doctor', expected: 1, description: 'Doctor search for "johnson" (should only match Sarah Johnson)' },
  { query: 'sarah', searchType: 'doctor', expected: 1, description: 'Doctor search for "sarah"' },
  { query: 'john smith', searchType: 'doctor', expected: 1, description: 'Doctor search for full name "john smith"' },
  { query: 'cardiology', searchType: 'department', expected: 1, description: 'Department search for "cardiology"' },
  { query: 'chest', searchType: 'reason', expected: 1, description: 'Reason search for "chest"' },
  { query: 'follow', searchType: 'all', expected: 1, description: 'All fields search for "follow"' },
  { query: 'john', searchType: 'all', expected: 1, description: 'All fields search for "john" (should only match John Smith)' }
];

let passedTests = 0;
let totalTests = testCases.length;

testCases.forEach((testCase, index) => {
  const results = searchAppointments(appointments, testCase.query, testCase.searchType);
  const actualCount = results.length;
  const passed = actualCount === testCase.expected;
  
  console.log(`${index + 1}. ${testCase.description}:`);
  console.log(`   Expected: ${testCase.expected} appointment(s)`);
  console.log(`   Actual: ${actualCount} appointment(s)`);
  
  if (results.length > 0) {
    results.forEach(result => {
      const doctorName = result.doctor ? `${result.doctor.firstName} ${result.doctor.lastName}` : 'N/A';
      console.log(`   - ${result.type} with Dr. ${doctorName} (${result.department.name})`);
    });
  }
  
  console.log(`   Status: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log('');
  
  if (passed) passedTests++;
});

console.log('=== TEST SUMMARY ===');
console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
console.log(`${passedTests === totalTests ? '🎉 ALL TESTS PASSED!' : '⚠️ SOME TESTS FAILED'}`);