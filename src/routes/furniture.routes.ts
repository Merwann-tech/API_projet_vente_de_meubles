import express, { Router, Request, Response } from "express";
import {
  addfurniture,
  getAllValidatedFurnitures,
  rejectFurniture,
  validateFurniture,
} from "../services/furniture.service";
const router = Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
import {
  verifyTokenUsers,
  verifyTokenAdmin,
  verifyTokenModerator,
} from "../middlewares/auth";
import { upload,verifyFurnitureId } from "../services/img.service";

router.get("/", async (req: Request, res: Response) => {
  const furnitures = await getAllValidatedFurnitures();
  console.log(furnitures);
  res.send(furnitures);
});

router.post(
  "/",
  verifyTokenUsers,
  upload.array("images", 5),
  async (req: Request, res: Response) => {
    const data = req.body;
    const id = await addfurniture(data, Number((req as any).id));
    verifyFurnitureId(req, res, id);
  }
);

router.put(
  "/validate/:id",
  verifyTokenModerator,
  async (req: Request, res: Response) => {
    validateFurniture(Number(req.params.id));
    res.send(`Furniture with id ${req.params.id} has been validated`);
  }
);

router.put(
  "/reject/:id",
  verifyTokenModerator,
  async (req: Request, res: Response) => {
    rejectFurniture(Number(req.params.id));
    res.send(`Furniture with id ${req.params.id} has been rejected`);
  }
);

export { router as furnitureRoutes };
