const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/skinzy').then(async () => {
    const db = mongoose.connection.db;
    const salt = await bcrypt.genSalt(10);
    const hashedPw = await bcrypt.hash('Doctor123', salt);

    const doctors = [
        {
            email: 'dr.sarah.malik@skinzy.com',
            name: 'Dr. Sarah Malik',
            password: hashedPw,
            userType: 'doctor',
            specialization: 'Dermatologist',
            phone: '03001112233',
            city: 'Karachi',
            location: 'Karachi, Pakistan',
            hospital: 'Aga Khan University Hospital',
            experience: '12 years',
            licenseNumber: 'PMC-12345',
            consultationFee: '2500',
            rating: 4.9,
            reviews: 128,
            totalPatientsServed: 1240,
            verificationStatus: 'verified',
            availability: [
                { day: 'Monday', isActive: true },
                { day: 'Tuesday', isActive: true },
                { day: 'Wednesday', isActive: true },
                { day: 'Thursday', isActive: true },
                { day: 'Friday', isActive: true },
                { day: 'Saturday', isActive: false },
                { day: 'Sunday', isActive: false }
            ],
            timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM']
        },
        {
            email: 'dr.ahmed.khan@skinzy.com',
            name: 'Dr. Ahmed Khan',
            password: hashedPw,
            userType: 'doctor',
            specialization: 'Cosmetic Dermatologist',
            phone: '03112223344',
            city: 'Lahore',
            location: 'Lahore, Pakistan',
            hospital: 'Shaukat Khanum Hospital',
            experience: '8 years',
            licenseNumber: 'PMC-67890',
            consultationFee: '3000',
            rating: 4.7,
            reviews: 95,
            totalPatientsServed: 870,
            verificationStatus: 'verified',
            availability: [
                { day: 'Monday', isActive: true },
                { day: 'Tuesday', isActive: false },
                { day: 'Wednesday', isActive: true },
                { day: 'Thursday', isActive: true },
                { day: 'Friday', isActive: true },
                { day: 'Saturday', isActive: true },
                { day: 'Sunday', isActive: false }
            ],
            timeSlots: ['10:00 AM', '11:00 AM', '12:00 PM', '03:00 PM', '04:00 PM', '05:00 PM']
        },
        {
            email: 'dr.fatima.ali@skinzy.com',
            name: 'Dr. Fatima Ali',
            password: hashedPw,
            userType: 'doctor',
            specialization: 'Skin & Allergy Specialist',
            phone: '03334445566',
            city: 'Islamabad',
            location: 'Islamabad, Pakistan',
            hospital: 'PIMS Hospital',
            experience: '15 years',
            licenseNumber: 'PMC-11223',
            consultationFee: '2000',
            rating: 4.8,
            reviews: 210,
            totalPatientsServed: 2100,
            verificationStatus: 'verified',
            availability: [
                { day: 'Monday', isActive: true },
                { day: 'Tuesday', isActive: true },
                { day: 'Wednesday', isActive: true },
                { day: 'Thursday', isActive: false },
                { day: 'Friday', isActive: true },
                { day: 'Saturday', isActive: true },
                { day: 'Sunday', isActive: false }
            ],
            timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM']
        }
    ];

    for (const doc of doctors) {
        const existing = await db.collection('users').findOne({ email: doc.email });
        if (!existing) {
            await db.collection('users').insertOne({ ...doc, createdAt: new Date(), updatedAt: new Date() });
            console.log('Inserted:', doc.name);
        } else {
            await db.collection('users').updateOne(
                { email: doc.email },
                { $set: { ...doc, updatedAt: new Date() } }
            );
            console.log('Updated:', doc.name);
        }
    }

    const total = await db.collection('users').countDocuments({ userType: 'doctor' });
    console.log('Total doctors now:', total);
    mongoose.disconnect();
}).catch(err => {
    console.error('DB Error:', err.message);
    process.exit(1);
});
