import { Router, Request, Response } from 'express';
const router = Router();


import { usersRoutes } from './users.routes';
import { loginRoutes } from './login.routes';
import { tokenRoutes } from './token.routes';

router.use("/token", tokenRoutes);
router.use("/login", loginRoutes);
router.use("/users", usersRoutes);



export default router;