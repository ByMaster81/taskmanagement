import { Router } from 'express';
import { PrismaClient, TaskStatus } from '@prisma/client';
import { protect, authorize } from '../middlewares/authMiddleware.js'; 
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
router.put('/:id/status', protect, authorize('ADMINUSER'), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        
        if (!status || !Object.values(TaskStatus).includes(status)) {
            return res.status(400).json({ 
                error: `Geçersiz durum değeri. Kullanılabilecek durumlar: ${Object.values(TaskStatus).join(', ')}` 
            });
        }

        const updatedTask = await prisma.task.update({
            where: { id: id },
            data: { status: status }
        });

        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ error: 'Görev durumu güncellenemedi.' });
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
