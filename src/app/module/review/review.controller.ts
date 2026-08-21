import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { ReviewService } from "./review.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";


const giveReview = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const user = req.user;


    const result = await ReviewService.giveReview(user, payload);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Review give successfully",
        data: result
    });
});