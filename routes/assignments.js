import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /assignments
router.get('/', async (req, res) => {
  const assignments = await prisma.assignment.findMany({
    include: { user: true, task: true },
  });
  res.json(assignments);
});

export default router;
