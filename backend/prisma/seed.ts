import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const BCRYPT_SALT_ROUNDS = 12;

const ownerUser = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'owner@example.com',
  password: 'Password123!',
  firstName: 'Business',
  lastName: 'Owner',
  phone: '+1-555-0100',
};

const business = {
  id: '22222222-2222-4222-8222-222222222222',
  name: 'Smart Booking Demo Business',
  description:
    'A generic service-based business profile for local development and frontend testing.',
  phone: '+1-555-0123',
  email: 'hello@example-business.com',
  address: '123 Main Street, Suite 200',
  website: 'https://example-business.com',
  socialLinks: {
    instagram: 'https://instagram.com/example-business',
    facebook: 'https://facebook.com/example-business',
  },
  timezone: 'Asia/Jerusalem',
};

const services = [
  {
    id: '33333333-3333-4333-8333-333333333331',
    name: 'Initial Consultation',
    description:
      'A focused first appointment to understand needs, goals, and the best next steps.',
    durationMinutes: 30,
    price: '120.00',
    sortOrder: 10,
  },
  {
    id: '33333333-3333-4333-8333-333333333332',
    name: 'Standard Appointment',
    description:
      'A regular service appointment suitable for common customer needs.',
    durationMinutes: 60,
    price: '220.00',
    sortOrder: 20,
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    name: 'Extended Session',
    description:
      'A longer appointment for more detailed work, planning, or service delivery.',
    durationMinutes: 90,
    price: '320.00',
    sortOrder: 30,
  },
  {
    id: '33333333-3333-4333-8333-333333333334',
    name: 'Follow-up Appointment',
    description:
      'A shorter follow-up appointment for updates, adjustments, or continued support.',
    durationMinutes: 45,
    price: '160.00',
    sortOrder: 40,
  },
];

const availabilityRules = [
  {
    id: '44444444-4444-4444-8444-444444444441',
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
  },
  {
    id: '44444444-4444-4444-8444-444444444442',
    dayOfWeek: 2,
    startTime: '09:00',
    endTime: '17:00',
  },
  {
    id: '44444444-4444-4444-8444-444444444443',
    dayOfWeek: 3,
    startTime: '09:00',
    endTime: '17:00',
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    dayOfWeek: 4,
    startTime: '09:00',
    endTime: '17:00',
  },
  {
    id: '44444444-4444-4444-8444-444444444445',
    dayOfWeek: 5,
    startTime: '09:00',
    endTime: '15:00',
  },
];

async function seedOwnerUser() {
  const passwordHash = await bcrypt.hash(ownerUser.password, BCRYPT_SALT_ROUNDS);

  await prisma.user.upsert({
    where: { email: ownerUser.email },
    update: {
      passwordHash,
      role: UserRole.OWNER,
      firstName: ownerUser.firstName,
      lastName: ownerUser.lastName,
      phone: ownerUser.phone,
    },
    create: {
      id: ownerUser.id,
      email: ownerUser.email,
      passwordHash,
      role: UserRole.OWNER,
      firstName: ownerUser.firstName,
      lastName: ownerUser.lastName,
      phone: ownerUser.phone,
    },
  });
}

async function seedBusiness() {
  await prisma.business.upsert({
    where: { id: business.id },
    update: business,
    create: business,
  });
}

async function seedServices() {
  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.id },
      update: {
        ...service,
        isActive: true,
      },
      create: {
        ...service,
        isActive: true,
      },
    });
  }
}

async function seedAvailabilityRules() {
  for (const rule of availabilityRules) {
    await prisma.availabilityRule.upsert({
      where: { id: rule.id },
      update: {
        ...rule,
        isActive: true,
      },
      create: {
        ...rule,
        isActive: true,
      },
    });
  }
}

async function main() {
  await seedOwnerUser();
  await seedBusiness();
  await seedServices();
  await seedAvailabilityRules();

  console.log('Seed completed.');
  console.log(`Owner login: ${ownerUser.email} / ${ownerUser.password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
