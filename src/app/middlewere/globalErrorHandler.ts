/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { envVars } from "../../config/env";
import status from "http-status";
import z from "zod";
import { TErrorResponse, TErrorSource } from "../interfaces/error.interfaces";
import { handleZodError } from "../errorHelpers/handleZodError";
import AppError from "../errorHelpers/AppError";
import { deleteFileFromCloudinary } from "../../config/cloudinary.config";




// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const globalErrorHandler = async (err: any, req: Request, res: Response, next: NextFunction) => {
    if (envVars.NODE_ENV === 'development') {
        console.log("error from global error handler", err)
    }

    // Only delete from Cloudinary if a URL path exists (multer memoryStorage does not set file.path)
    if (req.file?.path) {
        await deleteFileFromCloudinary(req.file.path);
    }

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const imageUrls = req.files.map((file) => file.path).filter(Boolean);
        await Promise.all(imageUrls.map(url => deleteFileFromCloudinary(url)));
    }

    let statusCode: number = status.INTERNAL_SERVER_ERROR;
    let message: string = "internal server error"
    let errorSources: TErrorSource[] = [];
    let stack: string | undefined = undefined;

    if (err instanceof z.ZodError) {
        const simplifiedError = handleZodError(err);
        statusCode = simplifiedError.statusCode as number;
        message = simplifiedError.message;
        errorSources = [...simplifiedError.errorSources];
        stack = err.stack;
    }
    else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        stack = err.stack;
        errorSources = [
            {
                path: "",
                message: err.message
            }
        ]
    }
    else if (err instanceof Error) {
        statusCode = status.INTERNAL_SERVER_ERROR;
        message = err.message;
        stack = err.stack;
        errorSources = [
            {
                path: "",
                message: err.message
            }
        ]
    }

    const errorResponse: TErrorResponse = {
        success: false,
        message: message,
        stack: envVars.NODE_ENV === "development" ? stack : undefined,
        errorSources,
        error: envVars.NODE_ENV === "development" ? err : undefined,
    }

    res.status(statusCode).json(errorResponse);

} 