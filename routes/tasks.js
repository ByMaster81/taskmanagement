import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

//read
router.get('/', async (req, res) => {
  const tasks = await prisma.task.findMany({
    include: { assignments: { include: { user: true } } },
  });
  res.json(tasks);
});

//Add
router.post('/', async (req, res) => {
  const {title, description} = req.body;
  const task = await prisma.task.create({ data: {title, description}});
  res.json(task);
});

export default router;
