
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http'; 
import { Server } from 'socket.io'; 
import jwt from 'jsonwebtoken'; 
import { PrismaClient } from '@prisma/client'; 

// --- ROTA İMPORTLARI ---
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import tasksRoutes from './routes/tasks.js';
import assignmentsRoutes from './routes/assignments.js';
import messageRoutes from './routes/messages.js'; 

dotenv.config();
const app = express();
const prisma = new PrismaClient(); 


const httpServer = createServer(app); 


const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// --- ROTA KULLANIMLARI ---
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/tasks', tasksRoutes);
app.use('/assignments', assignmentsRoutes);
app.use('/messages', messageRoutes); 

// --- YENİ: SOCKET.IO BAĞLANTI YÖNETİMİ ---


io.use((socket, next) => {
  const token = socket.handshake.auth.token; 
  if (!token) {
    return next(new Error('Yetkilendirme hatası: Token bulunamadı.'));
  }

  try {   
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);    
    socket.user = decodedToken; 
    next(); 
  } catch (err) {
    return next(new Error('Yetkilendirme hatası: Geçersiz token.'));
  }
});


io.on('connection', (socket) => {
  console.log(`Kullanıcı bağlandı: ${socket.user.name} (ID: ${socket.user.id})`);
  socket.join(socket.user.id);
  socket.on('sendMessage', async (data) => {
    try {
      const { receiverId, content } = data;
      const senderId = socket.user.id;

      if (!receiverId || !content) return; 

      
      const newMessage = await prisma.message.create({
        data: {
          content,
          senderId,
          receiverId,
        },
        include: { 
          sender: {
            select: { id: true, name: true }
          }
        }
      });

      
      io.to(receiverId).emit('receiveMessage', newMessage);

    
      socket.emit('receiveMessage', newMessage);

    } catch (error) {
      console.error("Mesaj gönderme (socket) hatası:", error);
      // Hata olursa gönderene özel bir hata mesajı yollayabiliriz
      socket.emit('error', { message: 'Mesaj gönderilirken bir hata oluştu.' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Kullanıcı bağlantıyı kesti: ${socket.user.name}`);
  });
});


// --- Sunucuyu Başlatma ---
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Sunucu ${PORT} portunda http://0.0.0.0:${PORT} adresinde çalışıyor... (WebSocket aktif)`);
});