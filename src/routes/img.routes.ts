import express , { Router, Request, Response } from 'express';
import path from 'path/win32';
import fs from 'fs';
import { getImgesURLByFurnitureId, verifyFurnitureId } from '../services/img.service';
import { verifyTokenUsers,verifyTokenAdmin,verifyTokenModerator } from '../middlewares/auth';

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

// router.post('/upload/:furnitures_id',verifyTokenUsers, (req, res) => {
//   console.log(req.file)
//   verifyFurnitureId(req, res);
// });

router.get('/liste/:furnitures_id', (req, res) => {
  const { furnitures_id } = req.params;
  const images = getImgesURLByFurnitureId(Number(furnitures_id));
  res.send(images);
});

export { router as imgRoutes };