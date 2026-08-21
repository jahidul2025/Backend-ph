import status from "http-status";
import { PaymentStatus } from "../../../generated/client/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interfaces";
import { prisma } from "../../lib/prisma";
import { ICreateReviewPayload } from "./review.interface";


const giveReview = async (user: IRequestUser, payload: ICreateReviewPayload) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email
        }
    })

    const appointmentData = await prisma.appointment.findUniqueOrThrow({
        where: {
            id: payload.appointmentId
        }
    })

    if (appointmentData.paymentStatus !== PaymentStatus.PAID) {
        throw new AppError("you can review after payment successfully !", status.BAD_REQUEST)
    }
    if (appointmentData.patientId !== patientData.id) {
        throw new AppError("you can not review someone else appointment", status.BAD_REQUEST)
    }

    const isReviewed = await prisma.review.findUnique({
        where: {
            appointmentId: appointmentData.id
        }
    })

    if (isReviewed) {
        throw new AppError("you already reviewed ", status.BAD_REQUEST)
    }

    const result = await prisma.$transaction(async (tx) => {
        const review = await tx.review.create({
            data: {
                ...payload,
                patientId: appointmentData.patientId,
                doctorId: appointmentData.doctorId,
            }
        });
        const averageRating = await tx.review.aggregate({
            where: {
                doctorId: appointmentData.doctorId
            },
            _avg: {
                rating: true
            }
        });

        await tx.doctor.update({
            where: {
                id: appointmentData.doctorId
            },
            data: {
                averageRating: averageRating._avg.rating as number
            }
        })

        return review

    })
    return result;
};

const getAllReview = async () => {

};

const myReview = async () => {

};

const updateReview = async () => {

};

export const ReviewService = {
    giveReview,
    getAllReview,
    myReview,
    updateReview,
};