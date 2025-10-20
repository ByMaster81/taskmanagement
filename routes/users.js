import { Router } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import {validateUserName, validateEmail} from '../middlewares/uservalidators.js';
import { validationResult } from 'express-validator';
import { protect, authorize } from '../middlewares/authMiddleware.js'; 
import bcrypt from 'bcryptjs';


const router = Router();
const prisma = new PrismaClient();

// Read
router.get('/', async (req, res) => {
  
  
  const { role } = req.query;
  const whereClause = {};
  if(role) {
    if (!Object.values(Role).includes(role)) {
      return res.status(400).json({
        error: 'Geçersiz Role'
      });
    }
    whereClause.role = role;
  }
  
  
  try{
    const users = await prisma.user.findMany({
      where: whereClause,
    });
    res.json(users);
  }catch (error) {
    res.status(500).json({ error: 'Fetching users failed' });
  }
  });


// Create
router.post('/', protect, validateUserName, validateEmail, authorize('ADMINUSER'), async (req, res) => {
  
  
  try{
    
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'İsim, e-posta ve şifre alanları zorunludur.' });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({ 
      data: { 
        name, 
        email, 
        password: hashedPassword,
        role: role || 'USER' 
      },
      select: { 
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: 'Kullanıcı oluşturulamadı veya e-posta zaten kullanımda.' });
  }
});





//Update
router.put('/:id' , async (req, res) => {
  try{
    const {id} = req.params;
    const {name, email} = req.body;
    const user = await prisma.user.update({where: {id}, data:{name, email}});
    res.json(user);
  }catch (error) {
    res.status(500).json({ error: 'Update user failed' });
  }  
});


//Delete 
router.delete('/:id', protect, authorize('ADMINUSER'), async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id === id) {
      return res.status(400).json({ error: 'Admin kendi hesabını silemez.' });
    }

    // Prisma, bir kullanıcıyı sildiğinde, schema.prisma'daki
    // "onDelete: Cascade" kuralı sayesinde o kullanıcıya ait tüm atamaları
    // (Assignment kayıtlarını) otomatik olarak silecektir.
    const deletedUser = await prisma.user.delete({
      where: { id },
      select: { name: true, email: true }
    });

    res.json({ message: 'Kullanıcı başarıyla silindi', user: deletedUser });
  } catch (error) {
    res.status(404).json({ error: 'Silinecek kullanıcı bulunamadı.' });
  }
});


/*

// Test
router.get('/test', async (req, res) => {
  const testUsers = await prisma.user.findMany({
    include: {
      tasks: {
        include: {
          task: true,
        },
      },
    },
  });
  res.json(testUsers);
});
*/

export default router;
