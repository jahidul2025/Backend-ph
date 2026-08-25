import { status } from 'http-status';
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { statsService } from './stats.service';

const getDashboardStatsData = catchAsync(async (req: Request, res: Response) => {
    const result = await statsService.getDashboardStatsData;

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Dashboard stats data retrieved successfully",
        data: result
    })
})




export const statsController = {
    getDashboardStatsData
}
