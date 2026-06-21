const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const adminExists = await User.findOne({ email: 'hassanhashmi928@gmail.com' });
        if (adminExists) {
            console.log('⚠️ Admin user already exists.');
            process.exit(0);
        }

        const admin = new User({
            name: 'Skinzy Admin',
            email: 'hassanhashmi928@gmail.com',
            password: 'Hashmi2463', // Will be hashed automatically by pre-save hook
            userType: 'admin',
            role: 'admin',
            phone: '00000000000',
            city: 'System',
            joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        });

        await admin.save();
        console.log('✅ Default Admin account created successfully');
        console.log('Email: hassanhashmi928@gmail.com');
        console.log('Password: Hashmi2463');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
};

seedAdmin();
