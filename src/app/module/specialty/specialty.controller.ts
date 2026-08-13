/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { specialtyService } from "./specialty.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { uploadFileToCloudinary } from "../../../config/cloudinary.config";



const createSpecialty = catchAsync(
    async (req: Request, res: Response) => {
        console.log(req.body, "body");

        let iconUrl: string | undefined;

        if (req.file?.buffer) {
            const uploadResult = await uploadFileToCloudinary(req.file.buffer, req.file.originalname);
            iconUrl = uploadResult.secure_url;
        }

        const payload = {
            ...req.body,
            icon: iconUrl
        };

        const result = await specialtyService.createSpecialty(payload);
        sendResponse(res, {
            httpStatusCode: 201,
            success: true,
            message: 'Specialty created successfully',
            data: result
        });
    }
);

const getAllSpecialties = catchAsync(
    async (req: Request, res: Response) => {
        const result = await specialtyService.getAllSpecialties();
        sendResponse(res, {
            httpStatusCode: 200,
            success: true,
            message: 'Specialties fetched successfully',
            data: result
        });
    }
);

const deleteSpecialty = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await specialtyService.deleteSpecialty(id as string);
        sendResponse(res, {
            httpStatusCode: 200,
            success: true,
            message: 'Specialty deleted successfully',
            data: result
        });
    }
);

export const specialtyController = {
    createSpecialty,
    getAllSpecialties,
    deleteSpecialty
}