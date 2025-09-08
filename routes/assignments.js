import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

//Read
router.get('/', async (req, res) => {
  const assignments = await prisma.assignment.findMany({
    include: { user: true, task: true },
  });
  res.json(assignments);
});

//Create
router.post('/', async(req,res) => {
    const { userId, taskId } = req.body;
    const assignment = await prisma.assignment.create({data: { userId, taskId}});
    res.json(assignment);
});

//Update
router.put('/:id', async(req,res) => {
    const {id} = req.params;
    const {userId, taskId} = req.body;
    const assignment = await prisma.assignment.update({where:{ id }, data:{ userId, taskId}});
    res.json(assignment);
});

//Delete
router.delete('/:id', async(req, res) => {
    const{id} = req.params;
    await prisma.assignment.delete({where: {id}});
    res.json({message: 'Assignment Deleted'});
});


export default router;
