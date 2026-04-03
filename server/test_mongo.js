const mongoose = require('mongoose');

const uri1 = 'mongodb+srv://krishpatel77058_db_user:xe5tkuT6XH7Uesyp@cluster0.rlxkrhr.mongodb.net/jewelry_db?appName=Cluster0';
const uri2 = 'mongodb+srv://krishpatel77058_db_user:wgZnF4w5M6928IlC@cluster0.34iyqmt.mongodb.net/jewelry_db?appName=Cluster0';

async function testConnection(uri, label) {
  try {
    console.log(`Testing ${label}...`);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`✅ Success: ${label}`);
    await mongoose.disconnect();
    return true;
  } catch (err) {
    console.error(`❌ Failed: ${label} - ${err.message}`);
    return false;
  }
}

async function run() {
  const success1 = await testConnection(uri1, 'URI 1 (Current Active)');
  if (!success1) {
    await testConnection(uri2, 'URI 2 (Commented Out)');
  }
}

run();
