import { PrismaClient, type UserRole } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

const roles: UserRole[] = ['superadmin', 'admin', 'manager', 'employee'];
const defaultPassword = process.env.SEED_USER_PASSWORD ?? 'Password123';

async function main() {
  const passwordHash = await hash(defaultPassword, 10);

  for (const role of roles) {
    await prisma.user.upsert({
      where: { login: role },
      update: {
        role,
        passwordHash,
        isActive: true,
        isBlocked: false,
      },
      create: {
        login: role,
        passwordHash,
        role,
        firstName: role,
        lastName: 'Seed',
        isActive: true,
        isBlocked: false,
      },
    });
  }

  console.log(`Seeded users: ${roles.join(', ')}`);
  console.log(`Default password: ${defaultPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
