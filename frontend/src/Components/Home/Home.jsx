import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../Admin/Header';


const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgcGF0dGVyblRyYW5zZm9ybT0icm90YXRlKDQ1KSI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMyIgZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIwLjA4Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3BhdHRlcm4pIi8+PC9zdmc+')] opacity-30"></div>
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-blue-400 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-indigo-300 rounded-full opacity-25 animate-bounce"></div>
          <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-blue-300 rounded-full opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 right-1/3 w-24 h-24 bg-indigo-400 rounded-full opacity-15 animate-bounce" style={{animationDelay: '2s'}}></div>
        </div>
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center min-h-[600px]">
            <div className="lg:w-1/2 mb-12 lg:mb-0 space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-blue-600/30 backdrop-blur-sm rounded-full border border-blue-400/30">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  <span className="text-sm font-medium text-blue-100">Leading Healthcare Solutions</span>
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">
                  Advanced Healthcare Management
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed max-w-2xl">
                  Transform your healthcare facility with our cutting-edge management system designed for modern medical excellence.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/patient-dashboard"
                  className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
                >
                  <i className="fas fa-users mr-3 group-hover:animate-pulse"></i>View Patients
                </Link>
                <Link
                  to="/appointments"
                  className="group bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white hover:text-blue-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
                >
                  <i className="fas fa-calendar-check mr-3 group-hover:animate-pulse"></i>Appointments
                </Link>
              </div>
            </div>
            
            {/* Hospital Image - replacing appointment form */}
            <div className="lg:w-1/2 flex justify-center">
              <div className="relative group">
                {/* Main image with effects */}
                <div className="relative overflow-hidden rounded-3xl shadow-2xl transform transition-all duration-700 hover:scale-[1.02] hover:-rotate-1 group-hover:shadow-3xl">
                  {/* Glowing effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-indigo-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10"></div>
                  
                  {/* The hospital image */}
                  <img 
                    src="/hospital.jpg" 
                    alt="Modern Hospital Facility" 
                    className="w-full h-auto object-cover rounded-3xl transition-all duration-700"
                    style={{ maxHeight: "550px" }}
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/800x600/EEE/31343C?text=Hospital+Facility";
                    }}
                  />
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent rounded-3xl"></div>
                  
                  {/* Image caption */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
                      <h3 className="text-xl font-bold">State-of-the-Art Facilities</h3>
                      <p className="text-sm text-blue-100 mt-2">Equipped with cutting-edge technology and staffed by dedicated healthcare professionals</p>
                    </div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-30 blur-xl animate-pulse"></div>
                <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-30 blur-xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
                
                {/* Floating badges */}
                <div className="absolute top-10 -left-10 bg-white rounded-2xl px-4 py-2 shadow-xl transform -rotate-12 group-hover:-rotate-6 transition-all duration-500">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <i className="fas fa-heartbeat text-white text-xs"></i>
                    </div>
                    <span className="text-blue-800 font-bold text-sm">Healthcare Excellence</span>
                  </div>
                </div>
                
                <div className="absolute bottom-10 -right-10 bg-white rounded-2xl px-4 py-2 shadow-xl transform rotate-12 group-hover:rotate-6 transition-all duration-500">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                      <i className="fas fa-user-md text-white text-xs"></i>
                    </div>
                    <span className="text-green-800 font-bold text-sm">Expert Staff</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-br from-white via-blue-50 to-indigo-100 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600"></div>
        </div>
        <div className="container mx-auto px-4 md:px-8 relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
              <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Trusted Worldwide</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Why Healthcare Leaders Choose Us
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Join thousands of healthcare providers worldwide who trust our platform to deliver exceptional patient care with unprecedented efficiency
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            <div className="group bg-white p-10 rounded-3xl border border-gray-100 text-center transition-all duration-500 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg transform group-hover:rotate-6 transition-transform duration-500">
                  <i className="fas fa-user-md text-white text-3xl group-hover:scale-110 transition-transform duration-300"></i>
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">500+</h3>
                  <h4 className="text-lg font-semibold text-gray-700 uppercase tracking-wide">Healthcare Providers</h4>
                  <p className="text-gray-600 leading-relaxed">Trusted by hospitals and clinics worldwide to manage their operations with excellence and precision.</p>
                </div>
              </div>
            </div>
            <div className="group bg-white p-10 rounded-3xl border border-gray-100 text-center transition-all duration-500 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg transform group-hover:rotate-6 transition-transform duration-500">
                  <i className="fas fa-clock text-white text-3xl group-hover:scale-110 transition-transform duration-300"></i>
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-bold text-gray-800 group-hover:text-green-600 transition-colors duration-300">40%</h3>
                  <h4 className="text-lg font-semibold text-gray-700 uppercase tracking-wide">Time Saved</h4>
                  <p className="text-gray-600 leading-relaxed">Dramatically reduce administrative overhead and focus more resources on what matters most - patient care.</p>
                </div>
              </div>
            </div>
            <div className="group bg-white p-10 rounded-3xl border border-gray-100 text-center transition-all duration-500 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg transform group-hover:rotate-6 transition-transform duration-500">
                  <i className="fas fa-chart-line text-white text-3xl group-hover:scale-110 transition-transform duration-300"></i>
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-300">30%</h3>
                  <h4 className="text-lg font-semibold text-gray-700 uppercase tracking-wide">Growth</h4>
                  <p className="text-gray-600 leading-relaxed">Healthcare facilities experience significant improvements in patient satisfaction and operational metrics.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-indigo-100 rounded-full mb-6">
              <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2 animate-pulse"></span>
              <span className="text-sm font-semibold text-indigo-700 uppercase tracking-wide">Comprehensive Solutions</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Everything You Need for Modern Healthcare
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Powerful, integrated features designed to streamline every aspect of your healthcare facility operations
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="group bg-white p-10 rounded-3xl shadow-lg border border-gray-100 transform transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-start mb-8">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl mr-6 shadow-lg transform group-hover:rotate-3 group-hover:scale-110 transition-all duration-500">
                    <i className="fas fa-user-injured text-white text-3xl"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-blue-600 transition-colors duration-300">Patient Management</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">Comprehensive patient records, medical history tracking, and treatment plans - all seamlessly integrated in one secure, HIPAA-compliant system.</p>
                    <div className="mt-6 flex items-center text-blue-600 font-semibold group-hover:text-blue-700 transition-colors duration-300">
                      <span className="mr-2">Learn more</span>
                      <i className="fas fa-arrow-right transform group-hover:translate-x-2 transition-transform duration-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="group bg-white p-10 rounded-3xl shadow-lg border border-gray-100 transform transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-start mb-8">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl mr-6 shadow-lg transform group-hover:rotate-3 group-hover:scale-110 transition-all duration-500">
                    <i className="fas fa-calendar-check text-white text-3xl"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-green-600 transition-colors duration-300">Smart Scheduling</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">Advanced appointment booking with automated reminders, staff coordination, and intelligent conflict resolution for maximum efficiency.</p>
                    <div className="mt-6 flex items-center text-green-600 font-semibold group-hover:text-green-700 transition-colors duration-300">
                      <span className="mr-2">Learn more</span>
                      <i className="fas fa-arrow-right transform group-hover:translate-x-2 transition-transform duration-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="group bg-white p-10 rounded-3xl shadow-lg border border-gray-100 transform transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-start mb-8">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-2xl mr-6 shadow-lg transform group-hover:rotate-3 group-hover:scale-110 transition-all duration-500">
                    <i className="fas fa-pills text-white text-3xl"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-purple-600 transition-colors duration-300">Pharmacy Management</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">Complete inventory tracking, prescription management, and automated refill systems to ensure medication availability and safety.</p>
                    <div className="mt-6 flex items-center text-purple-600 font-semibold group-hover:text-purple-700 transition-colors duration-300">
                      <span className="mr-2">Learn more</span>
                      <i className="fas fa-arrow-right transform group-hover:translate-x-2 transition-transform duration-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="group bg-white p-10 rounded-3xl shadow-lg border border-gray-100 transform transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-yellow-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-start mb-8">
                  <div className="bg-gradient-to-br from-orange-500 to-yellow-600 p-6 rounded-2xl mr-6 shadow-lg transform group-hover:rotate-3 group-hover:scale-110 transition-all duration-500">
                    <i className="fas fa-file-invoice-dollar text-white text-3xl"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-orange-600 transition-colors duration-300">Billing & Analytics</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">Automated billing processes, insurance claims management, and comprehensive financial reporting with real-time analytics.</p>
                    <div className="mt-6 flex items-center text-orange-600 font-semibold group-hover:text-orange-700 transition-colors duration-300">
                      <span className="mr-2">Learn more</span>
                      <i className="fas fa-arrow-right transform group-hover:translate-x-2 transition-transform duration-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJzdGFycyIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
          <div className="absolute top-20 right-20 w-32 h-32 bg-blue-400 rounded-full opacity-10 animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-purple-400 rounded-full opacity-15 animate-bounce"></div>
        </div>
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></span>
              <span className="text-sm font-semibold text-white uppercase tracking-wide">Client Stories</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">What Healthcare Leaders Say</h2>
            <p className="text-xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Discover how healthcare professionals have transformed their practice with our comprehensive management system
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
            <div className="group bg-white/95 backdrop-blur-sm p-10 rounded-3xl shadow-2xl border border-white/20 transform transition-all duration-500 hover:-translate-y-2 hover:shadow-3xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center mb-8">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mr-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                      JD
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <i className="fas fa-quote-left text-white text-sm"></i>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-xl mb-1">Dr. James Davidson</h4>
                    <p className="text-gray-600 text-sm font-medium">Chief Medical Officer</p>
                    <p className="text-blue-600 text-sm font-semibold">City Hospital</p>
                  </div>
                </div>
                <div className="relative mb-8">
                  <div className="absolute -left-2 -top-2 text-6xl text-blue-200 font-serif opacity-50">"</div>
                  <p className="text-gray-700 text-lg leading-relaxed pl-8 italic">
                    This system has completely revolutionized how we manage patient care. The efficiency gains have been remarkable - our staff can now focus 60% more time on patients and significantly less on paperwork. It's been a game-changer.
                  </p>
                  <div className="absolute -bottom-2 -right-2 text-6xl text-blue-200 font-serif opacity-50 transform rotate-180">"</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className="fas fa-star text-yellow-400 text-lg"></i>
                    ))}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">6 months ago</div>
                </div>
              </div>
            </div>
            
            <div className="group bg-white/95 backdrop-blur-sm p-10 rounded-3xl shadow-2xl border border-white/20 transform transition-all duration-500 hover:-translate-y-2 hover:shadow-3xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center mb-8">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mr-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                      SR
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <i className="fas fa-quote-left text-white text-sm"></i>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-xl mb-1">Sarah Reynolds</h4>
                    <p className="text-gray-600 text-sm font-medium">Hospital Administrator</p>
                    <p className="text-green-600 text-sm font-semibold">MedCenter</p>
                  </div>
                </div>
                <div className="relative mb-8">
                  <div className="absolute -left-2 -top-2 text-6xl text-green-200 font-serif opacity-50">"</div>
                  <p className="text-gray-700 text-lg leading-relaxed pl-8 italic">
                    The billing and insurance modules have reduced our payment processing time by 65%. The ROI was evident within the first three months. Our financial workflows have never been more efficient.
                  </p>
                  <div className="absolute -bottom-2 -right-2 text-6xl text-green-200 font-serif opacity-50 transform rotate-180">"</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {[...Array(4)].map((_, i) => (
                      <i key={i} className="fas fa-star text-yellow-400 text-lg"></i>
                    ))}
                    <i className="fas fa-star-half-alt text-yellow-400 text-lg"></i>
                  </div>
                  <div className="text-sm text-gray-500 font-medium">3 months ago</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-16">
            <div className="inline-flex items-center space-x-8 text-white/70">
              <div className="flex items-center">
                <i className="fas fa-star text-yellow-400 mr-2"></i>
                <span className="font-semibold">4.9/5 Rating</span>
              </div>
              <div className="w-px h-6 bg-white/30"></div>
              <div className="flex items-center">
                <i className="fas fa-users text-blue-400 mr-2"></i>
                <span className="font-semibold">500+ Reviews</span>
              </div>
              <div className="w-px h-6 bg-white/30"></div>
              <div className="flex items-center">
                <i className="fas fa-heart text-red-400 mr-2"></i>
                <span className="font-semibold">98% Satisfaction</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-800 via-indigo-800 to-blue-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        <div className="container mx-auto px-4 md:px-8 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full mb-8 border border-white/20">
              <span className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></span>
              <span className="text-sm font-semibold text-white uppercase tracking-wide">Transform Your Healthcare Today</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
              Ready to Revolutionize Your 
              <span className="block bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
                Healthcare Management?
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 mb-12 leading-relaxed max-w-3xl mx-auto">
              Join thousands of healthcare providers who have streamlined their operations and enhanced patient care with our comprehensive management system.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-12">
              <Link
                to="/signup"
                className="group bg-white hover:bg-gray-50 text-blue-700 font-bold py-4 px-10 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 hover:scale-105 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center">
                  <i className="fas fa-rocket mr-3 group-hover:animate-bounce"></i>
                  <span>Start Free Trial</span>
                  <i className="fas fa-arrow-right ml-3 transform group-hover:translate-x-1 transition-transform duration-300"></i>
                </div>
              </Link>
              <Link
                to="/login"
                className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 hover:scale-105 relative overflow-hidden border-2 border-green-400/30"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center">
                  <i className="fas fa-sign-in-alt mr-3 group-hover:animate-pulse"></i>
                  <span>Login Now</span>
                  <i className="fas fa-arrow-right ml-3 transform group-hover:translate-x-1 transition-transform duration-300"></i>
                </div>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                  <i className="fas fa-shield-alt text-white text-2xl"></i>
                </div>
                <h4 className="text-white font-semibold mb-2">HIPAA Compliant</h4>
                <p className="text-blue-200 text-sm">Secure & Protected</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                  <i className="fas fa-cloud text-white text-2xl"></i>
                </div>
                <h4 className="text-white font-semibold mb-2">Cloud-Based</h4>
                <p className="text-blue-200 text-sm">Access Anywhere</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                  <i className="fas fa-headset text-white text-2xl"></i>
                </div>
                <h4 className="text-white font-semibold mb-2">24/7 Support</h4>
                <p className="text-blue-200 text-sm">Always Available</p>
              </div>
            </div>
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