/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { envVars } from "../../config/env";
import status from "http-status";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if(envVars.NODE_ENV === 'development'){
        console.log("error from global error handler", err)
    }

    const statusCode: number = status.INTERNAL_SERVER_ERROR;
    const message: string= "internal server error"


    res.status(statusCode).json({
        success: false,
        message: message,
        error: err.message
    })

} 