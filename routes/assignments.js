import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

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
router.put('/:id', async(req,res) => {
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
router.delete('/:id', async(req, res) => {
    try{
      const{id} = req.params;
      await prisma.assignment.delete({where: {id}});
      res.json({message: 'Assignment Deleted'});
    }catch (error) {
    res.status(500).json({ error: 'Delete assignment failed' });
  }  
});


export default router;
