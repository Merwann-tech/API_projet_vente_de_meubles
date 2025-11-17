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
    cb(null, Date.now() + "-" + ext);
  }
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

export const upload = multer({ storage: storage, fileFilter: fileFilter });


function addImageInDB(fileName: string | undefined, furnitureId: number) {
  if (!fileName || typeof fileName !== "string") {
    console.error("addImageInDB - Invalid filename", { fileName, furnitureId });
    return;
  }
  const stmt = db.prepare(
    "INSERT INTO images (url, name , furnitures_id) VALUES (?, ?, ?)"
  );
  stmt.run(`/images/${fileName}`, fileName, furnitureId);
}

export function getImgesURLByFurnitureId(furnitureId: number) {
  const stmt = db.prepare("SELECT url FROM images WHERE furnitures_id = ?");
  const rows = stmt.all(furnitureId) as { url: string }[];
  return rows.map((row) => row.url);
}


export function handleImageUploadRequest(
  req: Request,
  res: Response,
  furnitures_id: number,
) {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    return res.status(400).json({ message: "Aucun fichier envoyé." });
  }

  const files = req.files as Express.Multer.File[];
  let errorInFiles = false;
  files.forEach((file) => {
    if (file && typeof file.filename === "string" && file.filename.length > 0) {
      addImageInDB(file.filename, furnitures_id);
    } else {
      errorInFiles = true;
      console.error("Incorrect file object or filename:", file);
    }
  });

  if (errorInFiles) {
    return res.status(400).json({ message: "Erreur sur certains fichiers." });
  }

  res.json({
    message: "Images uploadées !",
    files: files.map((file) => ({
      fileName: file.filename,
      filePath: `/images/${file.filename}`,
    })),
  });
}


export function verifyNumberOfUploadedFiles(
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

export function verifyFurnitureId(
  req: Request,
  res: Response,
  id: number | bigint
) {
  const row = db.prepare("SELECT id FROM furnitures WHERE id = ?").get(id);
  if (!row) {
    return res.status(400).json({ message: "Invalid furniture ID." });
  } else {
    verifyNumberOfUploadedFiles(req, res, Number(id));
  }
}
