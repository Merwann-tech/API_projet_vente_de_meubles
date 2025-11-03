import { Router, Request, Response } from 'express';
import { getAllUsers } from '../services/users.services';

const router = Router();


router.get('/', (req: Request, res: Response) => {
    res.json(getAllUsers());
});

router.get('/test', (req: Request, res: Response) => {
  res.send('User route test is working!');
});

export { router as usersRoutes };


