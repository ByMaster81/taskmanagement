// prisma/seed.js

import { PrismaClient, Role, TaskStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  
  
  await prisma.assignment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
  console.log('Veritabanı temizlendi.');

  


  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('isinsu123', 10);

  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin Ali',
      email: 'admin@example.com',
      password: adminPassword,
      role: Role.ADMINUSER, 
    },
  });

  const memberUser = await prisma.user.create({
    data: {
      name: 'Isınsu Yakısıklı',
      email: 'isinsu.yakisikli@std.yeditepe.edu.tr',
      password: userPassword,
      role: Role.USER, 
    },
  });
  const memberUser2 = await prisma.user.create({
    data: {
      name: 'Kullanıcı Veli',
      email: 'user2@example.com',
      password: userPassword,
      role: Role.USER, 
    },
  });
  console.log('👤 Kullanıcılar oluşturuldu.');
  console.log(`   -> Admin: admin@example.com / admin123`);
  console.log(`   -> User:  user@example.com / user123`);


  const task1 = await prisma.task.create({
    data: {
      title: 'Kullanıcı Arayüzünü Tasarla',
      description: 'Ana sayfa için modern bir arayüz tasarlanacak.',
      status: TaskStatus.PENDING,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'API Yetkilendirmesini Tamamla',
      description: 'Tüm endpointler için rol bazlı yetkilendirme eklenecek.',
      status: TaskStatus.IN_PROGRESS,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: 'Veritabanı Seed Scriptini Yaz',
      description: 'Geliştirme ortamı için test verileri oluşturulacak.',
      status: TaskStatus.DONE,
    },
  });

  const task4 = await prisma.task.create({
    data: {
      title: 'Docker Kurulumunu Yapılandır',
      description: 'Proje için Dockerfile ve docker-compose dosyaları hazırlanacak.',
      status: TaskStatus.PENDING,
    },
  });

  console.log('Görevler oluşturuldu.');


  await prisma.assignment.create({
    data: {
      userId: adminUser.id,
      taskId: task1.id,
    },
  });

  await prisma.assignment.create({
    data: {
      userId: adminUser.id,
      taskId: task4.id,
    },
  });

  // Kullanıcı Veli'ye iki görev atayalım
  await prisma.assignment.create({
    data: {
      userId: memberUser.id,
      taskId: task2.id,
    },
  });

  await prisma.assignment.create({
    data: {
      userId: memberUser.id,
      taskId: task3.id,
    },
  });

  console.log('Atamalar yapıldı.');
  console.log('Seed verisi başarıyla eklendi!');
}

main()
  .catch((e) => {
    console.error('❌ Seed script çalışırken bir hata oluştu:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });