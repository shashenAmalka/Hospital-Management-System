import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Stethoscope, Building2, Phone, Mail, CheckCircle, AlertCircle } from 'lucide-react';

const DoctorAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    department: '',
    doctor: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    symptoms: '',
    type: 'consultation'
  });

  const [filteredDoctors, setFilteredDoctors] = useState([]);

  // Available time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30'
  ];

  // Specialization display names
  const specializationNames = {
    'cardiology': 'Cardiology',
    'dermatology': 'Dermatology',
    'endocrinology': 'Endocrinology',
    'gastroenterology': 'Gastroenterology',
    'neurology': 'Neurology',
    'oncology': 'Oncology',
    'orthopedics': 'Orthopedics',
    'pediatrics': 'Pediatrics',
    'psychiatry': 'Psychiatry',
    'radiology': 'Radiology',
    'surgery': 'Surgery',
    'urology': 'Urology',
    'emergency-medicine': 'Emergency Medicine',
    'family-medicine': 'Family Medicine',
    'internal-medicine': 'Internal Medicine',
    'obstetrics-gynecology': 'Obstetrics & Gynecology'
  };

  useEffect(() => {
    fetchDoctorsAndDepartments();
  }, []);

  useEffect(() => {
    if (formData.department) {
      const filtered = doctors.filter(doctor => 
        doctor.department === formData.department || doctor.specialization === formData.department
      );
      setFilteredDoctors(filtered);
      // Reset doctor selection when department changes
      setFormData(prev => ({ ...prev, doctor: '' }));
    } else {
      setFilteredDoctors(doctors);
    }
  }, [formData.department, doctors]);

  const fetchDoctorsAndDepartments = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch doctors with better error handling
      try {
        const doctorsResponse = await fetch('/api/staff/role/doctor');
        if (doctorsResponse.ok) {
          const doctorsData = await doctorsResponse.json();
          // Handle different response formats
          let doctorsList = [];
          if (doctorsData.data) {
            doctorsList = doctorsData.data;
          } else if (Array.isArray(doctorsData)) {
            doctorsList = doctorsData;
          } else if (doctorsData.staff) {
            doctorsList = doctorsData.staff;
          }
          
          const activeDoctors = doctorsList.filter(doctor => 
            doctor && doctor.status === 'active' && doctor.role === 'doctor'
          ) || [];
          setDoctors(activeDoctors);
          setFilteredDoctors(activeDoctors);
        } else {
          console.error('Failed to fetch doctors:', doctorsResponse.status);
          // Use mock data for development
          const mockDoctors = [
            {
              _id: '1',
              firstName: 'John',
              lastName: 'Smith',
              specialization: 'cardiology',
              department: 'cardiology',
              status: 'active',
              email: 'dr.smith@hospital.com',
              phone: '+1234567890'
            },
            {
              _id: '2',
              firstName: 'Sarah',
              lastName: 'Johnson',
              specialization: 'pediatrics',
              department: 'pediatrics',
              status: 'active',
              email: 'dr.johnson@hospital.com',
              phone: '+1234567891'
            }
          ];
          setDoctors(mockDoctors);
          setFilteredDoctors(mockDoctors);
        }
      } catch (doctorError) {
        console.error('Error fetching doctors:', doctorError);
        // Set mock data as fallback
        const mockDoctors = [
          {
            _id: '1',
            firstName: 'John',
            lastName: 'Smith',
            specialization: 'cardiology',
            department: 'cardiology',
            status: 'active',
            email: 'dr.smith@hospital.com',
            phone: '+1234567890'
          }
        ];
        setDoctors(mockDoctors);
        setFilteredDoctors(mockDoctors);
      }

      // Fetch departments with better error handling
      try {
        const departmentsResponse = await fetch('/api/departments');
        if (departmentsResponse.ok) {
          const departmentsData = await departmentsResponse.json();
          let departmentsList = [];
          if (departmentsData.data) {
            departmentsList = departmentsData.data;
          } else if (Array.isArray(departmentsData)) {
            departmentsList = departmentsData;
          }
          setDepartments(departmentsList);
        } else {
          console.error('Failed to fetch departments:', departmentsResponse.status);
          setDepartments([]); // Will fall back to specializations
        }
      } catch (departmentError) {
        console.error('Error fetching departments:', departmentError);
        setDepartments([]); // Will fall back to specializations
      }
    } catch (error) {
      console.error('Error in fetchDoctorsAndDepartments:', error);
      setError('Unable to load data. Using default options.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // For unregistered users, we'll create a guest appointment
      // First, let's try to find if a user with this email already exists
      let patientId = null;
      
      try {
        const existingUserResponse = await fetch(`/api/auth/check-user?email=${encodeURIComponent(formData.patientEmail)}`);
        if (existingUserResponse.ok) {
          const userData = await existingUserResponse.json();
          if (userData.exists) {
            patientId = userData.user._id;
          }
        }
      } catch {
        console.log('Email check failed, proceeding with guest appointment');
      }

      // If no existing user found, we'll create a temporary patient record
      if (!patientId) {
        // Create a temporary user for guest appointment
        const guestPatientData = {
          firstName: formData.patientName.split(' ')[0] || 'Guest',
          lastName: formData.patientName.split(' ').slice(1).join(' ') || 'Patient',
          email: formData.patientEmail,
          phone: formData.patientPhone,
          role: 'patient',
          password: 'temp123456', // Temporary password
          isGuest: true // Flag for guest users
        };

        try {
          // Try to create through auth signup endpoint which might be more permissive
          const signupResponse = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(guestPatientData)
          });

          if (signupResponse.ok) {
            const signupResult = await signupResponse.json();
            patientId = signupResult.user?._id || signupResult.data?._id;
          }
        } catch {
          console.error('Signup failed');
        }
      }

      // If still no patient ID, we'll proceed with a different approach
      if (!patientId) {
        // Create appointment with patient details embedded
        const guestAppointmentData = {
          patientDetails: {
            name: formData.patientName,
            email: formData.patientEmail,
            phone: formData.patientPhone
          },
          doctor: formData.doctor,
          appointmentDate: formData.appointmentDate,
          appointmentTime: formData.appointmentTime,
          reason: formData.reason,
          symptoms: formData.symptoms,
          type: formData.type,
          status: 'scheduled',
          isGuestAppointment: true
        };

        const guestAppointmentResponse = await fetch('/api/appointments/guest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(guestAppointmentData)
        });

        if (guestAppointmentResponse.ok) {
          setSuccess(true);
          setFormData({
            patientName: '',
            patientEmail: '',
            patientPhone: '',
            department: '',
            doctor: '',
            appointmentDate: '',
            appointmentTime: '',
            reason: '',
            symptoms: '',
            type: 'consultation'
          });
          
          setTimeout(() => setSuccess(false), 5000);
          return;
        } else {
          throw new Error('Failed to create guest appointment');
        }
      }

      // If we have a patient ID, create a regular appointment
      const selectedDoctor = doctors.find(doc => doc._id === formData.doctor);
      const departmentId = departments.find(dept => 
        dept.name.toLowerCase() === formData.department.toLowerCase() ||
        dept.name.toLowerCase().includes(formData.department.toLowerCase())
      )?._id;

      const appointmentData = {
        patient: patientId,
        doctor: formData.doctor,
        department: departmentId || selectedDoctor?.department,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        reason: formData.reason,
        symptoms: formData.symptoms,
        type: formData.type,
        status: 'scheduled'
      };

      const appointmentResponse = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData)
      });

      if (appointmentResponse.ok) {
        setSuccess(true);
        setFormData({
          patientName: '',
          patientEmail: '',
          patientPhone: '',
          department: '',
          doctor: '',
          appointmentDate: '',
          appointmentTime: '',
          reason: '',
          symptoms: '',
          type: 'consultation'
        });
        
        setTimeout(() => setSuccess(false), 5000);
      } else {
        const errorData = await appointmentResponse.json();
        throw new Error(errorData.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      setError(error.message || 'Failed to book appointment. Please try again later or contact our support team.');
    } finally {
      setSubmitting(false);
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading doctors and departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Animated Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Book Doctor Appointment
          </h1>
          <p className="text-gray-600 text-lg">Schedule your consultation with our expert doctors</p>
        </div>

        {/* Success Message with Animation */}
        {success && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 flex items-center transform transition-all duration-500 animate-bounce-in shadow-lg">
            <div className="flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-green-500 animate-pulse" />
            </div>
            <div className="ml-3">
              <h3 className="text-green-800 font-semibold">Success!</h3>
              <p className="text-green-700 text-sm">Your appointment has been booked successfully. Check your email for confirmation.</p>
            </div>
          </div>
        )}

        {/* Error Message with Animation */}
        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4 flex items-center transform transition-all duration-300 shadow-lg">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-red-500 animate-pulse" />
            </div>
            <div className="ml-3">
              <h3 className="text-red-800 font-semibold">Notice</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Interactive Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 transform transition-all duration-300 hover:shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Patient Information Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-2 border-b border-gray-200">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                    <User className="w-4 h-4 inline mr-1" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-300 bg-gray-50 focus:bg-white"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="patientEmail"
                    value={formData.patientEmail}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-300 bg-gray-50 focus:bg-white"
                    placeholder="your@email.com"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="patientPhone"
                    value={formData.patientPhone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-300 bg-gray-50 focus:bg-white"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Appointment Details Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-2 border-b border-gray-200">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Appointment Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    Department/Specialization *
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-300 bg-gray-50 focus:bg-white"
                  >
                    <option value="">Choose a department...</option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept.name.toLowerCase()}>
                        {dept.name}
                      </option>
                    ))}
                    {Object.entries(specializationNames).map(([key, name]) => (
                      <option key={key} value={key}>{name}</option>
                    ))}
                  </select>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                    <Stethoscope className="w-4 h-4 inline mr-1" />
                    Select Doctor *
                  </label>
                  <select
                    name="doctor"
                    value={formData.doctor}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.department}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-300 bg-gray-50 focus:bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!formData.department ? "First select a department" : "Choose your doctor..."}
                    </option>
                    {filteredDoctors.map(doctor => (
                      <option key={doctor._id} value={doctor._id}>
                        Dr. {doctor.firstName} {doctor.lastName} - {specializationNames[doctor.specialization] || doctor.specialization}
                      </option>
                    ))}
                  </select>
                  {!formData.department && (
                    <p className="text-xs text-gray-500 mt-1">Please select a department first</p>
                  )}
                </div>
              </div>
            </div>

            {/* Date and Time Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-2 border-b border-gray-200">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Date & Time</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleInputChange}
                    min={getTomorrowDate()}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-300 bg-gray-50 focus:bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Earliest available: Tomorrow</p>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Preferred Time *
                  </label>
                  <select
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-300 bg-gray-50 focus:bg-white"
                  >
                    <option value="">Choose time slot...</option>
                    <optgroup label="Morning Slots">
                      {timeSlots.filter(time => parseInt(time) < 12).map(time => (
                        <option key={time} value={time}>{time} - {(parseInt(time) < 12) ? 'AM' : 'PM'}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Afternoon Slots">
                      {timeSlots.filter(time => parseInt(time) >= 12).map(time => (
                        <option key={time} value={time}>{time} - PM</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                    <Stethoscope className="w-4 h-4 inline mr-1" />
                    Appointment Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-300 bg-gray-50 focus:bg-white"
                  >
                    <option value="consultation">🩺 New Consultation</option>
                    <option value="follow-up">🔄 Follow-up Visit</option>
                    <option value="routine">📋 Routine Check-up</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Medical Information Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-2 border-b border-gray-200">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Medical Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                    📝 Reason for Visit *
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    required
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-300 bg-gray-50 focus:bg-white resize-none"
                    placeholder="Please describe the main reason for your visit..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Be specific to help the doctor prepare</p>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                    🩺 Current Symptoms (Optional)
                  </label>
                  <textarea
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-300 bg-gray-50 focus:bg-white resize-none"
                    placeholder="Describe any symptoms you're experiencing..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Include duration, severity, and any patterns</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="group relative px-12 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 focus:ring-4 focus:ring-blue-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {submitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    <span>Booking Your Appointment...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                    <span>Book My Appointment</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Enhanced Info Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center mb-4">
              <Clock className="w-6 h-6 text-blue-600 mr-2" />
              <h3 className="font-semibold text-blue-800">Before Your Visit</h3>
            </div>
            <ul className="text-sm text-blue-700 space-y-2">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                Arrive 15 minutes early
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                Bring valid ID & insurance
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                List current medications
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
              <h3 className="font-semibold text-green-800">What to Expect</h3>
            </div>
            <ul className="text-sm text-green-700 space-y-2">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                Email confirmation sent
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                Reminder 24 hours before
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                Professional consultation
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-amber-600 mr-2" />
              <h3 className="font-semibold text-amber-800">Important Policy</h3>
            </div>
            <ul className="text-sm text-amber-700 space-y-2">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                Cancel 24h in advance
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                Late arrivals rescheduled
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                Emergency cases priority
              </li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DoctorAppointment;