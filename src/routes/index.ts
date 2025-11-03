import { Router, Request, Response } from 'express';
const router = Router();


import { usersRoutes } from './users.routes';

router.use("/users", usersRoutes);



export default router;