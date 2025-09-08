import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Kullanıcı ekle
  const user1 = await prisma.user.create({
    data: {
      name: 'Ahmet',
      email: 'ahmet@example.com',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Ayşe',
      email: 'ayse@example.com',
    },
  });

  // Task ekle
  const task1 = await prisma.task.create({
    data: {
      title: 'Frontend geliştirme',
      description: 'Login sayfası tasarlanacak',
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Backend API',
      description: 'Users endpoint tamamlanacak',
    },
  });

  // Assignment ekle (task-user ilişkisi)
  await prisma.assignment.create({
    data: {
      userId: user1.id,
      taskId: task1.id,
    },
  });

  await prisma.assignment.create({
    data: {
      userId: user2.id,
      taskId: task2.id,
    },
  });

  console.log('Seed verisi eklendi!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
