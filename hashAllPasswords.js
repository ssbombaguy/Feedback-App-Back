const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
require('dotenv').config();

if (!process.env.MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI is not defined in .env file');
  process.exit(1);
}

console.log('Connecting to MongoDB...');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB\n');
    forceHashPasswords();
  })
  .catch(err => {
    console.error('❌ Connection error:', err.message);
    process.exit(1);
  });

const forceHashPasswords = async () => {
  try {
    const users = await User.find({});
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      mongoose.connection.close();
      process.exit(0);
    }

    console.log(`Found ${users.length} user(s) to process...\n`);
    
    let hashedCount = 0;
    let alreadyHashedCount = 0;
    
    for (const user of users) {
      // Check if password is already hashed
      if (!user.password.startsWith('$2')) {
        console.log(`📝 Processing: ${user.email}`);
        console.log(`   Old password: ${user.password}`);
        
        const plainPassword = user.password;
        
        // Manually hash the password (bypass pre-save hook)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);
        
        // Update directly in database
        await User.updateOne(
          { _id: user._id },
          { $set: { password: hashedPassword } }
        );
        
        console.log(`   ✅ Hashed: ${hashedPassword.substring(0, 30)}...`);
        console.log(`   Login with: ${plainPassword}\n`);
        
        hashedCount++;
      } else {
        console.log(`✓ Already hashed: ${user.email}`);
        alreadyHashedCount++;
      }
    }
    
    console.log('\n========================================');
    console.log('Summary:');
    console.log(`  Total users: ${users.length}`);
    console.log(`  Newly hashed: ${hashedCount}`);
    console.log(`  Already hashed: ${alreadyHashedCount}`);
    console.log('========================================\n');
    console.log('✅ All passwords hashed successfully!');
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};