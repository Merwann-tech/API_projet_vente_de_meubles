import express, { Router, Request, Response } from 'express';
import { addModerator, getAllUsers, getUserById } from '../services/users.services';
import { addVolunteer } from '../services/users.services';
import { verifyTokenUsers,verifyTokenAdmin,verifyTokenModerator } from '../middlewares/auth';

const router = Router();
router.use(express.json());

router.get('/', verifyTokenAdmin, (req: Request, res: Response) => {
    res.json(getAllUsers());
});

router.get('/:id', verifyTokenAdmin, (req: Request, res: Response) => {
    const idParam = req.params.id;
    if (!idParam) {
        return res.status(400).json({ message: "User ID is required" });
    }
    const id = parseInt(idParam);
    const user = getUserById(id);
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: "User not found" });
    }
});

router.post('/', async (req: Request, res: Response) => {
    let response = await addVolunteer(req.body);
    res.status(201).json(response);
});

router.put('/moderator/:id',verifyTokenAdmin, async (req: Request, res: Response) => {
    const idParam = req.params.id;
    if (!idParam) {
        return res.status(400).json({ message: "User ID is required" });
    }
    const id = parseInt(idParam);
    const result = addModerator(id);
    res.json(result);
});

export { router as usersRoutes };


