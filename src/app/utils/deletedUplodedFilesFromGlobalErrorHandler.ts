import { Request } from "express";
import { deleteFileFromCloudinary } from "../../config/cloudinary.config";

export const deleteUploadedFilesFromGlobalErrorHandler = async (req: Request) => {
    try {
        const filesToDeleted: string[] = [];
        if (req.file && req.file?.path) {
            filesToDeleted.push(req.file.path);
        } else if (req.files && typeof req.files === "object" && !Array.isArray(req.files)) {
            Object.values(req.files).forEach((fileArray) => {
                if (Array.isArray(fileArray)) {
                    fileArray.forEach((file) => {
                        if (file?.path) {
                            filesToDeleted.push(file.path);
                        }
                    })
                }

            });
        }
        else if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            req.files.forEach((file) => {
                if (file.path) {
                    filesToDeleted.push(file.path);
                }
            })
        }
        if (filesToDeleted.length > 0) {
            await Promise.all(
                filesToDeleted.map(url => deleteFileFromCloudinary(url))
            )

            console.log(`Deleted files successfully from cloudinary: ${filesToDeleted.join(", ")}`);
        }
    } catch (error: any) {
        console.error("error deleting uploaded files from global error handler")
    }
}