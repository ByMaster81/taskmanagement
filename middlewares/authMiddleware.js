// middlewares/authMiddleware.js

import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


export const protect = async (req, res, next) => {
    let token;

    // 1. İstek başlığında token var mı diye kontrol et
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 2. Token'ı 'Bearer ...' metninden ayıkla
            token = req.headers.authorization.split(' ')[1];

            // 3. Token'ın geçerli olup olmadığını gizli anahtarla doğrula
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // 4. Token içindeki kullanıcı ID'si ile kullanıcıyı veritabanından bul
            //    ve hassas olmayan bilgileri (şifre hariç) req objesine ekle
            req.user = await prisma.user.findUnique({ 
                where: { id: decoded.id },
                select: { id: true, email: true, name: true, role: true }
            });

            // 5. Her şey yolundaysa, isteğin asıl gideceği rotaya devam etmesine izin ver
            next();
        } catch (error) {
            return res.status(401).json({ error: 'Yetkisiz erişim, token geçersiz' });
        }
    }

    if (!token) {
        return res.status(401).json({ error: 'Yetkisiz erişim, token bulunamadı' });
    }


    
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        
        // Eğer kullanıcının rolü, izin verilen roller listesinde DEĞİLSE...
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: `Bu işlemi yapmak için yetkiniz yok. Gerekli rol: ${roles.join(' veya ')}` 
            });
        }
        next();
    };
};