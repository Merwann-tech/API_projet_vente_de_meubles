import express , { Router, Request, Response } from 'express';
import { loginUser } from '../services/login.services';

const router = Router();
router.use(express.json());

router.post('/', async (req : Request, res :Response) => {
    let response = await loginUser(req.body.email, req.body.password)
    res.json(response);
})



export { router as loginRoutes };