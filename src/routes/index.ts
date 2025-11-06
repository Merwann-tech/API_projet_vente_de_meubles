import { Router, Request, Response } from 'express';
const router = Router();


import { usersRoutes } from './users.routes';
import { loginRoutes } from './login.routes';
import { tokenRoutes } from './token.routes';
import { imgRoutes } from './img.routes';
import { furnitureRoutes } from './furniture.routes';

router.use("/token", tokenRoutes);
router.use("/login", loginRoutes);
router.use("/users", usersRoutes);
router.use("/images", imgRoutes);
router.use("/furnitures", furnitureRoutes);



export default router;