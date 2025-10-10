// routes/auth.js

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

/*
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Tüm alanlar zorunludur.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword }
        });
        res.status(201).json({ id: user.id, name: user.name, email: user.email });
    } catch (error) {
        res.status(400).json({ error: 'Bu e-posta adresi zaten kullanılıyor.' });
    }
});
*/


// KULLANICI GİRİŞİ VE TOKEN ALMA (/auth/login)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Geçersiz e-posta veya şifre' });
    }

    const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );
    res.json({ token });
});

export default router;