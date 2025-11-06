import { Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import { db } from "../db";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../public/images"));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + req.params.furnitures_id + ext);
  },
});

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });

function handleImageUploadRequest(
  req: Request,
  res: Response,
  furnitures_id: number,
  fieldName: string = "image"
) {
  upload.single(fieldName)(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ message: err.message || "Upload error" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }
    addImageInDB(req.file.filename, furnitures_id);
    res.json({
      message: "Image uploaded!",
      fileName: req.file.filename,
      filePath: `/images/${req.file.filename}`,
    });
  });
}

function verifyNumberOfUploadedFiles(
  req: Request,
  res: Response,
  furnitureId: number
) {
  const row = db
    .prepare("SELECT COUNT(*) as count FROM images WHERE furnitures_id = ?")
    .get(furnitureId) as { count: number };
  if (row && row.count >= 5) {
    return res
      .status(400)
      .json({ message: "Maximum of 5 images allowed per furniture." });
  } else {
    handleImageUploadRequest(req, res, furnitureId);
  }
}

function addImageInDB(fileName: string, furnitureId: number) {
  const stmt = db.prepare(
    "INSERT INTO images (url, name , furnitures_id) VALUES (?, ?, ?)"
  );
  stmt.run(`/images/${fileName}`, fileName, furnitureId);
}

export function verifyFurnitureId(req: Request, res: Response) {
  const furnitureIdParam = req.params.furnitures_id;
  if (!furnitureIdParam) {
    return res.status(400).json({ message: "Furniture ID is required." });
  }
  const furnitureId = parseInt(furnitureIdParam);
  const row = db
    .prepare("SELECT id FROM furnitures WHERE id = ?")
    .get(furnitureId);
  if (!row) {
    return res.status(400).json({ message: "Invalid furniture ID." });
  } else {
    verifyNumberOfUploadedFiles(req, res, furnitureId);
  }
}

export function getImgesURLByFurnitureId(furnitureId: number) {
  const stmt = db.prepare(
    "SELECT url FROM images WHERE furnitures_id = ?"
  );
  const rows = stmt.all(furnitureId) as { url: string }[];
  return rows.map((row) => row.url);
}
