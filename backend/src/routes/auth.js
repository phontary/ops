import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'sabry' && password === 'pass') {
    const token = jwt.sign(
      { username, id: '1' },
      process.env.JWT_SECRET || 'ops-secret',
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: { username, id: '1' }
    });
  }

  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

export default router;
