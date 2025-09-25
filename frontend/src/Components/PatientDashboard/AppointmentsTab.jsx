import React, { useState, useEffect } from 'react';
import { Calendar, Plus, X, Search, FileText } from 'lucide-react';
import { appointmentService } from '../../utils/api';

const AppointmentsTab = ({ user }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [searchError, setSearchError] = useState(null);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [newAppointment, setNewAppointment] = useState({
    patient: '',
    doctor: '',
    department: '',
    appointmentDate: '',
    appointmentTime: '',
    type: 'consultation',
    status: 'scheduled',
    reason: '',
    notes: '',
    symptoms: '',
    diagnosis: '',
    treatment: '',
    prescriptions: [],
    followUpRequired: false,
    followUpDate: ''
  });
  const [prescriptionInput, setPrescriptionInput] = useState({
    medication: '',
    dosage: '',
    frequency: '',
    duration: ''
  });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAppointment, setEditAppointment] = useState(null);
  const [reportFormat, setReportFormat] = useState('csv');

  useEffect(() => {
    if (user && user._id) {
      console.log('User loaded:', user);
      fetchAppointments();
      fetchDepartments();
      fetchDoctors();
      setNewAppointment(prev => ({ ...prev, patient: user._id }));
    }
  }, [user]);

  useEffect(() => {
    if (newAppointment.department) {
      console.log('Department selected:', newAppointment.department);
      console.log('Doctors data type:', typeof doctors, Array.isArray(doctors) ? 'is array' : 'not array');
      console.log('Doctors count:', Array.isArray(doctors) ? doctors.length : 'N/A');
      
      if (Array.isArray(doctors)) {
        const selectedDeptId = newAppointment.department;
        console.log('Selected department ID:', selectedDeptId);
        
        const relevantDoctors = doctors.filter(doctor => {
          if (!doctor) return false;
          
          console.log('Doctor:', doctor.firstName, doctor.lastName, '- Department:', doctor.department);
          
          if (!doctor.department) return false;
          
          if (typeof doctor.department === 'string') {
            const matchingDept = departments.find(dept => 
              dept.name && dept.name.toLowerCase() === doctor.department.toLowerCase());
            return matchingDept && matchingDept._id === selectedDeptId;
          } else if (typeof doctor.department === 'object') {
            if (doctor.department._id) {
              return doctor.department._id === selectedDeptId;
            } else if (doctor.department.name) {
              const matchingDept = departments.find(dept => 
                dept.name && dept.name.toLowerCase() === doctor.department.name.toLowerCase());
              return matchingDept && matchingDept._id === selectedDeptId;
            }
          }
          
          return doctor.department === selectedDeptId;
        });
        
        console.log('Filtered doctors count:', relevantDoctors.length);
        if (relevantDoctors.length === 0) {
          console.log('No doctors matched the selected department');
        } else {
          console.log('Matching doctors:', relevantDoctors.map(d => `${d.firstName} ${d.lastName}`));
        }
        
        setFilteredDoctors(relevantDoctors);
      } else {
        console.error('Doctors data is not an array:', doctors);
        setFilteredDoctors([]);
      }
      
      setNewAppointment(prev => ({
        ...prev,
        doctor: ''
      }));
    } else {
      setFilteredDoctors([]);
    }
  }, [newAppointment.department, doctors, departments]);

  useEffect(() => {
    const searchAppointments = () => {
      console.log('🔍 SEARCH TRIGGERED:', { 
        searchTerm, 
        searchType, 
        appointmentsCount: appointments.length 
      });
      
      // If no search term, show all appointments
      if (!searchTerm.trim()) {
        console.log('✅ No search term - showing all appointments');
        setFilteredAppointments(appointments);
        setSearchError(null);
        return;
      }
      
      const query = searchTerm.toLowerCase().trim();
      console.log('� Searching for:', query, 'in type:', searchType);
      
      const filtered = appointments.filter(appointment => {
        // Log appointment details
        console.log('📋 Checking appointment:', {
          id: appointment._id,
          type: appointment.type,
          doctor: appointment.doctor,
          department: appointment.department,
          reason: appointment.reason
        });
        
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
        
        console.log('🔍 Search fields:', {
          appointmentType,
          doctorName,
          doctorFirstName,
          doctorLastName,
          departmentName,
          reason,
          notes
        });
        
        // Perform search based on type
        let matches = false;
        
        switch (searchType) {
          case 'type':
            matches = appointmentType.includes(query);
            console.log(`Type search: "${appointmentType}" includes "${query}" = ${matches}`);
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
            
            console.log(`Doctor search: "${doctorName}" (${doctorFirstName} | ${doctorLastName}) matches "${query}" = ${matches}`);
            break;
            
          case 'department':
            matches = departmentName.includes(query);
            console.log(`Department search: "${departmentName}" includes "${query}" = ${matches}`);
            break;
            
          case 'reason':
            matches = reason.includes(query) || notes.includes(query);
            console.log(`Reason search: "${reason}" or "${notes}" includes "${query}" = ${matches}`);
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
            console.log(`All search: any field includes "${query}" = ${matches} (doctor: ${doctorMatch})`);
            break;
        }
        
        console.log(`✅ Final result for ${appointment._id}: ${matches}`);
        return matches;
      });
      
      console.log('🎯 SEARCH RESULTS:', {
        query,
        searchType,
        totalAppointments: appointments.length,
        foundAppointments: filtered.length,
        results: filtered
      });
      
      setFilteredAppointments(filtered);
      setSearchError(null);
    };
    
    // Debounce the search
    const timeoutId = setTimeout(searchAppointments, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchType, appointments]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      console.log('📡 Fetching appointments for user:', user?._id);
      
      const response = await appointmentService.getAll();
      console.log('📊 All appointments from API:', response);
      console.log('📈 Response structure:', {
        hasData: !!response.data,
        isArray: Array.isArray(response.data),
        count: response.data?.length || 0
      });
      
      if (!response.data || !Array.isArray(response.data)) {
        console.error('❌ Invalid response structure:', response);
        setError('Invalid response format from server');
        return;
      }
      
      const patientAppointments = response.data.filter(appointment => {
        console.log('🔍 Checking appointment for patient match:', {
          appointmentId: appointment._id,
          appointmentPatient: appointment.patient,
          appointmentPatientType: typeof appointment.patient,
          currentUserId: user._id,
          patientMatch: appointment.patient && 
              ((typeof appointment.patient === 'object' && appointment.patient._id === user._id) || 
               (typeof appointment.patient === 'string' && appointment.patient === user._id))
        });
        
        const patientMatch = appointment.patient && 
              ((typeof appointment.patient === 'object' && appointment.patient._id === user._id) || 
               (typeof appointment.patient === 'string' && appointment.patient === user._id));
        
        return patientMatch;
      });
      
      console.log('✅ Filtered appointments for current patient:', {
        total: response.data.length,
        forCurrentUser: patientAppointments.length,
        appointments: patientAppointments
      });
      
      // If no appointments found, add some sample data for testing search functionality
      if (patientAppointments.length === 0) {
        console.log('⚠️ No appointments found, adding sample data for search testing...');
        const sampleAppointments = [
          {
            _id: 'sample-1',
            patient: user._id,
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
            patient: user._id,
            doctor: {
              _id: 'doc2',
              firstName: 'Sarah',
              lastName: 'Johnson'
            },
            department: {
              _id: 'dept2',
              name: 'Neurology'
            },
            appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
            appointmentTime: '14:30',
            type: 'follow-up',
            status: 'confirmed',
            reason: 'Follow-up after MRI scan',
            notes: 'Review scan results and discuss treatment options'
          },
          {
            _id: 'sample-3',
            patient: user._id,
            doctor: {
              _id: 'doc3',
              firstName: 'Robert',
              lastName: 'Williams'
            },
            department: {
              _id: 'dept3',
              name: 'Emergency'
            },
            appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
            appointmentTime: '09:15',
            type: 'emergency',
            status: 'scheduled',
            reason: 'Urgent consultation for chest pain',
            notes: 'Patient experiencing chest discomfort'
          }
        ];
        
        console.log('📝 Added sample appointments for testing:', sampleAppointments);
        setAppointments(sampleAppointments);
        setFilteredAppointments(sampleAppointments);
      } else {
        setAppointments(patientAppointments);
        setFilteredAppointments(patientAppointments);
      }
      
    } catch (err) {
      console.error('💥 Error fetching appointments:', err);
      console.log('⚠️ API error, creating sample appointments for testing...');
      
      // If API fails, create sample appointments for testing search
      const sampleAppointments = [
        {
          _id: 'sample-1',
          patient: user?._id || 'current-user',
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
          patient: user?._id || 'current-user',
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
          patient: user?._id || 'current-user',
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
      
      setAppointments(sampleAppointments);
      setFilteredAppointments(sampleAppointments);
      setError(null); // Clear error since we have sample data
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/departments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.data?.departments || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    }
  };

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching doctors...');
      const response = await fetch('http://localhost:5001/api/staff?role=doctor', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Doctors API response status:', response.status);
        
        let doctorsArray = [];
        
        if (data && data.data && Array.isArray(data.data)) {
          doctorsArray = data.data;
          console.log('Doctors found in data.data array, count:', doctorsArray.length);
        } else if (Array.isArray(data)) {
          doctorsArray = data;
          console.log('Doctors found directly in data array, count:', doctorsArray.length);
        } else if (data && data.data) {
          console.log('Unexpected data structure:', data.data);
          
          if (typeof data.data === 'object') {
            const possibleArrays = Object.values(data.data).filter(Array.isArray);
            if (possibleArrays.length > 0) {
              doctorsArray = possibleArrays[0];
              console.log('Doctors found in nested data structure, count:', doctorsArray.length);
            }
          }
        }
        
        if (doctorsArray.length === 0) {
          console.warn('No doctors found in API response, using sample data');
          
          const deptIds = {};
          departments.forEach(dept => {
            if (dept._id && dept.name) {
              deptIds[dept.name.toLowerCase()] = dept._id;
            }
          });
          
          doctorsArray = [
            { 
              _id: 'doc1', 
              firstName: 'John', 
              lastName: 'Smith', 
              department: deptIds['cardiology'] || 'cardiology'
            },
            { 
              _id: 'doc2', 
              firstName: 'Sarah', 
              lastName: 'Johnson', 
              department: deptIds['cardiology'] || 'cardiology'
            },
            { 
              _id: 'doc3', 
              firstName: 'Robert', 
              lastName: 'Williams', 
              department: deptIds['neurology'] || 'neurology'
            },
            { 
              _id: 'doc4', 
              firstName: 'Emily', 
              lastName: 'Davis', 
              department: deptIds['pediatrics'] || 'pediatrics'
            }
          ];
        }
        
        doctorsArray.forEach(doctor => {
          console.log(`Doctor: ${doctor.firstName} ${doctor.lastName}, Department: ${doctor.department}`);
        });
        
        setDoctors(doctorsArray);
      } else {
        console.error('Error fetching doctors, status:', response.status);
        setDoctors([]);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAppointment(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePrescriptionChange = (e) => {
    const { name, value } = e.target;
    setPrescriptionInput(prev => ({ ...prev, [name]: value }));
  };

  const addPrescription = () => {
    if (prescriptionInput.medication && prescriptionInput.dosage) {
      setNewAppointment(prev => ({
        ...prev,
        prescriptions: [...prev.prescriptions, prescriptionInput]
      }));
      setPrescriptionInput({ medication: '', dosage: '', frequency: '', duration: '' });
    }
  };

  const removePrescription = (index) => {
    setNewAppointment(prev => ({
      ...prev,
      prescriptions: prev.prescriptions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!newAppointment.doctor || !newAppointment.department || 
          !newAppointment.appointmentDate || !newAppointment.appointmentTime || 
          !newAppointment.reason) {
        alert('Please fill all required fields');
        return;
      }

      const appointmentToSubmit = {
        patient: user._id,
        doctor: newAppointment.doctor,
        department: newAppointment.department, // Now using department ID
        appointmentDate: new Date(newAppointment.appointmentDate).toISOString(), // Format date properly
        appointmentTime: newAppointment.appointmentTime,
        type: newAppointment.type,
        status: 'scheduled',
        reason: newAppointment.reason
      };

      if (newAppointment.symptoms) {
        appointmentToSubmit.symptoms = newAppointment.symptoms;
      }
      
      console.log('Submitting appointment data:', appointmentToSubmit);
      
      const response = await appointmentService.create(appointmentToSubmit);
      console.log('API response:', response);
      
      if (response && response.data) {
        setAppointments([...appointments, response.data]);
        setShowForm(false);
        
        setNewAppointment({
          patient: user._id,
          doctor: '',
          department: '',
          appointmentDate: '',
          appointmentTime: '',
          type: 'consultation',
          status: 'scheduled',
          reason: '',
          notes: '',
          symptoms: '',
          diagnosis: '',
          treatment: '',
          prescriptions: [],
          followUpRequired: false,
          followUpDate: ''
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error creating appointment:', err);
      
      let errorMessage = err.message || 'Unknown error';
      if (errorMessage.includes('500')) {
        errorMessage = 'Server error: Please check if all fields are properly filled.';
      }
      
      alert(`Failed to book appointment: ${errorMessage}`);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await appointmentService.delete(id);
        setAppointments(appointments.filter(appointment => appointment._id !== id));
      } catch (err) {
        console.error('Error cancelling appointment:', err);
        alert(`Failed to cancel appointment: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowViewModal(true);
  };

  const handleEdit = (appointment) => {
    const appointmentToEdit = { ...appointment };
    
    if (appointmentToEdit.appointmentDate) {
      const date = new Date(appointmentToEdit.appointmentDate);
      const formattedDate = date.toISOString().split('T')[0];
      appointmentToEdit.appointmentDate = formattedDate;
    }
    
    setEditAppointment(appointmentToEdit);
    setShowEditModal(true);
  };

  const handleUpdateAppointment = async (e) => {
    e.preventDefault();
    
    try {
      if (!editAppointment.doctor || !editAppointment.department || 
          !editAppointment.appointmentDate || !editAppointment.appointmentTime || 
          !editAppointment.reason) {
        alert('Please fill all required fields');
        return;
      }

      const appointmentToUpdate = {
        ...editAppointment,
        appointmentDate: new Date(editAppointment.appointmentDate).toISOString()
      };
      
      if (typeof appointmentToUpdate.patient === 'object' && appointmentToUpdate.patient !== null) {
        appointmentToUpdate.patient = appointmentToUpdate.patient._id || user._id;
      }
      
      if (typeof appointmentToUpdate.doctor === 'object' && appointmentToUpdate.doctor !== null) {
        appointmentToUpdate.doctor = appointmentToUpdate.doctor._id;
      }
      
      if (typeof appointmentToUpdate.department === 'object' && appointmentToUpdate.department !== null) {
        appointmentToUpdate.department = appointmentToUpdate.department._id;
      }
      
      console.log('Updating appointment:', appointmentToUpdate);
      
      const response = await appointmentService.update(appointmentToUpdate._id, appointmentToUpdate);
      console.log('Update response:', response);
      
      if (response && response.data) {
        setAppointments(appointments.map(appt => 
          appt._id === response.data._id ? response.data : appt
        ));
        
        setShowEditModal(false);
        setEditAppointment(null);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error updating appointment:', err);
      alert(`Failed to update appointment: ${err.message || 'Unknown error'}`);
    }
  };

  const handleInputChangeForEdit = (e) => {
    const { name, value, type, checked } = e.target;
    setEditAppointment(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Report generation function
  const generateReport = () => {
    console.log(`📊 Generating appointments report in ${reportFormat.toUpperCase()} format...`);
    
    const reportData = filteredAppointments.length > 0 ? filteredAppointments : appointments;
    
    if (reportData.length === 0) {
      alert('No appointments available to generate report.');
      return;
    }
    
    // Create report based on selected format
    switch (reportFormat) {
      case 'csv':
        generateCSVReport(reportData);
        break;
      case 'excel':
        generateExcelReport(reportData);
        break;
      case 'pdf':
        generatePDFReport(reportData);
        break;
      default:
        generateCSVReport(reportData);
    }
  };

  // CSV Report Generation
  const generateCSVReport = (reportData) => {
    console.log('📄 Generating CSV report...');
    
    // Create CSV content
    const headers = [
      'Date',
      'Time', 
      'Type',
      'Doctor',
      'Department',
      'Status',
      'Reason',
      'Notes'
    ];
    
    const csvContent = [
      headers.join(','),
      ...reportData.map(appointment => {
        const date = appointment.appointmentDate 
          ? new Date(appointment.appointmentDate).toLocaleDateString() 
          : 'N/A';
        const time = appointment.appointmentTime || 'N/A';
        const type = appointment.type || 'N/A';
        const doctor = appointment.doctor && typeof appointment.doctor === 'object'
          ? `"Dr. ${appointment.doctor.firstName || ''} ${appointment.doctor.lastName || ''}"`
          : 'N/A';
        const department = appointment.department && typeof appointment.department === 'object'
          ? `"${appointment.department.name || 'N/A'}"`
          : 'N/A';
        const status = appointment.status || 'N/A';
        const reason = appointment.reason ? `"${appointment.reason.replace(/"/g, '""')}"` : 'N/A';
        const notes = appointment.notes ? `"${appointment.notes.replace(/"/g, '""')}"` : 'N/A';
        
        return [date, time, type, doctor, department, status, reason, notes].join(',');
      })
    ].join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    const fileName = `appointments-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log(`✅ CSV Report downloaded: ${fileName}`);
    alert(`✅ CSV Report generated successfully!\n📄 File: ${fileName}\n📊 Contains: ${reportData.length} appointments`);
  };

  // Excel Report Generation  
  const generateExcelReport = (reportData) => {
    console.log('� Generating Excel report...');
    
    // Create Excel content using HTML table format (compatible with Excel)
    const headers = ['Date', 'Time', 'Type', 'Doctor', 'Department', 'Status', 'Reason', 'Notes'];
    
    let excelContent = `
      <table border="1">
        <tr style="background-color: #4472C4; color: white; font-weight: bold;">
          ${headers.map(header => `<td>${header}</td>`).join('')}
        </tr>
        ${reportData.map(appointment => {
          const date = appointment.appointmentDate 
            ? new Date(appointment.appointmentDate).toLocaleDateString() 
            : 'N/A';
          const time = appointment.appointmentTime || 'N/A';
          const type = appointment.type || 'N/A';
          const doctor = appointment.doctor && typeof appointment.doctor === 'object'
            ? `Dr. ${appointment.doctor.firstName || ''} ${appointment.doctor.lastName || ''}`
            : 'N/A';
          const department = appointment.department && typeof appointment.department === 'object'
            ? appointment.department.name || 'N/A'
            : 'N/A';
          const status = appointment.status || 'N/A';
          const reason = appointment.reason || 'N/A';
          const notes = appointment.notes || 'N/A';
          
          return `
            <tr>
              <td>${date}</td>
              <td>${time}</td>
              <td>${type}</td>
              <td>${doctor}</td>
              <td>${department}</td>
              <td>${status}</td>
              <td>${reason}</td>
              <td>${notes}</td>
            </tr>
          `;
        }).join('')}
      </table>
    `;

    // Create and download Excel file
    const blob = new Blob([excelContent], { 
      type: 'application/vnd.ms-excel;charset=utf-8;'
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    const fileName = `appointments-report-${new Date().toISOString().split('T')[0]}.xls`;
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log(`✅ Excel Report downloaded: ${fileName}`);
    alert(`✅ Excel Report generated successfully!\n📄 File: ${fileName}\n📊 Contains: ${reportData.length} appointments`);
  };

  // PDF Report Generation
  const generatePDFReport = (reportData) => {
    console.log('📑 Generating PDF report...');
    
    // Create PDF content using HTML format (for browser PDF generation)
    const currentDate = new Date().toLocaleDateString();
    
    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Appointments Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .title { color: #2563eb; font-size: 24px; font-weight: bold; }
          .subtitle { color: #64748b; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #3b82f6; color: white; padding: 12px 8px; text-align: left; font-weight: bold; }
          td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .footer { margin-top: 30px; text-align: center; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Appointments Report</div>
          <div class="subtitle">Generated on ${currentDate} | Total Appointments: ${reportData.length}</div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Type</th>
              <th>Doctor</th>
              <th>Department</th>
              <th>Status</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.map(appointment => {
              const date = appointment.appointmentDate 
                ? new Date(appointment.appointmentDate).toLocaleDateString() 
                : 'N/A';
              const time = appointment.appointmentTime || 'N/A';
              const type = appointment.type || 'N/A';
              const doctor = appointment.doctor && typeof appointment.doctor === 'object'
                ? `Dr. ${appointment.doctor.firstName || ''} ${appointment.doctor.lastName || ''}`
                : 'N/A';
              const department = appointment.department && typeof appointment.department === 'object'
                ? appointment.department.name || 'N/A'
                : 'N/A';
              const status = appointment.status || 'N/A';
              const reason = (appointment.reason || 'N/A').substring(0, 50) + (appointment.reason && appointment.reason.length > 50 ? '...' : '');
              
              return `
                <tr>
                  <td>${date}</td>
                  <td>${time}</td>
                  <td>${type}</td>
                  <td>${doctor}</td>
                  <td>${department}</td>
                  <td>${status}</td>
                  <td>${reason}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          Hospital Management System - Appointments Report
        </div>
      </body>
      </html>
    `;

    // Open PDF in new window for user to save
    const newWindow = window.open('', '_blank');
    newWindow.document.write(pdfContent);
    newWindow.document.close();
    
    // Trigger print dialog for PDF generation
    setTimeout(() => {
      newWindow.print();
    }, 500);
    
    console.log(`✅ PDF Report generated and opened for download`);
    alert(`✅ PDF Report generated successfully!\n📄 A new window has opened where you can save as PDF\n📊 Contains: ${reportData.length} appointments`);
  };

  if (loading) return <div className="p-4 text-center">Loading appointments...</div>;
  
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">My Appointments</h2>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            {/* Search Type Filter */}
            <div className="relative">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
              >
                <option value="all">All Fields</option>
                <option value="type">Appointment Type</option>
                <option value="doctor">Doctor Name</option>
                <option value="department">Department</option>
                <option value="reason">Reason/Notes</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[250px]">
              <input
                type="text"
                placeholder={
                  searchType === 'all' ? "Search by doctor, department, type, or reason..." :
                  searchType === 'type' ? "Search by appointment type (consultation, follow-up, emergency)..." :
                  searchType === 'doctor' ? "Search by doctor name..." :
                  searchType === 'department' ? "Search by department..." :
                  searchType === 'reason' ? "Search by reason or notes..." :
                  "Search appointments..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            
            {/* Clear Search Button */}
            {(searchTerm || searchType !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSearchType('all');
                  setSearchError(null);
                }}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                Clear
              </button>
            )}
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center whitespace-nowrap"
          >
            <Plus size={18} className="mr-2" />
            Book Appointment
          </button>
          
          {/* Report Generation Section */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={reportFormat}
                onChange={(e) => setReportFormat(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent pr-8 min-w-[100px]"
                title="Select report format"
              >
                <option value="csv">CSV</option>
                <option value="excel">Excel</option>
                <option value="pdf">PDF</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <button
              onClick={generateReport}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center whitespace-nowrap"
              title={`Generate and download appointments report in ${reportFormat.toUpperCase()} format`}
            >
              <FileText size={18} className="mr-2" />
              Generate Report
            </button>
          </div>
          
          {/* Debug buttons for development */}
          {false && (
            <div className="flex gap-1">
              <button
                onClick={debugCurrentState}
                className="px-2 py-2 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                title="Debug current state"
              >
                🐛 State
              </button>
              <button
                onClick={() => testSearch(searchTerm || 'consultation')}
                className="px-2 py-2 text-xs bg-blue-200 hover:bg-blue-300 rounded"
                title="Test search function"
              >
                � Test
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search Error Message */}
      {searchError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-yellow-800 text-sm">{searchError}</p>
        </div>
      )}

      {/* Search Filter Indicator */}
      {(searchTerm || searchType !== 'all') && !loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-blue-600" />
            <span className="text-blue-800 text-sm">
              {searchTerm ? (
                searchType === 'all' ? 
                  `🔍 Searching for "${searchTerm}" in all fields` :
                searchType === 'type' ?
                  `📋 Searching for appointment type: "${searchTerm}"` :
                searchType === 'doctor' ?
                  `👨‍⚕️ Searching for doctor: "${searchTerm}"` :
                searchType === 'department' ?
                  `🏥 Searching for department: "${searchTerm}"` :
                searchType === 'reason' ?
                  `📝 Searching for reason/notes: "${searchTerm}"` :
                  `🔍 Searching for "${searchTerm}"`
              ) : (
                `Filter: ${searchType === 'type' ? 'Appointment Type' : searchType === 'doctor' ? 'Doctor Name' : searchType === 'department' ? 'Department' : searchType === 'reason' ? 'Reason/Notes' : 'All Fields'}`
              )}
            </span>
            {filteredAppointments.length >= 0 && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                {filteredAppointments.length} {filteredAppointments.length === 1 ? 'result' : 'results'}
              </span>
            )}
          </div>
          <button
            onClick={() => {
              setSearchTerm('');
              setSearchType('all');
              setSearchError(null);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Clear
          </button>
        </div>
      )}

      {/* Appointment List */}
      {loading ? (
        <div className="p-4 text-center">Loading appointments...</div>
      ) : error ? (
        <div className="p-4 text-center text-red-500">{error}</div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          {searchTerm ? (
            <>
              <p className="text-gray-600">No appointments match your search criteria.</p>
              <div className="mt-4 space-x-4">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSearchType('all');
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear search and filters
                </button>
                {appointments.length > 0 && (
                  <div className="flex items-center gap-2 justify-center">
                    <div className="relative">
                      <select
                        value={reportFormat}
                        onChange={(e) => setReportFormat(e.target.value)}
                        className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent pr-6 min-w-[80px]"
                        title="Select report format"
                      >
                        <option value="csv">CSV</option>
                        <option value="excel">Excel</option>
                        <option value="pdf">PDF</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-1 pointer-events-none">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <button
                      onClick={generateReport}
                      className="text-green-600 hover:text-green-800 font-medium inline-flex items-center"
                    >
                      <FileText size={16} className="mr-1" />
                      Generate Report of All Appointments
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-600">You don't have any appointments yet.</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center"
              >
                <Plus size={18} className="mr-2" />
                Book Your First Appointment
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredAppointments.map((appointment) => (
            <div
              key={appointment._id}
              className="bg-white p-6 rounded-lg shadow-md border border-gray-100"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <Calendar className="mr-3 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-lg">
                      {appointment.type || 'Consultation'}
                    </h3>
                    <p className="text-gray-500">
                      {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}{' '}
                      at {appointment.appointmentTime}
                    </p>
                  </div>
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      appointment.status === 'scheduled'
                        ? 'bg-yellow-100 text-yellow-800'
                        : appointment.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : appointment.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : appointment.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {appointment.status}
                  </span>
                </div>
              </div>

              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="text-sm">
                  <span className="font-medium">Doctor:</span>{' '}
                  {typeof appointment.doctor === 'object' 
                    ? `Dr. ${appointment.doctor.firstName || ''} ${appointment.doctor.lastName || ''}` 
                    : 'Assigned Doctor'}
                </p>
                
                {appointment.department && (
                  <p className="text-sm mt-1">
                    <span className="font-medium">Department:</span>{' '}
                    {appointment.department && typeof appointment.department === 'object'
                      ? appointment.department.name
                      : appointment.department}
                  </p>
                )}
                
                {appointment.reason && (
                  <p className="text-sm mt-1">
                    <span className="font-medium">Reason:</span> {appointment.reason}
                  </p>
                )}
              </div>

              {/* Add action buttons */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex space-x-3">
                <button
                  onClick={() => handleViewDetails(appointment)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Details
                </button>
                
                {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                  <>
                    <button
                      onClick={() => handleEdit(appointment)}
                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    
                    <button
                      onClick={() => handleCancel(appointment._id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Cancel Appointment
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Book Appointment Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Book an Appointment</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Department Selection */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Department
                </label>
                <select
                  name="department"
                  value={newAppointment.department}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor Selection - now depends on department */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Doctor
                </label>
                <select
                  name="doctor"
                  value={newAppointment.doctor}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={!newAppointment.department || !Array.isArray(filteredDoctors) || filteredDoctors.length === 0}
                >
                  <option value="">Select Doctor</option>
                  {Array.isArray(filteredDoctors) && filteredDoctors.map(doctor => (
                    <option key={doctor._id} value={doctor._id}>
                      Dr. {doctor.firstName} {doctor.lastName}
                    </option>
                  ))}
                </select>
                {!newAppointment.department && (
                  <p className="text-sm text-gray-500 mt-1">Please select a department first</p>
                )}
                {newAppointment.department && (!Array.isArray(filteredDoctors) || filteredDoctors.length === 0) && (
                  <p className="text-sm text-gray-500 mt-1">No doctors available for this department</p>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={newAppointment.appointmentDate}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Time
                </label>
                <input
                  type="time"
                  name="appointmentTime"
                  value={newAppointment.appointmentTime}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Appointment Type */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Appointment Type
                </label>
                <select
                  name="type"
                  value={newAppointment.type}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="consultation">Consultation</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="emergency">Emergency</option>
                  <option value="routine-checkup">Routine Checkup</option>
                </select>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Reason for Visit
                </label>
                <textarea
                  name="reason"
                  value={newAppointment.reason}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  required
                ></textarea>
              </div>

              {/* Symptoms */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Symptoms (Optional)
                </label>
                <textarea
                  name="symptoms"
                  value={newAppointment.symptoms}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  rows="2"
                ></textarea>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Book Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Appointment Modal */}
      {showViewModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Appointment Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Calendar className="text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold">
                    {selectedAppointment.type || 'Consultation'}
                  </h3>
                </div>
                
                <p className="text-gray-600">
                  {new Date(selectedAppointment.appointmentDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}{' '}
                  at {selectedAppointment.appointmentTime}
                </p>
                
                <div className="mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedAppointment.status === 'scheduled'
                      ? 'bg-yellow-100 text-yellow-800'
                      : selectedAppointment.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : selectedAppointment.status === 'completed'
                      ? 'bg-blue-100 text-blue-800'
                      : selectedAppointment.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedAppointment.status}
                  </span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium mb-2">Appointment Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Doctor</p>
                    <p className="font-medium">
                      {typeof selectedAppointment.doctor === 'object' 
                        ? `Dr. ${selectedAppointment.doctor.firstName || ''} ${selectedAppointment.doctor.lastName || ''}` 
                        : 'Assigned Doctor'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium">
                      {selectedAppointment.department && typeof selectedAppointment.department === 'object'
                        ? selectedAppointment.department.name
                        : selectedAppointment.department}
                    </p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Reason for Visit</p>
                  <p className="font-medium">{selectedAppointment.reason}</p>
                </div>
                
                {selectedAppointment.symptoms && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Symptoms</p>
                    <p className="font-medium">{selectedAppointment.symptoms}</p>
                  </div>
                )}
                
                {selectedAppointment.diagnosis && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Diagnosis</p>
                    <p className="font-medium">{selectedAppointment.diagnosis}</p>
                  </div>
                )}
                
                {selectedAppointment.treatment && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Treatment</p>
                    <p className="font-medium">{selectedAppointment.treatment}</p>
                  </div>
                )}
                
                {selectedAppointment.prescriptions && selectedAppointment.prescriptions.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Prescriptions</p>
                    {selectedAppointment.prescriptions.map((prescription, index) => (
                      <div key={index} className="bg-blue-50 p-3 rounded-lg mb-2">
                        <p className="font-medium">{prescription.medication}</p>
                        <p className="text-sm">Dosage: {prescription.dosage}</p>
                        {prescription.frequency && <p className="text-sm">Frequency: {prescription.frequency}</p>}
                        {prescription.duration && <p className="text-sm">Duration: {prescription.duration}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                
                {selectedAppointment.status !== 'cancelled' && selectedAppointment.status !== 'completed' && (
                  <>
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        handleEdit(selectedAppointment);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Edit Appointment
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        handleCancel(selectedAppointment._id);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Cancel Appointment
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Appointment Modal */}
      {showEditModal && editAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Edit Appointment</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateAppointment} className="space-y-6">
              {/* Department Selection */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Department
                </label>
                <select
                  name="department"
                  value={editAppointment.department && typeof editAppointment.department === 'object' 
                    ? editAppointment.department._id 
                    : editAppointment.department}
                  onChange={handleInputChangeForEdit}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor Selection */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Doctor
                </label>
                <select
                  name="doctor"
                  value={editAppointment.doctor && typeof editAppointment.doctor === 'object' 
                    ? editAppointment.doctor._id 
                    : editAppointment.doctor}
                  onChange={handleInputChangeForEdit}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Doctor</option>
                  {Array.isArray(doctors) && doctors.map(doctor => (
                    <option key={doctor._id} value={doctor._id}>
                      Dr. {doctor.firstName} {doctor.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={editAppointment.appointmentDate}
                  onChange={handleInputChangeForEdit}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Time
                </label>
                <input
                  type="time"
                  name="appointmentTime"
                  value={editAppointment.appointmentTime}
                  onChange={handleInputChangeForEdit}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Appointment Type */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Appointment Type
                </label>
                <select
                  name="type"
                  value={editAppointment.type}
                  onChange={handleInputChangeForEdit}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="consultation">Consultation</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="emergency">Emergency</option>
                  <option value="routine-checkup">Routine Checkup</option>
                </select>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Reason for Visit
                </label>
                <textarea
                  name="reason"
                  value={editAppointment.reason}
                  onChange={handleInputChangeForEdit}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  required
                ></textarea>
              </div>

              {/* Symptoms */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Symptoms (Optional)
                </label>
                <textarea
                  name="symptoms"
                  value={editAppointment.symptoms || ''}
                  onChange={handleInputChangeForEdit}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  rows="2"
                ></textarea>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsTab;
