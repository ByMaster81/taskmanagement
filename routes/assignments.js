import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect, authorize } from '../middlewares/authMiddleware.js'; 
const router = Router();
const prisma = new PrismaClient();



router.get('/me', protect, async (req, res) => {
    try {
        
        const userId = req.user.id;

        const assignments = await prisma.assignment.findMany({
            where: {
                userId: userId, 
            },
            include: {
                task: true, 
            }
        });

        res.json(assignments);

    } catch (error) {
        console.error("'/me' rotasında hata:", error);
        res.status(500).json({ error: 'Görevler alınırken bir hata oluştu.' });
    }
});



//Read
router.get('/', async (req, res) => {
  try{
    const assignments = await prisma.assignment.findMany({
    include: { user: true, task: true },
    });
    res.json(assignments);
  }catch (error) {
    res.status(500).json({ error: 'Fetching assignments failed' });
  }
});

//Create
router.post('/', async(req,res) => {
    try{
      const { userId, taskId } = req.body;
      const assignment = await prisma.assignment.create({data: { userId, taskId}});
      res.json(assignment);
    }catch (error) {
    res.status(500).json({ error: 'Creating assignment failed' });
  }
});

//Update
router.put('/:id', protect, authorize('ADMINUSER'), async (req, res) => {
    try{
      const {id} = req.params;
      const {userId, taskId} = req.body;
      const assignment = await prisma.assignment.update({where:{ id }, data:{ userId, taskId}});
      res.json(assignment);
    }catch (error) {
    res.status(500).json({ error: 'Updating assignment failed' });
  }  
});

//Delete
router.delete('/:id', protect, authorize('ADMINUSER'), async (req, res) => {
    try{
      const{id} = req.params;
      await prisma.assignment.delete({where: {id}});
      res.json({message: 'Assignment Deleted'});
    }catch (error) {
    res.status(500).json({ error: 'Delete assignment failed' });
  }  
});


export default router;
