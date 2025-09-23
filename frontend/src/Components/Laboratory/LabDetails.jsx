import React, { useState } from 'react';
import { Search, Microscope, Beaker, TestTube, Activity, Clock, FileText, Star, ArrowRight, Phone, MapPin, Mail, Calendar } from 'lucide-react';
import labTeamImage from '../../assets/lab-team.jpg';

const LabDetails = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Laboratory test categories
  const testCategories = [
    { name: 'Hematology', icon: Microscope, color: 'bg-red-100 text-red-600' },
    { name: 'Clinical Biochemistry', icon: Beaker, color: 'bg-blue-100 text-blue-600' },
    { name: 'Immunology', icon: TestTube, color: 'bg-green-100 text-green-600' },
    { name: 'Clinical Pathology', icon: Activity, color: 'bg-purple-100 text-purple-600' },
    { name: 'Microbiology', icon: Microscope, color: 'bg-orange-100 text-orange-600' },
    { name: 'Molecular Biology', icon: TestTube, color: 'bg-teal-100 text-teal-600' },
    { name: 'Serology', icon: Beaker, color: 'bg-pink-100 text-pink-600' },
    { name: 'Toxicology', icon: Activity, color: 'bg-indigo-100 text-indigo-600' }
  ];

  // Quick service buttons
  const quickServices = [
    { name: 'Our Tests', icon: Microscope, color: 'bg-blue-500' },
    { name: 'Book a Mobile Test', icon: Calendar, color: 'bg-green-500' },
    { name: 'Laboratory Network', icon: MapPin, color: 'bg-purple-500' },
    { name: 'Get Your Results', icon: FileText, color: 'bg-orange-500' }
  ];

  // Laboratory tests (A-Z)
  const labTests = [
    'Alanine Aminotransferase (ALT)',
    'Albumin',
    'Blood Glucose',
    'Blood Urea Nitrogen (BUN)',
    'C-Reactive Protein (CRP)',
    'Complete Blood Count (CBC)',
    'Creatinine',
    'D-Dimer',
    'Electrolytes Panel',
    'Erythrocyte Sedimentation Rate (ESR)',
    'Fasting Blood Sugar',
    'Full Blood Count',
    'Glucose Tolerance Test',
    'Hemoglobin A1C',
    'Iron Studies',
    'Kidney Function Test',
    'Lipid Profile',
    'Liver Function Test',
    'Magnesium',
    'Platelet Count',
    'Prothrombin Time (PT)',
    'Random Blood Sugar',
    'Thyroid Function Test',
    'Troponin',
    'Uric Acid',
    'Urinalysis',
    'Vitamin B12',
    'Vitamin D',
    'White Blood Cell Count'
  ];

  const filteredTests = labTests.filter(test => 
    test.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Laboratory Services
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Gayamal is committed with ISO 15189: 2023 certification from Sri Lanka Accreditation Board (SLAB) as a medical laboratory in Clinical biochemistry, Clinical pathology and Urology. We develop sections, labs participate in external quality assurance program with United Kingdom and local EQA's. Since 2009 in the USA, Gayamal is registered with the Ministry of Health and conducting body for Private Medical Institutions in Sri Lanka. We currently registered with the Ministry of Health and provide care in our medical for sessions.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">25+</div>
                  <div className="text-blue-200">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">500+</div>
                  <div className="text-blue-200">Daily Tests</div>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex lg:justify-end lg:items-center h-full">
              <img 
                src={labTeamImage} 
                alt="Laboratory Team"
                className="w-full h-full max-h-96 object-cover rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Services */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                >
                  <div className={`${service.color} w-16 h-16 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="text-white text-2xl" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{service.name}</h3>
                  <ArrowRight className="text-blue-600 group-hover:translate-x-1 transition-transform duration-300" size={20} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lab Testing Categories */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-green-600 mb-2">OUR SCOPE</h2>
            <h3 className="text-4xl font-bold text-gray-800 mb-4">
              Explore our<br />
              Lab Testing Category
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div 
                  key={index}
                  className="group cursor-pointer"
                >
                  <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 h-64 overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 opacity-0 group-hover:opacity-90 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className={`${category.color} w-16 h-16 rounded-lg flex items-center justify-center mb-4 group-hover:bg-white group-hover:text-blue-600 transition-all duration-300`}>
                        <Icon size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-white transition-colors duration-300">
                        {category.name}
                      </h3>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Find Laboratory Tests */}
      <div className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-green-600 mb-2">OUR TESTS</h2>
            <h3 className="text-4xl font-bold text-gray-800 mb-8">
              Find Our<br />
              All Laboratory Tests Here
            </h3>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search Medical Test Name Here"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Test Results */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            {searchTerm ? (
              <div>
                <h4 className="text-xl font-semibold text-gray-800 mb-6">
                  {filteredTests.length} tests found for "{searchTerm}"
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTests.map((test, index) => (
                    <div 
                      key={index}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-gray-800">{test}</span>
                        <ArrowRight className="text-blue-600" size={16} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Beaker className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 text-lg">
                  Search for a test name or click on a letter to browse tests
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Need Help with Laboratory Services?
              </h2>
              <p className="text-xl mb-8 text-blue-100">
                Our laboratory team is available 24/7 to assist you with test bookings, 
                results, and any questions about our services.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone className="mr-3" size={20} />
                  <span>+94 47 223 4567</span>
                </div>
                <div className="flex items-center">
                  <Mail className="mr-3" size={20} />
                  <span>lab@helamedakuressa.lk</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-3" size={20} />
                  <span>24/7 Emergency Lab Services</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-50 transition-colors duration-300 shadow-lg">
                Book a Test Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabDetails;