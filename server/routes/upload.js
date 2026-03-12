import { Router } from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";

const router = Router();

// store file in memory instead of disk
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post("/", upload.single("image"), async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // convert buffer to base64
    const base64 = req.file.buffer.toString("base64");

    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${base64}`,
      {
        folder: "products"
      }
    );

    res.status(200).json({
      success: true,
      url: result.secure_url
    });

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

export default router;