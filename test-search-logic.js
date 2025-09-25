// Simple test for appointment search functionality
const sampleAppointments = [
  {
    _id: 'sample-1',
    patient: 'user123',
    doctor: {
      firstName: 'John',
      lastName: 'Smith'
    },
    department: {
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
      firstName: 'Sarah',
      lastName: 'Johnson'
    },
    department: {
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
      firstName: 'Robert',
      lastName: 'Williams'
    },
    department: {
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

function testSearch(appointments, searchTerm, searchType) {
  const query = searchTerm.toLowerCase().trim();
  
  const filtered = appointments.filter(appointment => {
    const appointmentType = (appointment.type || '').toLowerCase();
    const doctorName = appointment.doctor 
      ? `${appointment.doctor.firstName || ''} ${appointment.doctor.lastName || ''}`.toLowerCase()
      : '';
    const departmentName = appointment.department?.name?.toLowerCase() || '';
    const reason = (appointment.reason || '').toLowerCase();
    const notes = (appointment.notes || '').toLowerCase();
    
    switch (searchType) {
      case 'type':
        return appointmentType.includes(query);
      case 'doctor':
        // Precise doctor search using word boundaries
        if (query.includes(' ')) {
          // Multi-word query: search full name
          return doctorName.includes(query);
        } else {
          // Single word query: use exact word matching
          // Create a regex that matches the query as a complete word
          const wordBoundaryRegex = new RegExp(`\\b${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          return wordBoundaryRegex.test(doctorName);
        }
      case 'department':
        return departmentName.includes(query);
      case 'reason':
        return reason.includes(query) || notes.includes(query);
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
        
        return appointmentType.includes(query) || 
               doctorMatch || 
               departmentName.includes(query) || 
               reason.includes(query) || 
               notes.includes(query);
    }
  });
  
  return filtered;
}

// Run tests
console.log('=== APPOINTMENT SEARCH TESTS ===');

console.log('\n1. Search for "consultation" in type:');
const test1 = testSearch(sampleAppointments, 'consultation', 'type');
console.log('Results:', test1.length, 'appointments found');
console.log('Expected: 1 appointment (consultation)');
console.log('Actual types found:', test1.map(a => a.type));

console.log('\n2. Search for "john" in doctor:');
const test2 = testSearch(sampleAppointments, 'john', 'doctor');
console.log('Results:', test2.length, 'appointments found');
console.log('Expected: 1 appointment (Dr. John Smith)');
console.log('Actual doctors found:', test2.map(a => `${a.doctor.firstName} ${a.doctor.lastName}`));

console.log('\n3. Search for "cardiology" in department:');
const test3 = testSearch(sampleAppointments, 'cardiology', 'department');
console.log('Results:', test3.length, 'appointments found');
console.log('Expected: 1 appointment (Cardiology department)');
console.log('Actual departments found:', test3.map(a => a.department.name));

console.log('\n4. Search for "chest" in reason:');
const test4 = testSearch(sampleAppointments, 'chest', 'reason');
console.log('Results:', test4.length, 'appointments found');
console.log('Expected: 1 appointment (chest pain/discomfort)');
console.log('Actual reasons found:', test4.map(a => a.reason));

console.log('\n5. Search for "follow" in all:');
const test5 = testSearch(sampleAppointments, 'follow', 'all');
console.log('Results:', test5.length, 'appointments found');
console.log('Expected: 1 appointment (follow-up type)');
console.log('Actual matches:', test5.map(a => ({ type: a.type, reason: a.reason })));

console.log('\n=== TEST SUMMARY ===');
const tests = [
  { name: 'Type search', passed: test1.length === 1 && test1[0].type === 'consultation' },
  { name: 'Doctor search', passed: test2.length === 1 && test2[0].doctor.firstName === 'John' },
  { name: 'Department search', passed: test3.length === 1 && test3[0].department.name === 'Cardiology' },
  { name: 'Reason search', passed: test4.length === 1 && test4[0].reason.includes('chest') },
  { name: 'All fields search', passed: test5.length === 1 && test5[0].type === 'follow-up' }
];

tests.forEach(test => {
  console.log(`${test.passed ? '✅' : '❌'} ${test.name}: ${test.passed ? 'PASSED' : 'FAILED'}`);
});

const allPassed = tests.every(test => test.passed);
console.log(`\n🎯 Overall: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);