// Simple diagnostic script to check database connection and data
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function diagnose() {
  try {
    console.log('🔍 Checking database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully\n');

    // Check students
    console.log('📊 Checking students table...');
    const students = await prisma.student.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true, room: true, balance: true, status: true }
    });
    console.log(`✅ Found ${students.length} active students:`);
    students.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.name} - Room: ${s.room || 'N/A'} - Balance: Rs.${s.balance}`);
    });
    console.log('');

    // Check attendance
    console.log('📊 Checking attendance table...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const attendance = await prisma.attendance.findMany({
      where: { date: today },
      include: { student: { select: { name: true } } }
    });
    console.log(`✅ Found ${attendance.length} attendance records for today:`);
    attendance.forEach((a, i) => {
      console.log(`   ${i + 1}. ${a.student.name} - Status: ${a.status}`);
    });
    console.log('');

    // Check if meals table exists (should not)
    try {
      await prisma.$queryRaw`SELECT COUNT(*) FROM meals LIMIT 1`;
      console.log('❌ WARNING: meals table still exists! Need to run migration.');
    } catch (err) {
      console.log('✅ meals table does not exist (correct)\n');
    }

    console.log('✅ All checks passed!');
    console.log('\nIf students are showing here but not in frontend:');
    console.log('1. Make sure backend is running: npm run start:dev');
    console.log('2. Check backend terminal for errors');
    console.log('3. Check browser console (F12) for errors');
    console.log('4. Try this URL: http://localhost:3001/api/v1/attendance/all-students?date=' + today.toISOString().split('T')[0]);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nPossible solutions:');
    console.error('1. Make sure PostgreSQL is running');
    console.error('2. Check DATABASE_URL in .env file');
    console.error('3. Run: npm run prisma:generate');
    console.error('4. Run: npx prisma migrate dev');
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
