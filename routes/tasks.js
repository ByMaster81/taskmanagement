import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

//read
router.get('/', async (req, res) => {
  try{
    const tasks = await prisma.task.findMany({
      include: { assignments: { include: { user: true } } },
    });
    res.json(tasks);
  }catch (error) {
    res.status(500).json({ error: 'Fetching tasks failed' });
  }
});

//Create
router.post('/', async (req, res) => {
  try{
    const {title, description} = req.body;
    const task = await prisma.task.create({ data: {title, description}});
    res.json(task);
  }catch (error) {
    res.status(500).json({ error: 'Creating task failed' });
  }  
});

//Update
router.put('/:id', async(res, req) => {
  try{
    const {id} = req.params;
    const{title, description} = req.body;
    const task = await prisma.user.update({where: {id}, data:{title, description}});
    res.json(task);
  }catch (error) {
    res.status(500).json({ error: 'Update task failed' });
  }  
});


//Delete 
router.delete ('/:id', async(req, res) => {
  try{
    const {id} = req.params;
    await prisma.task.delete({where:{id}});
  }catch (error) {
    res.status(500).json({ error: 'Delete task failed' });
  }
})


export default router;
