import express, { Router, Request, Response } from 'express';
import { getAllUsers } from '../services/users.services';
import { addVolunteer } from '../services/users.services';

const router = Router();
router.use(express.json());

router.get('/', (req: Request, res: Response) => {
    res.json(getAllUsers());
});

router.post('/', async (req: Request, res: Response) => {
    let response = await addVolunteer(req.body);
    res.status(201).json(response);
});


export { router as usersRoutes };


