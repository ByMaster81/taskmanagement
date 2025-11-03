// routes/messages.js
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();
const prisma = new PrismaClient();


/**
 * @route   GET /messages/:otherUserId
 * @desc    İki kullanıcı arasındaki SOHBET GEÇMİŞİNİ getirir (app.js -> fetchMessageHistory)
 * @access  Private
 */
router.get('/:otherUserId', protect, async (req, res) => {
  const myId = req.user.id;
  const { otherUserId } = req.params;

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: myId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: myId },
        ],
      },
      include: {
        sender: { 
          select: { id: true, name: true }
        }
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Mesaj geçmişi alma hatası:", error);
    res.status(500).json({ error: 'Mesaj geçmişi alınamadı.' });
  }
});

export default router;