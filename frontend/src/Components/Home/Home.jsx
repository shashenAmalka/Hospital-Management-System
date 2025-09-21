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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userData && token) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        
        // Pre-fill form with user data if authenticated
        setAppointmentData(prev => ({
          ...prev,
          fullName: `${parsedUser.firstName || ''} ${parsedUser.lastName || ''}`.trim(),
          email: parsedUser.email || ''
        }));
      } catch (error) {
        console.error('Error parsing user data:', error);
        setIsAuthenticated(false);
        setUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
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
    
    // Check if user is authenticated before allowing appointment booking
    if (!isAuthenticated) {
      alert('Please login to book an appointment.');
      navigate('/login');
      return;
    }
    
    // Handle appointment booking logic here
    console.log('Appointment booked:', appointmentData);
    alert('Appointment booked successfully! We will confirm shortly.');
    setAppointmentData({
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      email: user.email || '',
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
      <section className="relative bg-gradient-to-r from-blue-800 via-teal-700 to-cyan-600 text-white py-20 overflow-hidden">
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
                <i className="fas fa-award mr-2"></i>
                #1 Hospital Management System
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                Advanced Helamed <span className="text-teal-300">Management</span> Solutions
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100 font-light leading-relaxed">
                <i className="fas fa-heartbeat mr-3 text-red-400"></i>
                Streamlining hospital operations with our comprehensive system designed for modern Helamed facilities.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/services"
                  className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-4 px-8 rounded-full transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <i className="fas fa-stethoscope mr-2"></i>Our Services
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white font-bold ${
                      i === 1 ? 'bg-blue-400' : 
                      i === 2 ? 'bg-teal-400' : 
                      i === 3 ? 'bg-cyan-400' : 
                      'bg-emerald-400'
                    }`}>
                      <i className={`fas ${
                        i === 1 ? 'fa-user-md' : 
                        i === 2 ? 'fa-user-nurse' : 
                        i === 3 ? 'fa-user-injured' : 
                        'fa-users'
                      } text-xs`}></i>
                    </div>
                  ))}
                </div>
                <div className="text-blue-100">
                  <i className="fas fa-hospital mr-2"></i>
                  <span className="font-bold">500+</span> Helamed Providers Trust Us
                </div>
              </div>
            </div>
            
            {/* Enhanced Hero Image Section */}
            <div className="md:w-1/2 flex justify-center">
              {isAuthenticated ? (
                // Show appointment form for authenticated users
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
                          readOnly
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
                        readOnly
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
                          min={new Date().toISOString().split('T')[0]}
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
              ) : (
                <div className="relative">
                  <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full transform transition-all duration-300 hover:scale-105 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-100 rounded-full opacity-30"></div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-green-100 rounded-full opacity-30"></div>
                    
                    <div className="text-center relative z-10">
                      {/* Enhanced Medical Hero Illustration */}
                      <div className="w-full h-48 mb-6 bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl flex items-center justify-center relative overflow-hidden photo-frame">
                        {/* Advanced Medical Scene */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-teal-100 opacity-50"></div>
                        
                        {/* Hospital Building Background */}
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-blue-200 to-transparent opacity-30"></div>
                        
                        {/* Medical Professional Team */}
                        <div className="relative flex items-center justify-center space-x-6">
                          {/* Senior Doctor */}
                          <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                              <i className="fas fa-user-md text-2xl text-white"></i>
                            </div>
                            <div className="mt-2 px-2 py-1 bg-blue-100 rounded-full">
                              <span className="text-xs text-blue-700 font-semibold">Dr. Sarah</span>
                            </div>
                          </div>
                          
                          {/* Medical Cross Connection */}
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center shadow-lg">
                              <i className="fas fa-plus text-xl text-white"></i>
                            </div>
                            <div className="w-8 h-1 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full mt-2"></div>
                          </div>
                          
                          {/* Nurse */}
                          <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                              <i className="fas fa-user-nurse text-2xl text-white"></i>
                            </div>
                            <div className="mt-2 px-2 py-1 bg-teal-100 rounded-full">
                              <span className="text-xs text-teal-700 font-semibold">Nurse Kate</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Enhanced Floating Medical Icons */}
                        <i className="fas fa-stethoscope absolute top-4 left-4 text-blue-500 text-lg float-animation" style={{ animationDelay: '0s' }}></i>
                        <i className="fas fa-heartbeat absolute top-4 right-4 text-red-500 text-lg float-animation" style={{ animationDelay: '0.5s' }}></i>
                        <i className="fas fa-pills absolute bottom-4 left-4 text-orange-500 text-lg float-animation" style={{ animationDelay: '1s' }}></i>
                        <i className="fas fa-syringe absolute bottom-4 right-4 text-green-500 text-lg float-animation" style={{ animationDelay: '1.5s' }}></i>
                        <i className="fas fa-ambulance absolute top-1/2 left-2 text-red-400 text-sm float-animation" style={{ animationDelay: '2s' }}></i>
                        <i className="fas fa-clipboard-check absolute top-1/2 right-2 text-purple-500 text-sm float-animation" style={{ animationDelay: '2.5s' }}></i>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-blue-800 mb-4">
                        <i className="fas fa-calendar-plus mr-2 text-green-500"></i>
                        Schedule Your Appointment
                      </h3>
                      
                      <p className="text-gray-600 mb-6">
                        Please login or register to book an appointment with our Helamed professionals.
                      </p>
                      
                      <div className="space-y-3">
                        <Link
                          to="/login"
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-4 rounded-lg transition duration-300 shadow-md hover:shadow-lg block"
                        >
                          <i className="fas fa-sign-in-alt mr-2"></i>Login to Book
                        </Link>
                        
                        <Link
                          to="/register"
                          className="w-full bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-3 px-4 rounded-lg transition duration-300 block"
                        >
                          <i className="fas fa-user-plus mr-2"></i>Register Now
                        </Link>
                      </div>
                      
                      <p className="text-sm text-gray-500 mt-4">
                        <i className="fas fa-shield-alt mr-1 text-green-500"></i>
                        Existing patient? <Link to="/login" className="text-blue-600 hover:underline">Sign in here</Link>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Services Banner */}
      <section className="bg-white py-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-6 group hover:bg-blue-50 rounded-xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-blue-600 text-5xl mb-4 service-icon group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-user-md drop-shadow-lg"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Expert Doctors</h3>
                <p className="text-sm text-gray-600">Board-certified professionals</p>
                <div className="mt-3 flex justify-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fas fa-star text-yellow-400 text-xs"></i>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-6 group hover:bg-teal-50 rounded-xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-teal-500 text-5xl mb-4 service-icon group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-hospital drop-shadow-lg"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Quality Care</h3>
                <p className="text-sm text-gray-600">World-class treatment facilities</p>
                <div className="mt-3 text-teal-600">
                  <i className="fas fa-award text-sm mr-1"></i>
                  <span className="text-xs font-medium">ISO Certified</span>
                </div>
              </div>
            </div>
            
            <div className="p-6 group hover:bg-red-50 rounded-xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-red-500 text-5xl mb-4 service-icon group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-ambulance drop-shadow-lg"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">24/7 Emergency</h3>
                <p className="text-sm text-gray-600">Round-the-clock emergency services</p>
                <div className="mt-3 text-red-600">
                  <i className="fas fa-clock text-sm mr-1"></i>
                  <span className="text-xs font-medium">Always Available</span>
                </div>
              </div>
            </div>
            
            <div className="p-6 group hover:bg-emerald-50 rounded-xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-emerald-500 text-5xl mb-4 service-icon group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-microscope drop-shadow-lg"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Advanced Lab</h3>
                <p className="text-sm text-gray-600">State-of-the-art diagnostics</p>
                <div className="mt-3 text-emerald-600">
                  <i className="fas fa-flask text-sm mr-1"></i>
                  <span className="text-xs font-medium">AI-Powered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section with Doctor Cards */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          {/* ...existing features content... */}
          
          {/* New Doctor Showcase Section */}
          <div className="mt-20">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
                <i className="fas fa-user-md mr-2"></i>Meet Our Specialists
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2">Expert Medical Team</h2>
              <p className="text-xl text-gray-600 mt-4">
                <i className="fas fa-stethoscope mr-2 text-blue-500"></i>
                Dedicated professionals committed to your health and wellness
              </p>
              <div className="w-16 h-1 bg-teal-500 mx-auto mt-4 rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Cardiologist */}
              <div className="doctor-card rounded-2xl p-8 text-white shadow-xl transform transition-all duration-300 hover:scale-105">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-6 bg-white rounded-full p-1 shadow-lg">
                    <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
                      <i className="fas fa-heartbeat text-3xl text-white"></i>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Dr. Sarah Johnson</h3>
                  <p className="text-blue-100 mb-4">Cardiologist</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-center">
                      <i className="fas fa-graduation-cap mr-2"></i>
                      <span>15+ Years Experience</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <i className="fas fa-certificate mr-2"></i>
                      <span>Board Certified</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <i className="fas fa-heart mr-2"></i>
                      <span>Heart Specialist</span>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-center">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className="fas fa-star text-yellow-300 mr-1"></i>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Neurologist */}
              <div className="doctor-card rounded-2xl p-8 text-white shadow-xl transform transition-all duration-300 hover:scale-105">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-6 bg-white rounded-full p-1 shadow-lg">
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                      <i className="fas fa-brain text-3xl text-white"></i>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Dr. Michael Chen</h3>
                  <p className="text-blue-100 mb-4">Neurologist</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-center">
                      <i className="fas fa-graduation-cap mr-2"></i>
                      <span>20+ Years Experience</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <i className="fas fa-award mr-2"></i>
                      <span>Research Pioneer</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <i className="fas fa-brain mr-2"></i>
                      <span>Brain Specialist</span>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-center">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className="fas fa-star text-yellow-300 mr-1"></i>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Pediatrician */}
              <div className="doctor-card rounded-2xl p-8 text-white shadow-xl transform transition-all duration-300 hover:scale-105">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-6 bg-white rounded-full p-1 shadow-lg">
                    <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                      <i className="fas fa-baby text-3xl text-white"></i>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Dr. Emily Rodriguez</h3>
                  <p className="text-blue-100 mb-4">Pediatrician</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-center">
                      <i className="fas fa-graduation-cap mr-2"></i>
                      <span>12+ Years Experience</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <i className="fas fa-smile mr-2"></i>
                      <span>Child Friendly</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <i className="fas fa-child mr-2"></i>
                      <span>Pediatric Expert</span>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-center">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className="fas fa-star text-yellow-300 mr-1"></i>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-6">
          {/* ...existing testimonials header... */}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 relative group hover:shadow-2xl transition-all duration-300">
              {/* Enhanced testimonial with photo frame */}
              <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                <div className="text-5xl text-blue-200">
                  <i className="fas fa-quote-right"></i>
                </div>
              </div>
              <div className="mb-6 flex items-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4 photo-frame shadow-lg">
                  <i className="fas fa-user-md"></i>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">Dr. James Davidson</h4>
                  <p className="text-gray-600 text-sm">
                    <i className="fas fa-hospital mr-1 text-blue-500"></i>Chief Medical Officer
                  </p>
                  <p className="text-xs text-gray-500">City General Hospital</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "This system has transformed how we manage patient care. The efficiency gains have allowed our staff to focus more on patients and less on paperwork."
              </p>
              <div className="mt-6 flex items-center justify-between">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fas fa-star text-yellow-400 mr-1"></i>
                  ))}
                </div>
                <div className="text-sm text-gray-500">
                  <i className="fas fa-verified-check text-green-500 mr-1"></i>
                  Verified
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 relative group hover:shadow-2xl transition-all duration-300">
              <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                <div className="text-5xl text-green-200">
                  <i className="fas fa-quote-right"></i>
                </div>
              </div>
              <div className="mb-6 flex items-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4 photo-frame shadow-lg">
                  <i className="fas fa-user-tie"></i>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">Sarah Reynolds</h4>
                  <p className="text-gray-600 text-sm">
                    <i className="fas fa-building mr-1 text-green-500"></i>Hospital Administrator
                  </p>
                  <p className="text-xs text-gray-500">MedCenter</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "The billing and insurance modules have reduced our payment processing time by 65%. The ROI was evident within the first three months of implementation."
              </p>
              <div className="mt-6 flex items-center justify-between">
                <div className="flex">
                  {[...Array(4)].map((_, i) => (
                    <i key={i} className="fas fa-star text-yellow-400 mr-1"></i>
                  ))}
                  <i className="fas fa-star-half-alt text-yellow-400 mr-1"></i>
                </div>
                <div className="text-sm text-gray-500">
                  <i className="fas fa-verified-check text-green-500 mr-1"></i>
                  Verified
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 relative group hover:shadow-2xl transition-all duration-300">
              <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                <div className="text-5xl text-blue-200">
                  <i className="fas fa-quote-right"></i>
                </div>
              </div>
              <div className="mb-6 flex items-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4 photo-frame shadow-lg">
                  <i className="fas fa-user-md"></i>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">Dr. Michael Park</h4>
                  <p className="text-gray-600 text-sm">
                    <i className="fas fa-cut mr-1 text-blue-500"></i>Surgeon
                  </p>
                  <p className="text-xs text-gray-500">General Hospital</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Access to patient records and lab results from anywhere has been a game-changer. I can review critical information before procedures even when I'm not at the hospital."
              </p>
              <div className="mt-6 flex items-center justify-between">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fas fa-star text-yellow-400 mr-1"></i>
                  ))}
                </div>
                <div className="text-sm text-gray-500">
                  <i className="fas fa-verified-check text-green-500 mr-1"></i>
                  Verified
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-800 via-teal-700 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="rgba(255,255,255,0.05)" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,154.7C384,128,480,96,576,117.3C672,139,768,213,864,229.3C960,245,1056,203,1152,170.7C1248,139,1344,117,1392,106.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              <i className="fas fa-rocket mr-3"></i>
              Ready to Transform Your HelaMed Management?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
              <i className="fas fa-users mr-2"></i>
              Join thousands of HelaMed providers who have streamlined their operations with our hospital management system.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link
                to="/register"
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
              <p>
                <i className="fas fa-shield-alt mr-2 text-green-300"></i>
                No credit card required • Free 14-day trial • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;