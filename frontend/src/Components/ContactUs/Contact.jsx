import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Calendar,
  MessageSquare,
  Send,
  CheckCircle,
  Ambulance,
  Stethoscope,
  UserPlus,
  Info,
  AlertCircle
} from 'lucide-react';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          inquiryType: 'general'
        });
      }, 3000);
    }, 1000);
  };

  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Phone Numbers',
      details: [
        { label: 'Main Reception', value: '+94 41 222 8000' },
        { label: 'Emergency Hotline', value: '+94 41 222 8911' },
        { label: 'Appointments', value: '+94 41 222 8100' }
      ],
      color: 'from-green-500 to-green-600'
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email Addresses',
      details: [
        { label: 'General Inquiries', value: 'info@helamed.lk' },
        { label: 'Appointments', value: 'appointments@helamed.lk' },
        { label: 'Emergency', value: 'emergency@helamed.lk' }
      ],
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Hospital Address',
      details: [
        { label: 'Address', value: '123, Main Street, Akuressa' },
        { label: 'City', value: 'Akuressa, Matara District' },
        { label: 'Province', value: 'Southern Province, Sri Lanka' }
      ],
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Operating Hours',
      details: [
        { label: 'Emergency', value: '24/7 Available' },
        { label: 'OPD Hours', value: '8:00 AM - 6:00 PM' },
        { label: 'Pharmacy', value: '7:00 AM - 10:00 PM' }
      ],
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const quickActions = [
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Book Appointment',
      description: 'Schedule your consultation with our expert doctors',
      action: 'Book Now',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <Ambulance className="w-8 h-8" />,
      title: 'Emergency Services',
      description: '24/7 emergency care for critical situations',
      action: 'Call Emergency',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: <Stethoscope className="w-8 h-8" />,
      title: 'Medical Consultation',
      description: 'Get expert medical advice from our specialists',
      action: 'Consult Now',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: <UserPlus className="w-8 h-8" />,
      title: 'Patient Registration',
      description: 'Register as a new patient for our services',
      action: 'Register',
      color: 'from-purple-500 to-purple-600'
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
                <MessageSquare className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Contact HelaMed Hospital
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed">
              We're here to serve you 24/7. Reach out to us for any healthcare needs.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Quick Actions</h2>
              <p className="text-gray-600 text-lg">Get immediate assistance with these quick access options</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <div key={index} className="group bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
                  <div className={`bg-gradient-to-r ${action.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <div className="text-white">{action.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 text-center mb-3">{action.title}</h3>
                  <p className="text-gray-600 text-center text-sm mb-4 leading-relaxed">{action.description}</p>
                  <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium transition duration-300">
                    {action.action}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information & Form Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              
              {/* Contact Information */}
              <div>
                <h2 className="text-4xl font-bold text-gray-800 mb-8">Get In Touch</h2>
                <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                  HelaMed Hospital is committed to providing you with the best healthcare experience. 
                  Contact us through any of the following methods, and our friendly staff will be happy to assist you.
                </p>
                
                <div className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                      <div className="flex items-center mb-4">
                        <div className={`bg-gradient-to-r ${info.color} w-12 h-12 rounded-xl flex items-center justify-center mr-4 shadow-md`}>
                          <div className="text-white">{info.icon}</div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">{info.title}</h3>
                      </div>
                      <div className="space-y-2 ml-16">
                        {info.details.map((detail, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">{detail.label}:</span>
                            <span className="text-gray-800 font-semibold">{detail.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
                <h3 className="text-3xl font-bold text-gray-800 mb-6">Send us a Message</h3>
                
                {isSubmitted ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h4 className="text-2xl font-bold text-gray-800 mb-2">Message Sent Successfully!</h4>
                    <p className="text-gray-600">Thank you for contacting us. We'll get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Inquiry Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Inquiry Type</label>
                      <select 
                        name="inquiryType"
                        value={formData.inquiryType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                        required
                      >
                        <option value="general">General Inquiry</option>
                        <option value="appointment">Appointment Request</option>
                        <option value="emergency">Emergency</option>
                        <option value="feedback">Feedback/Complaint</option>
                        <option value="medical">Medical Information</option>
                      </select>
                    </div>

                    {/* Name and Email */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input 
                          type="text" 
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input 
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>

                    {/* Phone and Subject */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input 
                          type="tel" 
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          placeholder="+94 XX XXX XXXX"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                        <input 
                          type="text" 
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          placeholder="Brief subject"
                          required
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                      <textarea 
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows="5"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-none"
                        placeholder="Please provide details about your inquiry..."
                        required
                      ></textarea>
                    </div>

                    {/* Submit Button */}
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition duration-300 shadow-lg flex items-center justify-center ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Send className="w-5 h-5 mr-2" />
                      )}
                      {isLoading ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Alert Section */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-red-700">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="flex justify-center mb-6">
              <AlertCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Medical Emergency?</h2>
            <p className="text-xl text-red-100 mb-8">
              If you're experiencing a medical emergency, don't hesitate to contact us immediately.
            </p>
            <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="bg-white/20 backdrop-blur-sm px-8 py-4 rounded-lg border border-white/30">
                <div className="flex items-center">
                  <Ambulance className="w-6 h-6 mr-3" />
                  <div className="text-left">
                    <div className="text-sm text-red-100">Emergency Hotline</div>
                    <div className="text-xl font-bold">+94 41 222 8911</div>
                  </div>
                </div>
              </div>
              <div className="text-red-100">
                <Info className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm">Available 24/7 • Ambulance Service • Emergency Ward</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Find Us</h2>
              <p className="text-gray-600 text-lg">Located in the heart of Akuressa, easily accessible from all major routes</p>
            </div>
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-96 rounded-2xl shadow-lg flex items-center justify-center border border-gray-200">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-600 mb-2">Interactive Map</h3>
                <p className="text-gray-500 mb-4">123, Main Street, Akuressa<br />Matara District, Southern Province</p>
                <a 
                  href="https://maps.app.goo.gl/EpC6akUo5n8jWv4bA" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition duration-300"
                >
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;