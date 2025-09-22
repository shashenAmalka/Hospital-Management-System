// Simple test to check staff endpoint
fetch('http://localhost:5000/api/staff')
  .then(response => {
    console.log('Response status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Staff data:', data);
    if (data.data && data.data.staff) {
      console.log('Number of staff members:', data.data.staff.length);
      data.data.staff.forEach((staff, index) => {
        console.log(`Staff ${index + 1}:`, {
          id: staff._id,
          name: `${staff.firstName} ${staff.lastName}`,
          role: staff.role,
          department: staff.department
        });
      });
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });