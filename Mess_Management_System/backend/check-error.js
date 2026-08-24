// Quick script to test the exact query that's failing
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testQuery() {
  try {
    console.log('🔍 Testing the exact query that attendance service uses...\n');

    const date = '2026-05-10';
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    console.log('Step 1: Fetching ACTIVE students...');
    const students = await prisma.student.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true, room: true, balance: true },
      orderBy: { name: 'asc' }
    });
    console.log(`✅ Found ${students.length} students\n`);

    console.log('Step 2: Fetching attendance records for date:', date);
    const attendanceRecords = await prisma.attendance.findMany({
      where: { date: d },
    });
    console.log(`✅ Found ${attendanceRecords.length} attendance records\n`);

    console.log('Step 3: Combining data...');
    const attendanceMap = new Map(
      attendanceRecords.map(a => [a.studentId, a])
    );

    const result = students.map(student => ({
      ...student,
      attendance: attendanceMap.get(student.id) || {
        status: 'PRESENT',
        cost: 0,
        date: d
      }
    }));

    console.log('✅ Successfully combined data\n');
    console.log('Sample result (first student):');
    console.log(JSON.stringify(result[0], null, 2));
    console.log('\n✅ Query works! The issue might be in the NestJS service.');

  } catch (error) {
    console.error('❌ Error occurred:', error.message);
    console.error('\nFull error:');
    console.error(error);
    
    console.error('\n🔧 Possible fixes:');
    console.error('1. Run: npx prisma generate');
    console.error('2. Check if Attendance model exists in schema.prisma');
    console.error('3. Check if database has attendance table');
    console.error('4. Run: npx prisma migrate dev');
  } finally {
    await prisma.$disconnect();
  }
}

testQuery();
