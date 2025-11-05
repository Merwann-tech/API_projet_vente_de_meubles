import express , { Router, Request, Response } from 'express';
import path from 'path/win32';
import fs from 'fs';

const router = Router();

router.get('/:imgName', (req, res) => {
  const { imgName } = req.params;
  const imgPath = path.join(__dirname, '../../public/images', imgName);
  if (fs.existsSync(imgPath)) {
    res.sendFile(imgPath);
  } else {
    res.status(404).send('Image not found');
  }
});

export { router as imgRoutes };