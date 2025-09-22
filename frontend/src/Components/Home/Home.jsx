import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../Admin/Header';


const HomePage = () => {
  const [appointmentData, setAppointmentData] = useState({
    fullName: '',
    email: '',
    department: '',
    date: '',
    time: ''
  });

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
      time: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col ">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20 md:py-28">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgcGF0dGVyblRyYW5zZm9ybT0icm90YXRlKDQ1KSI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMyIgZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIwLjA1Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3BhdHRlcm4pIi8+PC9zdmc+')] opacity-20"></div>
        </div>
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-12 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Advanced Healthcare Management Solutions</h1>
              <p className="text-xl mb-8 text-blue-100">Streamlining hospital operations with our comprehensive management system designed for modern healthcare facilities.</p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/patient-dashboard"
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg transition duration-300 shadow-lg hover:shadow-xl"
                >
                  <i className="fas fa-users mr-2"></i>View Patients
                </Link>
                <Link
                  to="/appointments"
                  className="bg-white text-blue-700 hover:bg-blue-50 font-semibold py-3 px-8 rounded-lg transition duration-300 shadow-lg hover:shadow-xl"
                >
                  <i className="fas fa-calendar-check mr-2"></i>Appointments
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full transform transition-all duration-300 hover:scale-105">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Quick Appointment</h3>
                <form className="space-y-5" onSubmit={handleAppointmentSubmit}>
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Full Name</label>
                    <input 
                      type="text" 
                      name="fullName"
                      value={appointmentData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      value={appointmentData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Department</label>
                    <select 
                      name="department"
                      value={appointmentData.department}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Department</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Dermatology">Dermatology</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">Date</label>
                      <input 
                        type="date" 
                        name="date"
                        value={appointmentData.date}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">Time</label>
                      <input 
                        type="time" 
                        name="time"
                        value={appointmentData.time}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1">
                    <i className="fas fa-calendar-plus mr-2"></i>Book Appointment
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Why Hospitals Choose Our System</h2>
          <p className="text-xl text-center text-gray-600 mb-16 max-w-3xl mx-auto">Trusted by healthcare providers worldwide to deliver exceptional patient care with efficiency</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="stat-card bg-white p-8 rounded-2xl border border-gray-100 text-center transition duration-300 shadow-lg hover:shadow-xl">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-user-md text-blue-600 text-3xl"></i>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">500+ Healthcare Providers</h3>
              <p className="text-gray-600">Trusted by hospitals and clinics worldwide to manage their operations efficiently.</p>
            </div>
            <div className="stat-card bg-white p-8 rounded-2xl border border-gray-100 text-center transition duration-300 shadow-lg hover:shadow-xl">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-clock text-green-500 text-3xl"></i>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">40% Time Saved</h3>
              <p className="text-gray-600">Reduce administrative tasks and focus more on patient care with our streamlined system.</p>
            </div>
            <div className="stat-card bg-white p-8 rounded-2xl border border-gray-100 text-center transition duration-300 shadow-lg hover:shadow-xl">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-chart-line text-blue-600 text-3xl"></i>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">30% Growth</h3>
              <p className="text-gray-600">Hospitals using our system see significant growth in patient satisfaction and operational efficiency.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Comprehensive Features</h2>
          <p className="text-xl text-center text-gray-600 mb-16 max-w-3xl mx-auto">Everything you need to manage your healthcare facility efficiently</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 transform transition duration-300 hover:-translate-y-2">
              <div className="flex items-start mb-5">
                <div className="bg-blue-100 p-4 rounded-xl mr-5">
                  <i className="fas fa-user-injured text-blue-600 text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Patient Management</h3>
                  <p className="text-gray-600">Complete patient records, medical history, and treatment plans in one secure system.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 transform transition duration-300 hover:-translate-y-2">
              <div className="flex items-start mb-5">
                <div className="bg-green-100 p-4 rounded-xl mr-5">
                  <i className="fas fa-calendar-check text-green-500 text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Appointment Scheduling</h3>
                  <p className="text-gray-600">Streamlined booking system with automated reminders for patients and staff.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 transform transition duration-300 hover:-translate-y-2">
              <div className="flex items-start mb-5">
                <div className="bg-blue-100 p-4 rounded-xl mr-5">
                  <i className="fas fa-pills text-blue-600 text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Pharmacy Management</h3>
                  <p className="text-gray-600">Track inventory, manage prescriptions, and automate refill requests.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 transform transition duration-300 hover:-translate-y-2">
              <div className="flex items-start mb-5">
                <div className="bg-green-100 p-4 rounded-xl mr-5">
                  <i className="fas fa-file-invoice-dollar text-green-500 text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Billing & Insurance</h3>
                  <p className="text-gray-600">Automated billing, insurance claims processing, and financial reporting.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">What Our Clients Say</h2>
          <p className="text-xl text-center text-gray-600 mb-16 max-w-3xl mx-auto">Hear from healthcare professionals who have transformed their practice with our system</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-gradient-to-br from-blue-50 to-white p-10 rounded-2xl shadow-lg border border-blue-100">
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mr-5">JD</div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-lg">Dr. James Davidson</h4>
                  <p className="text-gray-600">Chief Medical Officer, City Hospital</p>
                </div>
              </div>
              <div className="relative pl-6">
                <div className="absolute left-0 top-0 text-4xl text-blue-400 font-serif">"</div>
                <p className="text-gray-700 text-lg italic">
                  This system has transformed how we manage patient care. The efficiency gains have allowed our staff to focus more on patients and less on paperwork.
                </p>
              </div>
              <div className="flex mt-6">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className="fas fa-star text-yellow-400 text-lg mr-1"></i>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-white p-10 rounded-2xl shadow-lg border border-green-100">
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mr-5">SR</div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-lg">Sarah Reynolds</h4>
                  <p className="text-gray-600">Hospital Administrator, MedCenter</p>
                </div>
              </div>
              <div className="relative pl-6">
                <div className="absolute left-0 top-0 text-4xl text-green-400 font-serif">"</div>
                <p className="text-gray-700 text-lg italic">
                  The billing and insurance modules have reduced our payment processing time by 65%. The ROI was evident within the first three months of implementation.
                </p>
              </div>
              <div className="flex mt-6">
                {[...Array(4)].map((_, i) => (
                  <i key={i} className="fas fa-star text-yellow-400 text-lg mr-1"></i>
                ))}
                <i className="fas fa-star-half-alt text-yellow-400 text-lg mr-1"></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-800 to-blue-600">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Transform Your Healthcare Management?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">Join thousands of healthcare providers who have streamlined their operations with our hospital management system.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <Link
              to="/signup"
              className="bg-white text-blue-700 hover:bg-blue-50 font-semibold py-3 px-8 rounded-lg transition duration-300 shadow-lg hover:shadow-xl"
            >
              <i className="fas fa-rocket mr-2"></i>Get Started
            </Link>
            <Link
              to="/login"
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg transition duration-300 shadow-lg hover:shadow-xl"
            >
              <i className="fas fa-sign-in-alt mr-2"></i>Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        
      </footer>
    </div>
  );
};

export default HomePage;