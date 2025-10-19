const mongoose = require('mongoose');
const Certification = require('./Model/CertificationModel');
const Staff = require('./Model/StaffModel');

// MongoDB connection
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb+srv://nadeera11:9KhpfPfStDvzr0Qk@cluster0.dyzuhhs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
  const localMongoUri = "mongodb://localhost:27017/helamedmy";
  
  try {
    console.log('🔗 Attempting to connect to MongoDB Atlas...');
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.log('❌ Atlas connection failed:', error.message);
    console.log('🔄 Trying local MongoDB connection...');
    try {
      await mongoose.connect(localMongoUri);
      console.log('✅ Connected to local MongoDB');
    } catch (localError) {
      console.error('❌ Both connections failed:', localError.message);
      process.exit(1);
    }
  }
};

const addSampleCertifications = async () => {
  try {
    await connectDB();

    // Get some staff members from the database  
    const staffMembers = await Staff.find({ role: 'doctor' }).limit(4).lean();
    
    console.log(`Found ${staffMembers.length} staff members`);
    
    if (staffMembers.length === 0) {
      console.log('❌ No staff members found in the database.');
      console.log('Please add staff members first before adding certifications.');
      process.exit(0);
    }

    // Create sample certifications with different statuses
    const today = new Date();
    
    const certifications = [
      {
        staffId: staffMembers[0]._id,
        staffName: `${staffMembers[0].firstName} ${staffMembers[0].lastName}`,
        certificationName: 'Board Certification in Cardiology',
        certificationType: 'medical-certificate',
        issuingAuthority: 'American Board of Internal Medicine',
        issueDate: new Date('2020-05-15'),
        expiryDate: new Date(today.getFullYear() + 2, today.getMonth(), today.getDate()), // Valid - expires in 2 years
        certificationNumber: 'ABIM-CARD-2020-12345',
        notes: 'Cardiology subspecialty certification',
        status: 'valid'
      },
      {
        staffId: staffMembers[1] ? staffMembers[1]._id : staffMembers[0]._id,
        staffName: staffMembers[1] ? `${staffMembers[1].firstName} ${staffMembers[1].lastName}` : `${staffMembers[0].firstName} ${staffMembers[0].lastName}`,
        certificationName: 'Advanced Cardiac Life Support (ACLS)',
        certificationType: 'professional-license',
        issuingAuthority: 'American Heart Association',
        issueDate: new Date('2024-03-10'),
        expiryDate: new Date(today.getFullYear(), today.getMonth() + 1, today.getDate() + 15), // Expiring soon - 45 days
        certificationNumber: 'AHA-ACLS-2024-67890',
        notes: 'Requires renewal within 60 days',
        status: 'expiring-soon'
      },
      {
        staffId: staffMembers[2] ? staffMembers[2]._id : staffMembers[0]._id,
        staffName: staffMembers[2] ? `${staffMembers[2].firstName} ${staffMembers[2].lastName}` : `${staffMembers[0].firstName} ${staffMembers[0].lastName}`,
        certificationName: 'Medical License',
        certificationType: 'professional-license',
        issuingAuthority: 'State Medical Board',
        issueDate: new Date('2018-01-20'),
        expiryDate: new Date('2024-09-30'), // Expired
        certificationNumber: 'MD-LIC-2018-11223',
        notes: 'Primary medical license - EXPIRED, needs immediate renewal',
        status: 'expired'
      },
      {
        staffId: staffMembers[3] ? staffMembers[3]._id : staffMembers[0]._id,
        staffName: staffMembers[3] ? `${staffMembers[3].firstName} ${staffMembers[3].lastName}` : `${staffMembers[0].firstName} ${staffMembers[0].lastName}`,
        certificationName: 'Specialty Certification in Neurology',
        certificationType: 'specialty-certification',
        issuingAuthority: 'American Board of Psychiatry and Neurology',
        issueDate: new Date('2019-11-05'),
        expiryDate: new Date(today.getFullYear() + 3, today.getMonth(), today.getDate()), // Valid - expires in 3 years
        certificationNumber: 'ABPN-NEUR-2019-44556',
        notes: 'Neurology specialty board certification',
        status: 'valid'
      }
    ];

    // Insert sample certifications
    const insertedCertifications = await Certification.insertMany(certifications);
    
    console.log('\n✅ Successfully added sample certifications!');
    console.log(`\nAdded ${insertedCertifications.length} certifications:`);
    insertedCertifications.forEach((cert, index) => {
      console.log(`\n${index + 1}. ${cert.certificationName}`);
      console.log(`   Staff: ${cert.staffName}`);
      console.log(`   Type: ${cert.certificationType}`);
      console.log(`   Status: ${cert.status}`);
      console.log(`   Expiry Date: ${cert.expiryDate.toLocaleDateString()}`);
      console.log(`   Certification Number: ${cert.certificationNumber}`);
    });

    console.log('\n📊 Summary:');
    console.log(`   Valid: ${insertedCertifications.filter(c => c.status === 'valid').length}`);
    console.log(`   Expiring Soon: ${insertedCertifications.filter(c => c.status === 'expiring-soon').length}`);
    console.log(`   Expired: ${insertedCertifications.filter(c => c.status === 'expired').length}`);
    
  } catch (error) {
    console.error('❌ Error adding sample certifications:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
addSampleCertifications();
