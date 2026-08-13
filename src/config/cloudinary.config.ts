import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import status from "http-status";
import { envVars } from "./env";
import AppError from "../app/errorHelpers/AppError";

cloudinary.config({
    cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
    api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
    api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET,
})

export const uploadFileToCloudinary = async (
    buffer: Buffer,
    fileName: string,
): Promise<UploadApiResponse> => {

    if (!buffer || !fileName) {
        throw new AppError("File buffer and file name are required for upload", status.BAD_REQUEST);
    }

    const extension = fileName.split(".").pop()?.toLocaleLowerCase();

    const fileNameWithoutExtension = fileName
        .split(".")
        .slice(0, -1)
        .join(".")
        .toLowerCase()
        .replace(/\s+/g, "-")
        // eslint-disable-next-line no-useless-escape
        .replace(/[^a-z0-9\-]/g, "");

    const uniqueName =
        Math.random().toString(36).substring(2) +
        "-" +
        Date.now() +
        "-" +
        fileNameWithoutExtension;

    const folder = extension === "pdf" ? "pdfs" : "images";


    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                resource_type: "auto",
                public_id: `ph-healthcare/${folder}/${uniqueName}`,
            },
            (error, result) => {
                if (error) {
                    console.error("[Cloudinary Upload Error]", JSON.stringify(error, null, 2));
                    return reject(new AppError(
                        `Cloudinary upload failed: ${error.message} (http_code: ${error.http_code})`,
                        status.INTERNAL_SERVER_ERROR
                    ));
                }
                resolve(result as UploadApiResponse);
            }
        ).end(buffer);
    })


}

export const deleteFileFromCloudinary = async (url: string) => {

    try {
        const regex = /\/v\d+\/(.+?)(?:\.[a-zA-Z0-9]+)+$/;

        const match = url.match(regex);

        if (match && match[1]) {
            const publicId = match[1];

            await cloudinary.uploader.destroy(
                publicId, {
                resource_type: "image"
            }
            )

            console.log(`File ${publicId} deleted from cloudinary`);
        }

    } catch (error) {
        console.error("Error deleting file from Cloudinary:", error);
        throw new AppError("Failed to delete file from Cloudinary", status.INTERNAL_SERVER_ERROR);
    }
}


export const cloudinaryUpload = cloudinary;