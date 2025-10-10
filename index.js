import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/users.js';
import taskRoutes from './routes/tasks.js';
import assignmentRoutes from './routes/assignments.js';
import authRoutes from './routes/auth.js';

const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());


app.use('/auth', authRoutes); 
app.use('/users', userRoutes);
app.use('/tasks', taskRoutes);
app.use('/assignments', assignmentRoutes);
app.use(express.static('public'));


app.get('/', (req, res) => {
  res.json({ message: 'API çalışıyor!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} and accessible on the network`);
});
