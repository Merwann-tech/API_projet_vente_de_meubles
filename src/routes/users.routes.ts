import express, { Router, Request, Response } from "express";
import {
    addAdmin,
  addModerator,
  getAllUsers,
  getUserById,
  listUsersByName,
  removeAdmin,
  removeModerator,
  updateUser,
} from "../services/users.services";
import { addVolunteer } from "../services/users.services";
import {
  verifyTokenUsers,
  verifyTokenAdmin,
} from "../middlewares/auth";

const router = Router();
router.use(express.json());

router.get("/", verifyTokenAdmin, (req: Request, res: Response) => {
  res.json(getAllUsers());
});

router.get("/id/:id", verifyTokenAdmin, (req: Request, res: Response) => {
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

router.get("/token", verifyTokenUsers, (req: Request, res: Response) => {
  const volunteerId = Number((req as { id?: number }).id);
  const row = getUserById(volunteerId);
  res.status(200).json(row);
});

router.post("/", async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await addVolunteer(req.body as any);
  res.status(201).json(response);
});

router.put(
  "/addModerator/:id",
  verifyTokenAdmin,
  async (req: Request, res: Response) => {
    const idParam = req.params.id;
    if (!idParam) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const id = parseInt(idParam);
    const result = addModerator(id);
    res.json(result);
  }
);

router.put(
  "/removeModerator/:id",
  verifyTokenAdmin,
  async (req: Request, res: Response) => {
    const idParam = req.params.id;
    if (!idParam) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const id = parseInt(idParam);
    const result = removeModerator(id);
    res.json(result);
  }
);

router.put("/addAdmin/:id", verifyTokenAdmin, async (req: Request, res: Response) => {
  const idParam = req.params.id;
  if (!idParam) {
    return res.status(400).json({ message: "User ID is required" });
  }
  const result = addAdmin(idParam);
  res.json(result);
});

router.put("/removeAdmin/:id", verifyTokenAdmin, async (req: Request, res: Response) => {
  const idParam = req.params.id;
  if (!idParam) {
    return res.status(400).json({ message: "User ID is required" });
  }
  const userId = (req as { id?: number }).id;
  if (userId === undefined) {
      return res.status(400).json({ message: "User ID missing in token" });
  }
  const result = removeAdmin(idParam, userId);
  res.json(result);
});

router.put("/token", verifyTokenUsers, async (req: Request, res: Response) => {
  const volunteerId = Number((req as { id?: number }).id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await updateUser(volunteerId, req.body as any);
  res.json(result);
});
router.get("/name/:name", verifyTokenAdmin, (req: Request, res: Response) => {
  const nameParam = req.params.name;
  const users = listUsersByName(nameParam);
  res.status(200).json(users);
});
router.get("/name", verifyTokenAdmin, (req: Request, res: Response) => {
  const users = listUsersByName("");
  res.status(200).json(users);
});

export { router as usersRoutes };
