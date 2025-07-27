// Test Prisma Connection and Basic Operations
// This script verifies that Prisma is working correctly with your database

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testPrismaConnection() {
  console.log('🔄 Testing Prisma connection...');
  
  try {
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Prisma connected successfully!');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`📊 Current user count: ${userCount}`);
    
    // Test creating a user (if none exist)
    if (userCount === 0) {
      console.log('🔄 Creating test user...');
      const testUser = await prisma.user.create({
        data: {
          email: 'test@kitchen.com',
          name: 'Test Chef',
          role: 'CHEF',
          phone: '+91 9876543210',
        },
      });
      console.log('✅ Test user created:', testUser.name);
    }
    
    // Test reading users
    const users = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });
    
    console.log('👥 Users in database:');
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.role}`);
    });
    
    // Test event count
    const eventCount = await prisma.event.count();
    console.log(`📅 Current event count: ${eventCount}`);
    
    // Test stock count
    const stockCount = await prisma.stock.count();
    console.log(`📦 Current stock items: ${stockCount}`);
    
    console.log('🎉 All Prisma tests passed!');
    
  } catch (error) {
    console.error('❌ Prisma test failed:', error.message);
    
    if (error.code === 'P1001') {
      console.error('💡 Database connection failed. Check your DATABASE_URL in .env.local');
    } else if (error.code === 'P2002') {
      console.error('💡 Unique constraint violation. This is expected if test data already exists.');
    } else {
      console.error('💡 Full error:', error);
    }
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Prisma disconnected');
  }
}

// Run the test
testPrismaConnection();