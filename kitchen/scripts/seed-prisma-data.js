// Seed Database with Sample Data using Prisma
// This script populates the kitchen database with realistic sample data

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function seedDatabase() {
  console.log('🌱 Starting database seeding with Prisma...');

  try {
    // Clear existing data (in reverse order of dependencies)
    console.log('🧹 Cleaning existing data...');
    await prisma.leftover.deleteMany();
    await prisma.stockUpdate.deleteMany();
    await prisma.cookingLog.deleteMany();
    await prisma.indentItem.deleteMany();
    await prisma.indent.deleteMany();
    await prisma.stock.deleteMany();
    await prisma.event.deleteMany();
    await prisma.user.deleteMany();

    // 1. Create Users
    console.log('👥 Creating users...');
    const users = await prisma.user.createMany({
      data: [
        {
          email: 'chef.ravi@buttakitchen.com',
          name: 'Chef Ravi Kumar',
          role: 'CHEF',
          phone: '+91 9876543210',
          isActive: true,
        },
        {
          email: 'manager.priya@buttakitchen.com',
          name: 'Priya Sharma',
          role: 'KITCHEN_MANAGER',
          phone: '+91 9876543211',
          isActive: true,
        },
        {
          email: 'admin@buttakitchen.com',
          name: 'Admin User',
          role: 'ADMIN',
          phone: '+91 9876543212',
          isActive: true,
        },
      ],
    });

    // Get created users for references
    const createdUsers = await prisma.user.findMany();
    const chef = createdUsers.find(u => u.role === 'CHEF');
    const manager = createdUsers.find(u => u.role === 'KITCHEN_MANAGER');
    const admin = createdUsers.find(u => u.role === 'ADMIN');

    console.log(`✅ Created ${users.count} users`);

    // 2. Create Events
    console.log('📅 Creating events...');
    const events = await prisma.event.createMany({
      data: [
        {
          name: 'Wedding Reception - Sharma Family',
          date: new Date('2025-02-15T18:00:00Z'),
          guestCount: 250,
          eventType: 'Wedding',
          status: 'PLANNED',
          assignedChef: chef?.id,
          menuItems: {
            starters: ['Paneer Tikka', 'Chicken Tikka', 'Veg Spring Rolls'],
            mains: ['Butter Chicken', 'Dal Makhani', 'Jeera Rice', 'Naan'],
            desserts: ['Gulab Jamun', 'Ice Cream'],
            beverages: ['Lassi', 'Soft Drinks', 'Tea/Coffee']
          },
        },
        {
          name: 'Corporate Annual Meet - TechCorp',
          date: new Date('2025-02-20T12:00:00Z'),
          guestCount: 150,
          eventType: 'Corporate',
          status: 'INDENT_CREATED',
          assignedChef: chef?.id,
          menuItems: {
            lunch: ['Veg Biryani', 'Chicken Curry', 'Raita', 'Papad'],
            snacks: ['Samosa', 'Tea/Coffee'],
            beverages: ['Fresh Juice', 'Water']
          },
        },
        {
          name: 'Birthday Party - Kids Special',
          date: new Date('2025-02-25T16:00:00Z'),
          guestCount: 50,
          eventType: 'Birthday',
          status: 'COOKING_STARTED',
          assignedChef: chef?.id,
          menuItems: {
            mains: ['Pizza', 'Pasta', 'Garlic Bread'],
            desserts: ['Birthday Cake', 'Ice Cream'],
            beverages: ['Fruit Punch', 'Soft Drinks']
          },
        },
      ],
    });

    // Get created events for references
    const createdEvents = await prisma.event.findMany();
    console.log(`✅ Created ${events.count} events`);

    // 3. Create Stock Items
    console.log('📦 Creating stock items...');
    const stockItems = await prisma.stock.createMany({
      data: [
        {
          itemName: 'Basmati Rice',
          category: 'Grains',
          quantity: 50,
          unit: 'kg',
          expiryDate: new Date('2025-12-31'),
          batchNumber: 'BR2025001',
          supplier: 'Premium Grains Ltd',
          costPerUnit: 120,
          minStock: 10,
          isActive: true,
        },
        {
          itemName: 'Chicken (Fresh)',
          category: 'Meat',
          quantity: 25,
          unit: 'kg',
          expiryDate: new Date('2025-02-18'),
          batchNumber: 'CH2025001',
          supplier: 'Fresh Meat Co',
          costPerUnit: 280,
          minStock: 5,
          isActive: true,
        },
        {
          itemName: 'Paneer',
          category: 'Dairy',
          quantity: 15,
          unit: 'kg',
          expiryDate: new Date('2025-02-20'),
          batchNumber: 'PN2025001',
          supplier: 'Dairy Fresh',
          costPerUnit: 350,
          minStock: 3,
          isActive: true,
        },
        {
          itemName: 'Onions',
          category: 'Vegetables',
          quantity: 30,
          unit: 'kg',
          expiryDate: new Date('2025-03-15'),
          batchNumber: 'ON2025001',
          supplier: 'Veggie Market',
          costPerUnit: 40,
          minStock: 10,
          isActive: true,
        },
        {
          itemName: 'Tomatoes',
          category: 'Vegetables',
          quantity: 20,
          unit: 'kg',
          expiryDate: new Date('2025-02-25'),
          batchNumber: 'TM2025001',
          supplier: 'Veggie Market',
          costPerUnit: 60,
          minStock: 8,
          isActive: true,
        },
        {
          itemName: 'Cooking Oil',
          category: 'Oil & Spices',
          quantity: 10,
          unit: 'liters',
          expiryDate: new Date('2025-08-31'),
          batchNumber: 'OL2025001',
          supplier: 'Oil Mills',
          costPerUnit: 150,
          minStock: 2,
          isActive: true,
        },
      ],
    });

    const createdStock = await prisma.stock.findMany();
    console.log(`✅ Created ${stockItems.count} stock items`);

    // 4. Create Indents for Events
    console.log('📋 Creating indents...');
    const weddingEvent = createdEvents.find(e => e.name.includes('Wedding'));
    const corporateEvent = createdEvents.find(e => e.name.includes('Corporate'));

    if (weddingEvent && manager) {
      const weddingIndent = await prisma.indent.create({
        data: {
          eventId: weddingEvent.id,
          status: 'APPROVED',
          totalItems: 4,
          createdBy: manager.id,
        },
      });

      // Create indent items
      await prisma.indentItem.createMany({
        data: [
          {
            indentId: weddingIndent.id,
            itemName: 'Basmati Rice',
            category: 'Grains',
            quantity: 15,
            unit: 'kg',
            isInStock: true,
            stockId: createdStock.find(s => s.itemName === 'Basmati Rice')?.id,
            isReceived: true,
            receivedAt: new Date(),
          },
          {
            indentId: weddingIndent.id,
            itemName: 'Chicken (Fresh)',
            category: 'Meat',
            quantity: 12,
            unit: 'kg',
            isInStock: true,
            stockId: createdStock.find(s => s.itemName === 'Chicken (Fresh)')?.id,
            isReceived: true,
            receivedAt: new Date(),
          },
          {
            indentId: weddingIndent.id,
            itemName: 'Paneer',
            category: 'Dairy',
            quantity: 8,
            unit: 'kg',
            isInStock: true,
            stockId: createdStock.find(s => s.itemName === 'Paneer')?.id,
            isReceived: false,
          },
          {
            indentId: weddingIndent.id,
            itemName: 'Onions',
            category: 'Vegetables',
            quantity: 10,
            unit: 'kg',
            isInStock: true,
            stockId: createdStock.find(s => s.itemName === 'Onions')?.id,
            isReceived: true,
            receivedAt: new Date(),
          },
        ],
      });
    }

    // 5. Create Cooking Logs
    console.log('👨‍🍳 Creating cooking logs...');
    if (weddingEvent && chef) {
      await prisma.cookingLog.createMany({
        data: [
          {
            eventId: weddingEvent.id,
            dishName: 'Butter Chicken',
            category: 'Main Course',
            servings: 250,
            status: 'IN_PROGRESS',
            assignedTo: chef.id,
            startedAt: new Date(),
            estimatedTime: 120,
            priority: 'HIGH',
            notes: 'Using fresh chicken, extra creamy',
          },
          {
            eventId: weddingEvent.id,
            dishName: 'Dal Makhani',
            category: 'Main Course',
            servings: 250,
            status: 'NOT_STARTED',
            assignedTo: chef.id,
            estimatedTime: 180,
            priority: 'NORMAL',
            notes: 'Slow cook for 3 hours',
          },
          {
            eventId: weddingEvent.id,
            dishName: 'Paneer Tikka',
            category: 'Starter',
            servings: 250,
            status: 'COMPLETED',
            assignedTo: chef.id,
            startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            completedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
            estimatedTime: 90,
            priority: 'NORMAL',
            notes: 'Marinated overnight, perfectly grilled',
          },
        ],
      });
    }

    // 6. Create Stock Updates
    console.log('📊 Creating stock updates...');
    const riceStock = createdStock.find(s => s.itemName === 'Basmati Rice');
    const chickenStock = createdStock.find(s => s.itemName === 'Chicken (Fresh)');

    if (riceStock && chickenStock && chef) {
      await prisma.stockUpdate.createMany({
        data: [
          {
            stockId: riceStock.id,
            type: 'USED',
            quantity: 15,
            reason: 'Used for Wedding Reception - Sharma Family',
            updatedBy: chef.id,
          },
          {
            stockId: chickenStock.id,
            type: 'USED',
            quantity: 12,
            reason: 'Used for Wedding Reception - Sharma Family',
            updatedBy: chef.id,
          },
        ],
      });

      // Update stock quantities
      await prisma.stock.update({
        where: { id: riceStock.id },
        data: { quantity: { decrement: 15 } },
      });

      await prisma.stock.update({
        where: { id: chickenStock.id },
        data: { quantity: { decrement: 12 } },
      });
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Users: ${users.count}`);
    console.log(`   - Events: ${events.count}`);
    console.log(`   - Stock Items: ${stockItems.count}`);
    console.log(`   - Indents: 1 (with 4 items)`);
    console.log(`   - Cooking Logs: 3`);
    console.log(`   - Stock Updates: 2`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedDatabase()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });