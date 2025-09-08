import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Read
router.get('/', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});


// Create
router.post('/', async (req, res) => {
  const { name, email } = req.body;
  const user = await prisma.user.create({ data: { name, email } });
  res.json(user);
});

//Update
router.put('/:id' , async (req, res) => {
  const {id} = req.params;
  const {name, email} = req.body;
  const user = await prisma.user.update({where: {id}, data:{name, email}});
  res.json(user);
});


//Delete 
router.delete('/:id', async (req, res) => {
  const {id} = req.params;
  const user = await prisma.user.delete({where:{id}});
  res.json({ message: 'User deleted', user: user });
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
