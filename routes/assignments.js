// routes/assignments.js
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect, authorize } from '../middlewares/authMiddleware.js'; 
const router = Router();
const prisma = new PrismaClient();


// GET /me (Bu fonksiyon değişmedi)
router.get('/me', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const assignments = await prisma.assignment.findMany({
            where: { userId: userId },
            include: { task: true }
        });
        res.json(assignments);
    } catch (error) {
        console.error("'/me' rotasında hata:", error);
        res.status(500).json({ error: 'Görevler alınırken bir hata oluştu.' });
    }
});


// Read (Bu fonksiyon değişmedi)
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

// Create (Bu fonksiyon değişmedi)
router.post('/', async(req,res) => {
    try{
      const { userId, taskId } = req.body;
      const assignment = await prisma.assignment.create({data: { userId, taskId}});
      res.json(assignment);
    }catch (error) {
    res.status(500).json({ error: 'Creating assignment failed' });
  }
});

// Update (GÜNCELLENDİ: Artık kısmi güncelleme yapabilir - Sadece userId gönderebilirsiniz)
router.put('/:id', protect, authorize('ADMINUSER'), async (req, res) => {
    try{
      const {id} = req.params;
      const {userId, taskId} = req.body; 

      
      const dataToUpdate = {};

      // Eğer body'de userId geldiyse, objeye ekle
      if (userId) {
        dataToUpdate.userId = userId;
      }
      // Eğer body'de taskId geldiyse, objeye ekle
      if (taskId) {
        dataToUpdate.taskId = taskId;
      }

      // Eğer hiçbir veri gelmediyse
      if (Object.keys(dataToUpdate).length === 0) {
        return res.status(400).json({ error: 'Güncellenecek veri (userId veya taskId) sağlanmadı.' });
      }


      const assignment = await prisma.assignment.update({
        where:{ id }, 
        data: dataToUpdate
      });

      res.json(assignment);
    }catch (error) {
      console.error("Atama güncelleme hatası:", error);
      res.status(500).json({ error: 'Updating assignment failed' });
    }  
});


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