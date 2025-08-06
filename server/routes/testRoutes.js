// server/routes/testRoutes.js
import express from 'express';
const router = express.Router();

router.get('/ping', (req, res) => {
  res.send('pong');
});

export default router;