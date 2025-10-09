// prisma/seed.js

// PrismaClient ve enum'ları @prisma/client'tan import ediyoruz
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Önceki veriler siliniyor...');
  // Her çalıştırmada tutarlı bir başlangıç için eski verileri temizliyoruz.
  await prisma.assignment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
  console.log('Önceki veriler silindi.');

  console.log('Seed verisi ekleniyor...');

  // 1. Kullanıcıları rollerine ve düz metin şifrelerine göre oluştur
  const adminUser = await prisma.user.create({
    data: {
      name: 'Ahmet (Admin)',
      email: 'ahmet@example.com',
      password: 'ahmet1234_düz_metin', // Şifre doğrudan yazılıyor
      role: Role.ADMINUSER,            // Rol enum kullanılarak atanıyor
    },
  });

  const memberUser = await prisma.user.create({
    data: {
      name: 'Ayşe (Member)',
      email: 'ayse@example.com',
      password: 'ayse1234_düz_metin',  // Şifre doğrudan yazılıyor
      role: Role.USER,                 // Varsayılan rolü de belirtebiliriz
    },
  });

  console.log('Kullanıcılar oluşturuldu.');

  // 2. Görevleri oluştur
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

  const task3 = await prisma.task.create({
    data: {
      title: 'Veritabanı optimizasyonu',
      description: 'Sorgu performansları incelenecek',
    },
  });

  console.log('Görevler oluşturuldu.');

  // 3. Atamaları yap
  await prisma.assignment.create({
    data: {
      userId: adminUser.id,
      taskId: task1.id,
    },
  });

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
  console.log('Seed verisi başarıyla eklendi! 🎉');
}

main()
  .catch((e) => {
    console.error('Seed script çalışırken bir hata oluştu:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Script bittiğinde veritabanı bağlantısını kapat
    await prisma.$disconnect();
  });