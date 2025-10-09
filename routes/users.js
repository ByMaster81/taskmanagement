import { Router } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import {validateUserName, validateEmail} from '../middlewares/uservalidators.js';
import { validationResult } from 'express-validator';

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
router.post('/', validateUserName, validateEmail, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()){
    return res.status(400).json({errors: errors.array()});
  }
  
  
  try{
    const { name, email } = req.body;
    const user = await prisma.user.create({ data: { name, email, password } });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Creating user failed' });
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
router.delete('/:id', async (req, res) => {
  try{
    const {id} = req.params;
    const user = await prisma.user.delete({where:{id}});
    res.json({ message: 'User deleted', user: user });
  }catch (error) {
    res.status(500).json({ error: 'Delete user failed' });
  }
});

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


export default router;
