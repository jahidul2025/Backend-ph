import status from "http-status";
import z from "zod";
import { TErrorResponse, TErrorSource } from "../interfaces/error.interfaces";

export const handleZodError = (err: z.ZodError): TErrorResponse => {
    const statusCode = status.BAD_REQUEST;
    const message = "Validation Error"
    const errorSources: TErrorSource[] = [];
    err.issues.forEach(issue => {
        errorSources.push({
            path: issue.path.join(" => ") || "Unknown",
            message: issue.message
        })
    })

    return {
        success: false,
        message,
        statusCode,
        errorSources
    };
}