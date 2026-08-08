const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createAdmin() {
  console.log('🔐 Admin User Generator\n');

  // Get user input
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query) => new Promise(resolve => readline.question(query, resolve));

  try {
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password (min 8 characters): ');
    const role = await question('Enter role (admin/super_admin) [admin]: ') || 'admin';

    if (password.length < 8) {
      console.log('\n❌ Password must be at least 8 characters long');
      readline.close();
      process.exit(1);
    }

    console.log('\nHashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Creating admin user...');
    await connection.query(
      'INSERT INTO admins (email, password, role) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE password = ?, role = ?',
      [email, hashedPassword, role, hashedPassword, role]
    );

    await connection.end();

    console.log('\n✅ Admin user created successfully!');
    console.log(`   Email: ${email}`);
    console.log(`   Role: ${role}`);
    console.log('\n⚠️  Keep this password secure!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    readline.close();
  }
}

createAdmin();
