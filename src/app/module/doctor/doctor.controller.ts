import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import status from "http-status";
import { DoctorService } from "./doctor.service";
import { sendResponse } from "../../shared/sendResponse";

const getAllDoctors = catchAsync(
    async (req: Request, res: Response) => {

        const result = await DoctorService.getAllDoctor();

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Doctor fetched successfully",
            data: result,
        })
    }
)



export const DoctorController ={
    getAllDoctors
}