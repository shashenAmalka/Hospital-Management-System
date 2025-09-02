import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [appointmentData, setAppointmentData] = useState({
    fullName: '',
    email: '',
    department: '',
    date: '',
    time: '',
    phone: '',
    message: ''
  });
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAppointmentData({
      ...appointmentData,
      [name]: value
    });
  };

  const handleAppointmentSubmit = (e) => {
    e.preventDefault();
    // Handle appointment booking logic here
    console.log('Appointment booked:', appointmentData);
    alert('Appointment booked successfully! We will confirm shortly.');
    setAppointmentData({
      fullName: '',
      email: '',
      department: '',
      date: '',
      time: '',
      phone: '',
      message: ''
    });
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'admin': return '/admin-dashboard';
      case 'doctor': return '/doctor-dashboard';
      case 'pharmacist': return '/pharmacist-dashboard';
      case 'lab_technician': return '/lab-dashboard';
      case 'staff': return '/staff-dashboard';
      case 'patient': return '/patient-dashboard';
      default: return '/patient-dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 text-white py-20 overflow-hidden">
        <div className="absolute inset-0">
          <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="rgba(255,255,255,0.05)" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,202.7C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
          <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="rgba(255,255,255,0.08)" fillOpacity="1" d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,261.3C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-12 md:mb-0">
              <div className="inline-block px-3 py-1 bg-blue-900 bg-opacity-40 rounded-full text-blue-100 text-sm font-semibold mb-5">
                #1 Hospital Management System
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                Advanced Healthcare <span className="text-green-400">Management</span> Solutions
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100 font-light leading-relaxed">
                Streamlining hospital operations with our comprehensive system designed for modern healthcare facilities.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to={getDashboardLink()}
                  className="bg-white text-blue-700 hover:bg-blue-50 font-semibold py-4 px-8 rounded-full transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <i className="fas fa-tachometer-alt mr-2"></i>Go to Dashboard
                </Link>
                <Link
                  to="/services"
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-8 rounded-full transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <i className="fas fa-info-circle mr-2"></i>Our Services
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-white bg-blue-${i*100 + 300}`}></div>
                  ))}
                </div>
                <div className="text-blue-100">
                  <span className="font-bold">500+</span> Healthcare Providers Trust Us
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2 flex justify-center">
              <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full transform transition-all duration-300 hover:scale-105 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-100 rounded-full opacity-30"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-green-100 rounded-full opacity-30"></div>
                
                <h3 className="text-2xl font-bold text-blue-800 mb-6 relative z-10">
                  <i className="fas fa-calendar-plus mr-2 text-green-500"></i>
                  Schedule Appointment
                </h3>
                
                <form className="space-y-4" onSubmit={handleAppointmentSubmit}>
                  <div className="flex gap-4">
                    <div className="w-1/2">
                      <label className="block text-gray-700 mb-2 text-sm font-medium">Full Name</label>
                      <input 
                        type="text" 
                        name="fullName"
                        value={appointmentData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="block text-gray-700 mb-2 text-sm font-medium">Phone</label>
                      <input 
                        type="tel" 
                        name="phone"
                        value={appointmentData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2 text-sm font-medium">Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      value={appointmentData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2 text-sm font-medium">Department</label>
                    <select 
                      name="department"
                      value={appointmentData.department}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Department</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Ophthalmology">Ophthalmology</option>
                      <option value="Gynecology">Gynecology</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2 text-sm font-medium">Date</label>
                      <input 
                        type="date" 
                        name="date"
                        value={appointmentData.date}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2 text-sm font-medium">Time</label>
                      <input 
                        type="time" 
                        name="time"
                        value={appointmentData.time}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2 text-sm font-medium">Brief Message (Optional)</label>
                    <textarea
                      name="message"
                      value={appointmentData.message}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="2"
                      placeholder="Please describe your symptoms or reason for visit"
                    ></textarea>
                  </div>
                  <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-4 rounded-lg transition duration-300 shadow-md hover:shadow-lg">
                    <i className="fas fa-calendar-check mr-2"></i>Book Appointment
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Banner */}
      <section className="bg-white py-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <div className="text-blue-600 text-4xl mb-3">
                <i className="fas fa-user-md"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Expert Doctors</h3>
            </div>
            <div className="p-4">
              <div className="text-green-500 text-4xl mb-3">
                <i className="fas fa-procedures"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Quality Care</h3>
            </div>
            <div className="p-4">
              <div className="text-blue-600 text-4xl mb-3">
                <i className="fas fa-heartbeat"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">24/7 Emergency</h3>
            </div>
            <div className="p-4">
              <div className="text-green-500 text-4xl mb-3">
                <i className="fas fa-microscope"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Lab Services</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Why Hospitals Trust Us</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2">Transforming Healthcare Management</h2>
            <div className="w-16 h-1 bg-green-500 mx-auto mt-4 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:transform hover:scale-105">
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 rounded-lg p-3">
                    <i className="fas fa-hospital-user text-blue-600 text-2xl"></i>
                  </div>
                  <div className="bg-blue-50 rounded-full h-12 w-12 flex items-center justify-center">
                    <span className="text-blue-700 font-bold">24/7</span>
                  </div>
                </div>
                <h3 className="text-4xl font-bold text-blue-800 mb-2">500+</h3>
                <p className="text-gray-600 text-lg font-medium">Healthcare Providers</p>
                <div className="mt-4 h-1 w-20 bg-blue-600 rounded-full"></div>
                <p className="mt-4 text-gray-600">Trusted by hospitals and clinics worldwide to manage operations efficiently.</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:transform hover:scale-105">
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-100 rounded-lg p-3">
                    <i className="fas fa-clock text-green-600 text-2xl"></i>
                  </div>
                  <div className="bg-green-50 rounded-full h-12 w-12 flex items-center justify-center">
                    <span className="text-green-700 font-bold">↓↓</span>
                  </div>
                </div>
                <h3 className="text-4xl font-bold text-green-600 mb-2">40%</h3>
                <p className="text-gray-600 text-lg font-medium">Time Saved</p>
                <div className="mt-4 h-1 w-20 bg-green-600 rounded-full"></div>
                <p className="mt-4 text-gray-600">Reduce administrative tasks and focus more on patient care with our system.</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:transform hover:scale-105">
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 rounded-lg p-3">
                    <i className="fas fa-chart-line text-blue-600 text-2xl"></i>
                  </div>
                  <div className="bg-blue-50 rounded-full h-12 w-12 flex items-center justify-center">
                    <span className="text-blue-700 font-bold">↑↑</span>
                  </div>
                </div>
                <h3 className="text-4xl font-bold text-blue-800 mb-2">30%</h3>
                <p className="text-gray-600 text-lg font-medium">Growth Rate</p>
                <div className="mt-4 h-1 w-20 bg-blue-600 rounded-full"></div>
                <p className="mt-4 text-gray-600">Significant growth in patient satisfaction and operational efficiency.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">System Features</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2">Comprehensive Healthcare Solutions</h2>
            <p className="text-xl text-gray-600 mt-4">Everything you need to manage your healthcare facility efficiently</p>
            <div className="w-16 h-1 bg-green-500 mx-auto mt-4 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-blue-50 rounded-xl p-8 shadow-md border border-blue-100 transition duration-300 hover:shadow-xl">
              <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                <i className="fas fa-user-injured text-blue-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Patient Management</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                  <span>Complete electronic medical records</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                  <span>Patient history tracking</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                  <span>Treatment plan management</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-green-50 rounded-xl p-8 shadow-md border border-green-100 transition duration-300 hover:shadow-xl">
              <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <i className="fas fa-calendar-check text-green-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Appointment Scheduling</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                  <span>Online booking system</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                  <span>Automated reminders</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                  <span>Calendar synchronization</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-8 shadow-md border border-blue-100 transition duration-300 hover:shadow-xl">
              <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                <i className="fas fa-pills text-blue-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Pharmacy Management</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                  <span>Inventory tracking system</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                  <span>Prescription management</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                  <span>Automated refill requests</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-green-50 rounded-xl p-8 shadow-md border border-green-100 transition duration-300 hover:shadow-xl">
              <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <i className="fas fa-file-invoice-dollar text-green-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Billing & Insurance</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                  <span>Automated billing system</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                  <span>Insurance claims processing</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                  <span>Financial reporting</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-8 shadow-md border border-blue-100 transition duration-300 hover:shadow-xl">
              <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                <i className="fas fa-flask text-blue-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Laboratory Management</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                  <span>Test ordering system</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                  <span>Result management</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                  <span>Specimen tracking</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-green-50 rounded-xl p-8 shadow-md border border-green-100 transition duration-300 hover:shadow-xl">
              <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <i className="fas fa-chart-bar text-green-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Analytics & Reporting</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                  <span>Performance dashboards</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                  <span>Custom report generation</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                  <span>Data visualization tools</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2">What Healthcare Professionals Say</h2>
            <div className="w-16 h-1 bg-green-500 mx-auto mt-4 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 relative">
              <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                <div className="text-5xl text-blue-200">"</div>
              </div>
              <div className="mb-6 flex items-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4">JD</div>
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">Dr. James Davidson</h4>
                  <p className="text-gray-600 text-sm">Chief Medical Officer, City Hospital</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "This system has transformed how we manage patient care. The efficiency gains have allowed our staff to focus more on patients and less on paperwork."
              </p>
              <div className="mt-6 flex">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className="fas fa-star text-yellow-400 mr-1"></i>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 relative">
              <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                <div className="text-5xl text-green-200">"</div>
              </div>
              <div className="mb-6 flex items-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4">SR</div>
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">Sarah Reynolds</h4>
                  <p className="text-gray-600 text-sm">Hospital Administrator, MedCenter</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "The billing and insurance modules have reduced our payment processing time by 65%. The ROI was evident within the first three months of implementation."
              </p>
              <div className="mt-6 flex">
                {[...Array(4)].map((_, i) => (
                  <i key={i} className="fas fa-star text-yellow-400 mr-1"></i>
                ))}
                <i className="fas fa-star-half-alt text-yellow-400 mr-1"></i>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 relative">
              <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                <div className="text-5xl text-blue-200">"</div>
              </div>
              <div className="mb-6 flex items-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4">MP</div>
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">Dr. Michael Park</h4>
                  <p className="text-gray-600 text-sm">Surgeon, General Hospital</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Access to patient records and lab results from anywhere has been a game-changer. I can review critical information before procedures even when I'm not at the hospital."
              </p>
              <div className="mt-6 flex">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className="fas fa-star text-yellow-400 mr-1"></i>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="rgba(255,255,255,0.05)" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,154.7C384,128,480,96,576,117.3C672,139,768,213,864,229.3C960,245,1056,203,1152,170.7C1248,139,1344,117,1392,106.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Transform Your Healthcare Management?</h2>
            <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
              Join thousands of healthcare providers who have streamlined their operations with our hospital management system.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link
                to="/signup"
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold py-4 px-10 rounded-full transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <i className="fas fa-rocket mr-2"></i>Get Started Free
              </Link>
              <Link
                to="/contact"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-700 font-semibold py-4 px-10 rounded-full transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <i className="fas fa-headset mr-2"></i>Request Demo
              </Link>
            </div>
            <div className="mt-10 text-blue-100 font-light">
              <p>No credit card required • Free 14-day trial • Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;