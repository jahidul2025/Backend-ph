import { Review } from './../../../generated/client/browser';
import status from "http-status";
import { PaymentStatus, Role } from "../../../generated/client/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interfaces";
import { prisma } from "../../lib/prisma";
import { ICreateReviewPayload, IUpdateReviewPayload } from "./review.interface";


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
    const result = await prisma.review.findMany({
        include: {
            doctor: true,
            patient: true,
            appointment: true
        }
    })
    return result;
};

const myReview = async (user: IRequestUser) => {
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: user.email
        }
    })
    if (!userData) {
        throw new AppError("User not found", status.NOT_FOUND)
    }

    if (userData.role === Role.DOCTOR) {
        const doctorData = await prisma.doctor.findUniqueOrThrow({
            where: {
                email: userData.email
            }
        });

        return await prisma.review.findMany({
            where: {
                doctorId: doctorData.id
            },
            include: {
                patient: true,
                appointment: true
            }
        });
    }

    if (userData.role === Role.PATIENT) {
        const patientData = await prisma.patient.findUniqueOrThrow({
            where: {
                email: userData.email
            }
        });

        return await prisma.review.findMany({
            where: {
                patientId: patientData.id
            },
            include: {
                doctor: true,
                appointment: true
            }
        });
    }
};

const updateReview = async (user: IRequestUser, reviewId: string, payload: IUpdateReviewPayload) => {
    const patientData = await prisma.patient.findFirstOrThrow({
        where: {
            email: user?.email
        }
    })
    const reviewData = await prisma.review.findUniqueOrThrow({
        where: {
            id: reviewId
        }
    })
    if (patientData.id !== reviewData.patientId) {
        throw new AppError("you can not update someone else review", status.BAD_REQUEST)
    }

    const result = await prisma.$transaction(async (tx) => {
        const updateReview = await tx.review.update({
            where: {
                id: reviewId
            },
            data: {
                ...payload
            }
        })

        const averageRating = await tx.review.aggregate({
            where: {
                doctorId: reviewData.doctorId
            },
            _avg: {
                rating: true
            }
        });

        await tx.doctor.update({
            where: {
                id: reviewData.doctorId
            },
            data: {
                averageRating: averageRating._avg.rating as number
            }
        })

        return updateReview;
    })
    return result;

};

const deleteReview = async (reviewId: string, user: IRequestUser) => {
    const reviewData = await prisma.review.findUniqueOrThrow({
        where: {
            id: reviewId
        }
    })
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user?.email
        }
    })

    if (patientData.id !== reviewData.patientId) {
        throw new AppError("you can not deleted someone else's review", status.BAD_REQUEST)
    }

    const result = await prisma.$transaction(async (tx) => {
        const deletedReview = await tx.review.delete({
            where: {
                id: reviewId
            }
        })
        const averageRating = await prisma.review.aggregate({
            where: {
                doctorId: reviewData.doctorId
            },
            _avg: {
                rating: true
            }
        })
        await tx.doctor.update({
            where: {
                id: reviewData.doctorId
            },
            data: {
                averageRating: averageRating._avg.rating as number
            }
        })
        return deletedReview
    })

    return result;
}

export const ReviewService = {
    giveReview,
    getAllReview,
    myReview,
    updateReview,
    deleteReview
};