const mongoose = require('mongoose');
const User = require('../api/models/userModel');
require('dotenv').config();

const updateUsersWithDefaultAvatar = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Update all users without avatar
        const result = await User.updateMany(
            { $or: [{ avatar: null }, { avatar: '' }, { avatar: { $exists: false } }] },
            { $set: { avatar: '/images/default-avatar.svg' } }
        );

        console.log(`Updated ${result.modifiedCount} users with default avatar`);

        // Close connection
        await mongoose.connection.close();
        console.log('Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error updating users:', error);
        process.exit(1);
    }
};

updateUsersWithDefaultAvatar();
