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
  verifyTokenModerator,
} from "../middlewares/auth";
import { upload,verifyFurnitureId } from "../services/img.service";


router.get("/search", async (req: Request, res: Response) => {
  const search = req.query.query ? String(req.query.query) : "";
  const type = req.query.type
    ? Array.isArray(req.query.type)
      ? req.query.type.map(String)
      : [String(req.query.type)]
    : [];
  const color = req.query.color
    ? Array.isArray(req.query.color)
      ? req.query.color.map(String)
      : [String(req.query.color)]
    : [];
  const material = req.query.material
    ? Array.isArray(req.query.material)
      ? req.query.material.map(String)
      : [String(req.query.material)]
    : [];
  const city = req.query.city
    ? Array.isArray(req.query.city)
      ? req.query.city.map(String)
      : [String(req.query.city)]
    : [];
  const priceMin = req.query.priceMin ? Number(req.query.priceMin) : undefined;
  const priceMax = req.query.priceMax ? Number(req.query.priceMax) : undefined;

  const furnitures = await getAllValidatedFurnitures(
    search,
    type,
    color,
    material,
    city,
    priceMin,
    priceMax,
  );
  res.send(furnitures);
});

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
    const furnitures = getAllUsersFurnitures(status, search, Number((req as { id?: number }).id));
    res.send(furnitures);
});

router.get("/users/:status",verifyTokenUsers, async (req: Request, res: Response) => {
    const status = req.params.status !== undefined ? req.params.status : "all";
    const search = "";
    const furnitures = getAllUsersFurnitures(status, search, Number((req as { id?: number }).id));
    res.send(furnitures);
});

router.delete("/users/:id",verifyTokenUsers, async (req: Request, res: Response) => {
    const response = deleteFurnitureById(Number(req.params.id), Number((req as { id?: number }).id));
    if (response.success) {
        res.status(200).send(response);
    } else {
        res.status(404).send(response);
    }
});

router.delete("/moderator/:id",verifyTokenModerator, async (req: Request, res: Response) => {
    const response = deleteFurnitureById(Number(req.params.id), Number((req as { id?: number }).id),true);
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
    const id = await addfurniture(data, Number((req as { id?: number }).id));
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
