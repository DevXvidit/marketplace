const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('./models/User');

dotenv.config();

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
};

const resetAdmin = async () => {
  const email = process.env.ADMIN_EMAIL || 'admin@jewelry.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123456';

  await connectDB();

  let user = await User.findOne({ email }).select('+password');
  if (!user) {
    user = new User({
      name: 'Admin',
      email,
      password,
      role: 'admin',
      phone: '9999999999',
      isActive: true,
    });
    await user.save();
    console.log('Admin created:', email);
  } else {
    user.password = password;
    user.role = 'admin';
    user.isActive = true;
    await user.save();
    console.log('Admin password reset for:', email);
  }

  await mongoose.disconnect();
};

resetAdmin().catch((e) => {
  console.error('RESET ADMIN ERROR:', e.message);
  process.exit(1);
});
