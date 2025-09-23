import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, MapPin, Edit3, Save, X, Camera, Shield, Award, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { MdQrCode } from 'react-icons/md';

const ProfileTab = ({ user, setUser }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dob: '',
        gender: '',
        address: ''
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saveLoading, setSaveLoading] = useState(false);
    const [showQRCode, setShowQRCode] = useState(false);
    const API_URL = 'http://localhost:5000';

    // Initialize formData when user data is available
    useEffect(() => {
        if (user && user.name) {
            const nameParts = user.name.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            setFormData({
                firstName: firstName,
                lastName: lastName,
                email: user.email || '',
                phone: user.mobileNumber || '',
                dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
                gender: user.gender || '',
                address: user.address || '',
            });
        }
    }, [user]);

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (user && user._id) {
                setLoading(true);
                try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        throw new Error('No authentication token found');
                    }

                    console.log(`Fetching user details from: ${API_URL}/api/users/${user._id}`);
                    const response = await fetch(`${API_URL}/api/users/${user._id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Failed to fetch user details');
                    }

                    const userData = await response.json();
                    console.log('User data fetched:', userData);

                    // Update user in parent component if needed
                    setUser(prevUser => ({
                        ...prevUser,
                        ...userData
                    }));

                    // Parse name into firstName and lastName
                    const nameParts = (userData.name || '').split(' ');
                    const firstName = nameParts[0] || '';
                    const lastName = nameParts.slice(1).join(' ') || '';

                    // Update form data with fetched user data
                    setFormData({
                        firstName: firstName,
                        lastName: lastName,
                        email: userData.email || '',
                        phone: userData.mobileNumber || '',
                        dob: userData.dob ? new Date(userData.dob).toISOString().split('T')[0] : '',
                        gender: userData.gender || '',
                        address: userData.address || '',
                    });

                    setError(null);
                } catch (err) {
                    console.error('Error fetching user details:', err);
                    setError(err.message || 'Failed to load user profile');
                } finally {
                    setLoading(false);
                }
            } else {
                console.log('No user data available to fetch details');
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, [user?._id, setUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Apply specific validation rules
        if (name === 'firstName' || name === 'lastName') {
            // Only allow English alphabetic characters (a-z, A-Z)
            const alphabeticRegex = /^[a-zA-Z]*$/;
            if (!alphabeticRegex.test(value)) {
                return; // Don't update if invalid characters are entered
            }
        } else if (name === 'phone') {
            // Only allow numeric digits (0-9) and exactly 10 digits
            const numericRegex = /^\d*$/;
            if (!numericRegex.test(value)) {
                return; // Don't update if non-numeric characters are entered
            }
            if (value.length > 10) {
                return; // Don't update if more than 10 digits
            }
        }
        
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setSaveLoading(true);

        if (!user || !user._id) {
            setError('Error: User data is missing.');
            setSaveLoading(false);
            return;
        }

        // Validate required fields
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            setError('First name and last name are required.');
            setSaveLoading(false);
            return;
        }

        if (!formData.email.trim()) {
            setError('Email address is required.');
            setSaveLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            console.log('Form data to update:', formData);

            // Combine firstName and lastName into name field for the backend
            const updateData = {
                name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
                email: formData.email.trim(),
                mobileNumber: formData.phone.trim(),
                dob: formData.dob,
                gender: formData.gender,
                address: formData.address.trim()
            };

            console.log(`Updating user profile at: ${API_URL}/api/users/${user._id}`);
            console.log('Sending data:', updateData);
            console.log('Token being sent:', token ? 'Present' : 'Missing');

            const response = await fetch(`${API_URL}/api/users/${user._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                let errorMessage = 'Error updating profile';
                try {
                    const errorData = await response.json();
                    console.error('Error response:', errorData);
                    errorMessage = errorData.message || errorData.details || 'Error updating profile';
                } catch (parseError) {
                    console.error('Failed to parse error response:', parseError);
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            const updatedUser = await response.json();

            setUser(prevUser => ({
                ...prevUser,
                ...updatedUser
            }));
            
            setIsEditing(false);
            setMessage('Profile updated successfully!');
            
            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (storedUser && storedUser._id === user._id) {
                localStorage.setItem('user', JSON.stringify({ 
                    ...storedUser, 
                    ...updatedUser 
                }));
            }

            // Clear any previous errors
            setError(null);

            setTimeout(() => setMessage(''), 4000);
        } catch (error) {
            console.error('Error updating profile:', error);
            setError(error.message || 'An unexpected error occurred.');
        } finally {
            setSaveLoading(false);
        }
    };

    // Generate QR code data with user information
    const generateQRData = () => {
        if (!user) return '';
        
        return JSON.stringify({
            userId: user._id || user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            mobileNumber: user.mobileNumber,
            dob: user.dob,
            address: user.address,
            gender: user.gender,
            generatedAt: new Date().toISOString()
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-12">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-xl shadow-lg">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>
                    <div className="ml-4 flex-1">
                        <h3 className="text-lg font-semibold text-red-800">Error Loading Profile</h3>
                        <p className="text-red-700 mt-1">{error}</p>
                        <button 
                            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                            onClick={() => window.location.reload()}
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-xl shadow-lg">
                <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                        <User className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                        <h3 className="text-lg font-semibold text-yellow-800">User Not Found</h3>
                        <p className="text-yellow-700">Please log in to view your profile information.</p>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            {/* Success Message */}
            {message && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-xl shadow-lg animate-fade-in">
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="ml-3 text-green-800 font-medium">{message}</p>
                    </div>
                </div>
            )}

            {/* Profile Header Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="relative p-8">
                    {/* Background Pattern */}
                    {/* <div className="absolute inset-0 bg-blue-50"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full transform translate-x-16 -translate-y-16 opacity-30"></div> */}
                    
                    <div className="relative flex items-start justify-between">
                        <div className="flex items-center space-x-6">
                            {/* Profile Avatar
                            <div className="relative group">
                                <div className="w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl transform transition-transform duration-300 group-hover:scale-105">
                                    <span className="text-3xl font-bold text-white">
                                        {user.name ? user.name.split(' ').map(n => n.charAt(0)).slice(0, 2).join('') : 'U'}
                                    </span>
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <Camera className="w-4 h-4 text-gray-600" />
                                </div>
                            </div> */}
                            
                            {/* User Info */}
                            {/* <div className="space-y-1">
                                <h1 className="text-3xl font-bold text-blue-600">
                                    {user.name || 'User Name'}
                                </h1>
                                <div className="flex items-center space-x-3">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">
                                        {user.role}
                                    </span>
                                    <div className="flex items-center text-gray-500 text-sm">
                                        <Clock className="w-4 h-4 mr-1" />
                                        Member since {new Date(user.createdAt || Date.now()).getFullYear()}
                                    </div>
                                </div>
                                <p className="text-gray-600 max-w-md">
                                    Managing your healthcare journey with personalized care and comprehensive medical records.
                                </p>
                            </div> */}
                        </div>
                        
                        {/* Edit Button */}
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="flex items-center space-x-2 px-6 py-3 bg-white border border-blue-200 text-blue-600 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 shadow-lg hover:shadow-xl group"
                        >
                            {isEditing ? (
                                <>
                                    <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                                    <span className="font-medium">Cancel</span>
                                </>
                            ) : (
                                <>
                                    <Edit3 className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                                    <span className="font-medium">Edit Profile</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            {isEditing ? (
                /* Edit Form */
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                            <Edit3 className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Edit Profile Information</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Personal Information Section */}
                        <div className="bg-blue-50 rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                                <User className="w-5 h-5 mr-2 text-blue-600" />
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">First Name *</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/70 backdrop-blur-sm"
                                        placeholder="Only English letters (a-z, A-Z)"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Last Name *</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/70 backdrop-blur-sm"
                                        placeholder="Only English letters (a-z, A-Z)"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact Information Section */}
                        <div className="bg-blue-50 rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                                <Mail className="w-5 h-5 mr-2 text-blue-600" />
                                Contact Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Email Address *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/70 backdrop-blur-sm"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/70 backdrop-blur-sm"
                                        placeholder="10 digits only (0-9)"
                                        maxLength="10"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Enter exactly 10 digits</p>
                                </div>
                            </div>
                        </div>

                        {/* Personal Details Section */}
                        <div className="bg-blue-50 rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                                Personal Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Date of Birth</label>
                                    <input
                                        type="date"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/70 backdrop-blur-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Gender</label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/70 backdrop-blur-sm"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Address Section */}
                        <div className="bg-blue-50 rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                                Address Information
                            </h3>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Full Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/70 backdrop-blur-sm resize-none"
                                    placeholder="Enter your complete address..."
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-4 pt-6">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saveLoading}
                                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none flex items-center space-x-2"
                            >
                                {saveLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                /* View Mode - Profile Preview Only */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Information Cards */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information Card */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="bg-blue-600 p-6">
                                <h3 className="text-xl font-semibold text-white flex items-center">
                                    <User className="w-6 h-6 mr-3" />
                                    Personal Information
                                </h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InfoField
                                        icon={<User className="w-5 h-5 text-blue-500" />}
                                        label="Full Name"
                                        value={user.name || 'Not provided'}
                                    />
                                    <InfoField
                                        icon={<Shield className="w-5 h-5 text-blue-500" />}
                                        label="Role"
                                        value={user.role}
                                        badge={true}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact Information Card */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="bg-blue-600 p-6">
                                <h3 className="text-xl font-semibold text-white flex items-center">
                                    <Mail className="w-6 h-6 mr-3" />
                                    Contact Information
                                </h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InfoField
                                        icon={<Mail className="w-5 h-5 text-blue-500" />}
                                        label="Email Address"
                                        value={user.email}
                                        copyable={true}
                                    />
                                    <InfoField
                                        icon={<Phone className="w-5 h-5 text-blue-500" />}
                                        label="Phone Number"
                                        value={user.mobileNumber}
                                        copyable={true}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Additional Details Card */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="bg-blue-600 p-6">
                                <h3 className="text-xl font-semibold text-white flex items-center">
                                    <Calendar className="w-6 h-6 mr-3" />
                                    Additional Details
                                </h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InfoField
                                        icon={<Calendar className="w-5 h-5 text-blue-500" />}
                                        label="Date of Birth"
                                        value={user.dob ? new Date(user.dob).toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        }) : null}
                                    />
                                    <InfoField
                                        icon={<User className="w-5 h-5 text-blue-500" />}
                                        label="Gender"
                                        value={user.gender}
                                    />
                                </div>
                                <InfoField
                                    icon={<MapPin className="w-5 h-5 text-blue-500" />}
                                    label="Address"
                                    value={user.address}
                                    fullWidth={true}
                                />
                            </div>
                        </div>

                        {/* Digital Profile Card */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="bg-blue-600 p-6">
                                <h3 className="text-xl font-semibold text-white flex items-center">
                                    <MdQrCode className="w-6 h-6 mr-3" />
                                    Digital Profile Card
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-6">
                                    <div className="flex flex-col items-center space-y-4">
                                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200">
                                            <div className="flex justify-center mb-4">
                                                <div 
                                                    className="cursor-pointer transition-transform duration-300 hover:scale-105"
                                                    onClick={() => setShowQRCode(!showQRCode)}
                                                >
                                                    {showQRCode ? (
                                                        <QRCodeSVG 
                                                            value={generateQRData()} 
                                                            size={160}
                                                            level="H"
                                                            includeMargin
                                                            fgColor="#1e40af"
                                                            bgColor="#ffffff"
                                                        />
                                                    ) : (
                                                        <div className="w-40 h-40 bg-blue-100 flex items-center justify-center rounded border border-blue-200">
                                                            <MdQrCode className="text-6xl text-blue-600" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-blue-600 text-center font-medium">
                                                {showQRCode 
                                                    ? 'Scan this QR code for instant profile access' 
                                                    : 'Click to generate your profile QR code'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setShowQRCode(!showQRCode)}
                                            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                        >
                                            <MdQrCode className="mr-2" />
                                            {showQRCode ? 'Hide QR Code' : 'Generate QR Code'}
                                        </button>
                                    </div>
                                    
                                    <div className="flex-1 text-center lg:text-left">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Digital Profile Features</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-center lg:justify-start text-gray-600">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                                <span>Instant profile information sharing</span>
                                            </div>
                                            <div className="flex items-center justify-center lg:justify-start text-gray-600">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                                <span>Secure contact details access</span>
                                            </div>
                                            <div className="flex items-center justify-center lg:justify-start text-gray-600">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                                <span>Professional networking tool</span>
                                            </div>
                                            <div className="flex items-center justify-center lg:justify-start text-gray-600">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                                <span>No app installation required</span>
                                            </div>
                                        </div>
                                        
                                        {showQRCode && (
                                            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                                                <h5 className="text-sm font-semibold text-blue-800 mb-2">QR Code Contains:</h5>
                                                <div className="text-sm text-blue-700 space-y-1">
                                                    <div>• User ID: {user._id || user.id}</div>
                                                    <div>• Name: {user.name}</div>
                                                    <div>• Email: {user.email}</div>
                                                    <div>• Role: {user.role}</div>
                                                    <div>• Phone: {user.mobileNumber || 'Not provided'}</div>
                                                    <div>• Generated: {new Date().toLocaleString()}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Stats Card */}
                        <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                                <Award className="w-5 h-5 mr-2" />
                                Profile Status
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-blue-100">Profile Complete</span>
                                    <span className="font-bold">85%</span>
                                </div>
                                <div className="w-full bg-blue-400 rounded-full h-2">
                                    <div className="bg-white h-2 rounded-full" style={{ width: '85%' }}></div>
                                </div>
                                <div className="text-sm text-blue-100">
                                    Add more information to complete your profile
                                </div>
                            </div>
                        </div>

                        {/* Security Card */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <Shield className="w-5 h-5 mr-2 text-blue-500" />
                                Security
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Password</span>
                                    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                                        Change
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Two-Factor Auth</span>
                                    <span className="text-green-600 text-sm">Enabled</span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Card */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <Clock className="w-5 h-5 mr-2 text-blue-500" />
                                Recent Activity
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600">Profile updated</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600">Login successful</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600">Password changed</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Enhanced InfoField Component
const InfoField = ({ icon, label, value, badge = false, copyable = false, fullWidth = false }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (value && copyable) {
            navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className={`${fullWidth ? 'col-span-full' : ''} group`}>
            <div className="flex items-center space-x-2 mb-2">
                {icon}
                <label className="text-sm font-semibold text-gray-700">{label}</label>
            </div>
            <div className="relative">
                {badge && value ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
                        {value}
                    </span>
                ) : (
                    <div className={`bg-gray-50 border border-gray-200 rounded-xl p-3 ${copyable && value ? 'cursor-pointer hover:bg-gray-100' : ''} transition-colors duration-200`}
                         onClick={copyable ? handleCopy : undefined}>
                        <p className="text-gray-800 font-medium">
                            {value || (
                                <span className="text-gray-400 italic">Not provided</span>
                            )}
                        </p>
                        {copyable && value && (
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                {copied ? (
                                    <div className="text-green-600 text-xs font-medium">Copied!</div>
                                ) : (
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileTab;

