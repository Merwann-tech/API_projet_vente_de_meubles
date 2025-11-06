import express , { Router, Request, Response } from 'express';
import {addfurniture, getAllValidatedFurnitures, rejectFurniture, validateFurniture} from '../services/furniture.service';
const router = Router();
router.use(express.json());
import { verifyTokenUsers,verifyTokenAdmin,verifyTokenModerator } from '../middlewares/auth';


router.get('/', async (req : Request, res :Response) => {
    const furnitures = await getAllValidatedFurnitures();
    console.log(furnitures);
    res.send(furnitures);
}); 



router.post('/',verifyTokenUsers, async (req : Request, res :Response) => {
    const result = await addfurniture(req.body);
    res.send(result);
});

router.put('/validate/:id',verifyTokenModerator, async (req : Request, res :Response) => {
    validateFurniture(Number(req.params.id));
    res.send(`Furniture with id ${req.params.id} has been validated`);
});

router.put('/reject/:id',verifyTokenModerator, async (req : Request, res :Response) => {
    rejectFurniture(Number(req.params.id));
    res.send(`Furniture with id ${req.params.id} has been rejected`);
});


export { router as furnitureRoutes };