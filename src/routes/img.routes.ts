import express , { Router } from 'express';
import path from 'path/win32';
import fs from 'fs';
// ...existing code...
// ...existing code...

const router = Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

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