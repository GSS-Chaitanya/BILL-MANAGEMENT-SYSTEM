import multer from "multer";
import cloudinary from "../config/cloudinary.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("image"), async (req, res) => {

  const base64 = req.file.buffer.toString("base64");

  const result = await cloudinary.uploader.upload(
    `data:${req.file.mimetype};base64,${base64}`
  );

  res.json({
    url: result.secure_url
  });

});