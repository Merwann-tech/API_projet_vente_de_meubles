import express, { Router, Request, Response } from "express";
import {
  addfurniture,
  getAllValidatedFurnitures,
  rejectFurniture,
  validateFurniture,
    getAllmoderatorFurnitures,
    getAllUsersFurnitures,
    deleteFurnitureById,
    getTypeListe,
    getCityListe,
    getColorListe,
    getMaterialListe,
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

// router.get("/", async (req: Request, res: Response) => {
//   const furnitures = await getAllValidatedFurnitures();
//   res.send(furnitures);
// });

router.get("/typeListe", async (req: Request, res: Response) => {
   const response = getTypeListe()
   res.send(response);
})
router.get("/cityListe", async (req: Request, res: Response) => {
   const response = getCityListe()
   res.send(response);
})
router.get("/colorListe", async (req: Request, res: Response) => {
   const response = getColorListe()
   res.send(response);
})
router.get("/materialListe", async (req: Request, res: Response) => {
   const response = getMaterialListe()
   res.send(response);
})






router.get("/moderator/:status/:search",verifyTokenModerator, async (req: Request, res: Response) => {
    const status = req.params.status !== undefined ? req.params.status : "all";
    const search = req.params.search !== undefined ? req.params.search : "";
    const furnitures = getAllmoderatorFurnitures(status, search);
    res.send(furnitures);
});

router.get("/moderator/:status",verifyTokenModerator, async (req: Request, res: Response) => {
    const status = req.params.status !== undefined ? req.params.status : "all";
    const search = "";
    const furnitures = getAllmoderatorFurnitures(status, search);
    res.send(furnitures);
});

router.get("/users/:status/:search",verifyTokenUsers, async (req: Request, res: Response) => {
    const status = req.params.status !== undefined ? req.params.status : "all";
    const search = req.params.search !== undefined ? req.params.search : "";
    const furnitures = getAllUsersFurnitures(status, search, Number((req as any).id));
    res.send(furnitures);
});

router.get("/users/:status",verifyTokenUsers, async (req: Request, res: Response) => {
    const status = req.params.status !== undefined ? req.params.status : "all";
    const search = "";
    const furnitures = getAllUsersFurnitures(status, search, Number((req as any).id));
    res.send(furnitures);
});

router.delete("/users/:id",verifyTokenUsers, async (req: Request, res: Response) => {
    const response = deleteFurnitureById(Number(req.params.id), Number((req as any).id));
    if (response.success) {
        res.status(200).send(response);
    } else {
        res.status(404).send(response);
    }
});

router.delete("/moderator/:id",verifyTokenModerator, async (req: Request, res: Response) => {
    const response = deleteFurnitureById(Number(req.params.id), Number((req as any).id),true);
    if (response.success) {
        res.status(200).send(response);
    } else {
        res.status(404).send(response);
    }
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
