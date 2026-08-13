import multer from "multer";

// Use memory storage so the file buffer is available via req.file.buffer
// Upload to Cloudinary is handled manually in the controller via uploadFileToCloudinary
const storage = multer.memoryStorage();

export const multerUpload = multer({ storage });