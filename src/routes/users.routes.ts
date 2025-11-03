import { Router, Request, Response } from 'express';

const router = Router();


router.get('/', (req: Request, res: Response) => {
  res.send('User route is working!');
});

router.get('/test', (req: Request, res: Response) => {
  res.send('User route test is working!');
});

export { router as usersRoutes };


