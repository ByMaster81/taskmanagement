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

//Create
router.post('/', async (req, res) => {
  const {title, description} = req.body;
  const task = await prisma.task.create({ data: {title, description}});
  res.json(task);
});

//Update
router.put('/:id', async(res, req) => {
  const {id} = req.params;
  const{title, description} = req.body;
  const task = await prisma.user.update({where: {id}, data:{title, description}});
  res.json(task);
});


//Delete 
router.delete ('/:id', async(req, res) => {
  const {id} = req.params;
  await prisma.task.delete({where:{id}});
})


export default router;
