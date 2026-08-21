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

const getAllReview = catchAsync(async (req: Request, res: Response) => {
    const result = await ReviewService.getAllReview();
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Review get successfully",
        data: result
    });
});

const myReview = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await ReviewService.myReview(user);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Review get successfully",
        data: result
    });
})

const updateReview = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const user = req.user;
    const reviewId = req.params.reviewId;
    const result = await ReviewService.updateReview(user, reviewId as string, payload);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Review updated successfully",
        data: result
    });
})

const deleteReview = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const reviewId = req.params.reviewId;
    const result = await ReviewService.deleteReview(reviewId as string, user);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Review deleted successfully",
        data: result
    });
})

export const ReviewController = {
    giveReview,
    getAllReview,
    updateReview,
    deleteReview,
    myReview
};
