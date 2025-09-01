import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <section className="hero-bg text-white py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Advanced Healthcare Management Solutions</h1>
              <p className="text-xl mb-8 text-blue-100">Streamlining hospital operations with our comprehensive management system designed for modern healthcare facilities.</p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/patient-dashboard"
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
                >
                  View Patients
                </Link>
                <Link
                  to="/appointments"
                  className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg transition duration-300"
                >
                  Appointments
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="bg-white rounded-xl p-6 shadow-xl max-w-md">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Quick Appointment</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Full Name</label>
                    <input type="text" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Email Address</label>
                    <input type="email" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Department</label>
                    <select className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">
                      <option>Cardiology</option>
                      <option>Neurology</option>
                      <option>Orthopedics</option>
                      <option>Pediatrics</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300">
                    Book Appointment
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Why Hospitals Choose Our System</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="stat-card bg-gray-50 p-8 rounded-xl border border-gray-100 text-center transition duration-300">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-user-md text-blue-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">500+ Healthcare Providers</h3>
              <p className="text-gray-600">Trusted by hospitals and clinics worldwide to manage their operations efficiently.</p>
            </div>
            <div className="stat-card bg-gray-50 p-8 rounded-xl border border-gray-100 text-center transition duration-300">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-clock text-green-500 text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">40% Time Saved</h3>
              <p className="text-gray-600">Reduce administrative tasks and focus more on patient care with our streamlined system.</p>
            </div>
            <div className="stat-card bg-gray-50 p-8 rounded-xl border border-gray-100 text-center transition duration-300">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-chart-line text-blue-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">30% Growth</h3>
              <p className="text-gray-600">Hospitals using our system see significant growth in patient satisfaction and operational efficiency.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Comprehensive Features</h2>
          <p className="text-xl text-center text-gray-600 mb-12">Everything you need to manage your healthcare facility efficiently</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-start mb-4">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <i className="fas fa-user-injured text-blue-600 text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Patient Management</h3>
                  <p className="text-gray-600 mt-2">Complete patient records, medical history, and treatment plans in one secure system.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-start mb-4">
                <div className="bg-green-100 p-3 rounded-lg mr-4">
                  <i className="fas fa-calendar-check text-green-500 text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Appointment Scheduling</h3>
                  <p className="text-gray-600 mt-2">Streamlined booking system with automated reminders for patients and staff.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-start mb-4">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <i className="fas fa-pills text-blue-600 text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Pharmacy Management</h3>
                  <p className="text-gray-600 mt-2">Track inventory, manage prescriptions, and automate refill requests.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-start mb-4">
                <div className="bg-green-100 p-3 rounded-lg mr-4">
                  <i className="fas fa-file-invoice-dollar text-green-500 text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Billing & Insurance</h3>
                  <p className="text-gray-600 mt-2">Automated billing, insurance claims processing, and financial reporting.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">What Our Clients Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">JD</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Dr. James Davidson</h4>
                  <p className="text-gray-600">Chief Medical Officer, City Hospital</p>
                </div>
              </div>
              <p className="text-gray-700 italic">"This system has transformed how we manage patient care. The efficiency gains have allowed our staff to focus more on patients and less on paperwork."</p>
              <div className="flex mt-4">
                <i className="fas fa-star text-yellow-400"></i>
                <i className="fas fa-star text-yellow-400"></i>
                <i className="fas fa-star text-yellow-400"></i>
                <i className="fas fa-star text-yellow-400"></i>
                <i className="fas fa-star text-yellow-400"></i>
              </div>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">SR</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Sarah Reynolds</h4>
                  <p className="text-gray-600">Hospital Administrator, MedCenter</p>
                </div>
              </div>
              <p className="text-gray-700 italic">"The billing and insurance modules have reduced our payment processing time by 65%. The ROI was evident within the first three months of implementation."</p>
              <div className="flex mt-4">
                <i className="fas fa-star text-yellow-400"></i>
                <i className="fas fa-star text-yellow-400"></i>
                <i className="fas fa-star text-yellow-400"></i>
                <i className="fas fa-star text-yellow-400"></i>
                <i className="fas fa-star-half-alt text-yellow-400"></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Transform Your Healthcare Management?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">Join thousands of healthcare providers who have streamlined their operations with our hospital management system.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/signup"
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 px-8 rounded-lg transition duration-300"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg transition duration-300"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 Hospital Management System | All rights reserved</p>
        </div>
      </footer>

      <style jsx>{`
        .hero-bg {
          background: linear-gradient(rgba(37, 99, 235, 0.85), rgba(37, 99, 235, 0.9)), url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect fill="white" fill-opacity="0.1" width="10" height="10"/></svg>');
          background-size: cover;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default HomePage;