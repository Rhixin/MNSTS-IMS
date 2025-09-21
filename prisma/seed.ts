import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create admin user
  const hashedPassword = await hashPassword('admin123')
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@mnsts.edu.ph' },
    update: {},
    create: {
      email: 'admin@mnsts.edu.ph',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      isVerified: true
    }
  })

  console.log('👤 Created admin user')

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Laboratory Equipment' },
      update: {},
      create: {
        name: 'Laboratory Equipment',
        description: 'Scientific instruments and lab equipment',
        color: '#2D5F3F'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Office Supplies' },
      update: {},
      create: {
        name: 'Office Supplies',
        description: 'Office materials and stationery',
        color: '#F4C430'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Technology' },
      update: {},
      create: {
        name: 'Technology',
        description: 'Computers, tablets, and tech equipment',
        color: '#1B4B47'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Furniture' },
      update: {},
      create: {
        name: 'Furniture',
        description: 'Desks, chairs, and classroom furniture',
        color: '#87A96B'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Cleaning Materials' },
      update: {},
      create: {
        name: 'Cleaning Materials',
        description: 'Cleaning supplies and maintenance items',
        color: '#6B6B6B'
      }
    })
  ])

  console.log('🏷️ Created categories')

  // Create sample inventory items
  const inventoryItems = [
    {
      name: 'Digital Microscope',
      description: 'High-resolution digital microscope for biology classes',
      sku: 'LAB-MICRO-001',
      barcode: '1234567890123',
      quantity: 5,
      minStock: 2,
      maxStock: 10,
      unitPrice: 15000.00,
      location: 'Science Laboratory A',
      categoryId: categories[0].id, // Laboratory Equipment
      createdBy: adminUser.id
    },
    {
      name: 'Student Laptop',
      description: 'Educational laptop for programming classes',
      sku: 'TECH-LAP-001',
      barcode: '2345678901234',
      quantity: 25,
      minStock: 5,
      maxStock: 50,
      unitPrice: 35000.00,
      location: 'Computer Laboratory',
      categoryId: categories[2].id, // Technology
      createdBy: adminUser.id
    },
    {
      name: 'Classroom Chair',
      description: 'Ergonomic classroom chair',
      sku: 'FURN-CHAIR-001',
      barcode: '3456789012345',
      quantity: 150,
      minStock: 20,
      maxStock: 200,
      unitPrice: 2500.00,
      location: 'Storage Room B',
      categoryId: categories[3].id, // Furniture
      createdBy: adminUser.id
    },
    {
      name: 'Whiteboard Marker',
      description: 'Dry erase markers - assorted colors',
      sku: 'OFF-MARK-001',
      barcode: '4567890123456',
      quantity: 50,
      minStock: 20,
      maxStock: 100,
      unitPrice: 25.00,
      location: 'Supply Closet A',
      categoryId: categories[1].id, // Office Supplies
      createdBy: adminUser.id
    },
    {
      name: 'Floor Cleaner',
      description: 'Industrial floor cleaning solution',
      sku: 'CLEAN-FLOOR-001',
      barcode: '5678901234567',
      quantity: 3,
      minStock: 5,
      maxStock: 20,
      unitPrice: 450.00,
      location: 'Janitor Closet',
      categoryId: categories[4].id, // Cleaning Materials
      createdBy: adminUser.id
    },
    {
      name: 'Projector',
      description: 'HD classroom projector',
      sku: 'TECH-PROJ-001',
      barcode: '6789012345678',
      quantity: 8,
      minStock: 3,
      maxStock: 15,
      unitPrice: 25000.00,
      location: 'AV Equipment Room',
      categoryId: categories[2].id, // Technology
      createdBy: adminUser.id
    },
    {
      name: 'Chemistry Set',
      description: 'Complete chemistry experiment set',
      sku: 'LAB-CHEM-001',
      barcode: '7890123456789',
      quantity: 1,
      minStock: 3,
      maxStock: 10,
      unitPrice: 8500.00,
      location: 'Chemistry Lab',
      categoryId: categories[0].id, // Laboratory Equipment
      createdBy: adminUser.id
    }
  ]

  const createdItems = await Promise.all(
    inventoryItems.map(item =>
      prisma.inventoryItem.upsert({
        where: { sku: item.sku },
        update: {},
        create: item
      })
    )
  )

  console.log('📦 Created inventory items')

  // Create some sample stock movements
  const movements = [
    {
      itemId: createdItems[0].id,
      userId: adminUser.id,
      type: 'IN' as const,
      quantity: 3,
      reason: 'Initial stock',
      notes: 'Adding initial inventory'
    },
    {
      itemId: createdItems[1].id,
      userId: adminUser.id,
      type: 'IN' as const,
      quantity: 15,
      reason: 'Purchase',
      notes: 'New batch for programming course'
    },
    {
      itemId: createdItems[3].id,
      userId: adminUser.id,
      type: 'OUT' as const,
      quantity: 10,
      reason: 'Used/Consumed',
      notes: 'Distributed to classrooms'
    },
    {
      itemId: createdItems[4].id,
      userId: adminUser.id,
      type: 'OUT' as const,
      quantity: 2,
      reason: 'Used/Consumed',
      notes: 'Weekly cleaning routine'
    }
  ]

  await Promise.all(
    movements.map(movement =>
      prisma.stockMovement.create({ data: movement })
    )
  )

  console.log('📋 Created stock movements')

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })