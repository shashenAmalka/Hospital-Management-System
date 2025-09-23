import React from 'react';
import { 
  MapPin, 
  Users, 
  Award, 
  Heart, 
  Shield, 
  Clock, 
  Star, 
  Target,
  CheckCircle,
  Phone,
  Mail,
  Stethoscope,
  Building2
} from 'lucide-react';

function About() {
  const stats = [
    { number: '15+', label: 'Years of Service', icon: <Clock className="w-6 h-6" /> },
    { number: '50+', label: 'Expert Doctors', icon: <Users className="w-6 h-6" /> },
    { number: '10,000+', label: 'Patients Treated', icon: <Heart className="w-6 h-6" /> },
    { number: '24/7', label: 'Emergency Care', icon: <Shield className="w-6 h-6" /> }
  ];

  const specialties = [
    'General Medicine', 'Cardiology', 'Pediatrics', 'Orthopedics',
    'Neurology', 'Emergency Medicine', 'Laboratory Services', 'Pharmacy'
  ];

  const values = [
    {
      icon: <Heart className="w-8 h-8 text-red-500" />,
      title: 'Compassionate Care',
      description: 'We treat every patient with empathy, respect, and dignity, ensuring personalized care for all.'
    },
    {
      icon: <Award className="w-8 h-8 text-yellow-500" />,
      title: 'Medical Excellence',
      description: 'Our commitment to the highest standards of medical practice and continuous improvement.'
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-500" />,
      title: 'Patient Safety',
      description: 'Maintaining the safest environment possible for our patients, families, and staff.'
    },
    {
      icon: <Users className="w-8 h-8 text-green-500" />,
      title: 'Community Focus',
      description: 'Dedicated to serving the Akuressa community and surrounding regions with accessible healthcare.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white opacity-5 rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-white opacity-5 rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white opacity-5 rounded-full"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                <Building2 className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              About HelaMed Hospital
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed">
              Akuressa's Premier Healthcare Institution
            </p>
            <div className="flex items-center justify-center mt-6 text-blue-200">
              <MapPin className="w-6 h-6 mr-2" />
              <span className="text-lg">Located in the heart of Akuressa, Southern Province, Sri Lanka</span>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <div className="text-white">{stat.icon}</div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-800 mb-6">
                  Our Story
                </h2>
                <div className="space-y-6 text-gray-700 leading-relaxed">
                  <p className="text-lg">
                    Established in 2008, HelaMed Hospital has been serving the Akuressa community and surrounding regions 
                    in the Southern Province of Sri Lanka with dedication and excellence. What began as a vision to provide 
                    world-class healthcare to rural Sri Lanka has grown into a trusted medical institution.
                  </p>
                  <p className="text-lg">
                    Located in the picturesque town of Akuressa, surrounded by lush tea plantations and rubber estates, 
                    our hospital stands as a beacon of hope and healing. We pride ourselves on combining modern medical 
                    technology with the warm, personal care that reflects our Sri Lankan values.
                  </p>
                  <p className="text-lg">
                    Our commitment extends beyond treating illness – we focus on preventive care, health education, 
                    and community wellness programs that have made a lasting impact on thousands of families in the region.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-8 rounded-3xl shadow-2xl">
                  <div className="bg-white p-6 rounded-2xl">
                    <div className="flex items-center mb-4">
                      <Target className="w-8 h-8 text-blue-600 mr-3" />
                      <h3 className="text-xl font-bold text-gray-800">Our Mission</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      To provide exceptional healthcare services that are accessible, affordable, and delivered with 
                      compassion to the people of Akuressa and beyond, while maintaining the highest standards of 
                      medical excellence and patient safety.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Core Values</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The principles that guide everything we do at HelaMed Hospital
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="group bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
                  <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md group-hover:scale-110 transition-transform duration-300">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 text-center mb-4">{value.title}</h3>
                  <p className="text-gray-600 text-center leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Medical Specialties</h2>
            <p className="text-xl text-gray-600 mb-12">
              Comprehensive healthcare services under one roof
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {specialties.map((specialty, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 group">
                  <div className="flex items-center justify-center mb-3">
                    <Stethoscope className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="font-semibold text-gray-800">{specialty}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recognition Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-12">Recognition & Certifications</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-8 rounded-2xl border border-yellow-200">
                <Award className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">ISO 9001:2015</h3>
                <p className="text-gray-600">Quality Management System Certified</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-200">
                <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">SLMC Accredited</h3>
                <p className="text-gray-600">Sri Lanka Medical Council Recognition</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-2xl border border-blue-200">
                <Star className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Community Choice</h3>
                <p className="text-gray-600">Most Trusted Hospital in Southern Province</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Experience Quality Healthcare?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of satisfied patients who trust HelaMed Hospital for their healthcare needs.
            </p>
            <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6">
              <a 
                href="/contact-us" 
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition duration-300 shadow-lg"
              >
                Contact Us Today
              </a>
              <div className="flex items-center space-x-4 text-blue-100">
                <div className="flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  <span>+94 41 222 8000</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  <span>info@helamed.lk</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;