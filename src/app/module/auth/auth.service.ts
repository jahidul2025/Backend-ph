import status from "http-status";
import { UserStatus } from "../../../generated/client/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { tokenUtils } from "../../utils/token";
import { IRequestUser } from "../../interfaces/requestUser.interfaces";
import { jwtUtils } from "../../utils/jwt";
import { envVars } from "../../../config/env";
import { JwtPayload } from "jsonwebtoken";
import { IChangePasswordPayload, ILoginUserPayload, IRegisterPatientPayload } from "./auth.interface";



const registerPatient = async (payload: IRegisterPatientPayload) => {
    const { name, email, password } = payload

    const data = await auth.api.signUpEmail({
        body: {
            name,
            email,
            password,
            // defaultValue
            // needPasswordChange: false,
            // role: Role.PATIENT
        }
    })

    if (!data.user) {
        throw new AppError("Failed to register patient", status.BAD_REQUEST)
    }

    try {
        const patient = await prisma.$transaction(async (tx) => {

            const patientTx = await tx.patient.create({
                data: {
                    userId: data.user.id,
                    name: payload.name,
                    email: payload.email
                }
            })
            return patientTx
        })


        const accessToken = tokenUtils.getAccessToken({
            userId: data.user.id,
            role: data.user.role,
            name: data.user.name,
            email: data.user.email,
            status: data.user.status,
            isDeleted: data.user.isDeleted,
            emailVerified: data.user.emailVerified,

        })

        const refreshToken = tokenUtils.getRefreshToken({
            userId: data.user.id,
            role: data.user.role,
            name: data.user.name,
            email: data.user.email,
            status: data.user.status,
            isDeleted: data.user.isDeleted,
            emailVerified: data.user.emailVerified,
        })


        return {
            ...data,
            patient,
            accessToken,
            refreshToken
        }
    } catch (error) {
        console.log("transaction error", error);
        await prisma.user.delete({
            where: {
                id: data.user.id
            }
        });
        throw Error
    }
}



const loginUser = async (payload: ILoginUserPayload) => {
    const { email, password } = payload;
    const data = await auth.api.signInEmail({
        body: {
            email,
            password
        }
    })

    if (data.user.status === UserStatus.BLOCKED) {
        throw new AppError("user is blocked", status.FORBIDDEN)
    }

    if (data.user.status === UserStatus.DELETED) {
        throw new AppError("user is deleted", status.NOT_FOUND)
    }

    const accessToken = tokenUtils.getAccessToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,

    })

    const refreshToken = tokenUtils.getRefreshToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,
    })


    return {
        ...data,
        accessToken,
        refreshToken
    }
}

const getMe = async (user: IRequestUser) => {
    const isUserExists = await prisma.user.findUnique({
        where: {
            id: user.userId,
        },
        include: {
            patient: {
                include: {
                    appointments: true,
                    reviews: true,
                    prescriptions: true,
                    medicalReports: true,
                    patientHealthData: true,
                }
            },
            doctor: {
                include: {
                    specialties: true,
                    appointments: true,
                    reviews: true,
                    prescriptions: true,
                }
            },
            admin: true,
        }
    })

    if (!isUserExists) {
        throw new AppError("User not found", status.NOT_FOUND);
    }

    return isUserExists;
}

const getNewToken = async (refreshToken: string, sessionToken: string) => {


    const isSessionTokenExists = await prisma.session.findUnique({
        where: {
            token: sessionToken,
            expiresAt: {
                gt: new Date()
            }
        },
        include: {
            user: true
        }
    })

    if (!isSessionTokenExists) {
        throw new AppError("invalid session token", status.UNAUTHORIZED)
    }

    const verifiedRefreshToken = jwtUtils.verifyToken(refreshToken, envVars.REFRESH_TOKEN_SECRET)

    if (!verifiedRefreshToken.success && verifiedRefreshToken.error) {
        throw new AppError("invalid refresh token", status.UNAUTHORIZED)
    }

    const data = verifiedRefreshToken.data as JwtPayload;

    const NewAccessToken = tokenUtils.getAccessToken({
        userId: data.userId,
        role: data.role,
        name: data.name,
        email: data.email,
        status: data.status,
        isDeleted: data.isDeleted,
        emailVerified: data.emailVerified,

    })

    const NewRefreshToken = tokenUtils.getRefreshToken({
        userId: data.userId,
        role: data.role,
        name: data.name,
        email: data.email,
        status: data.status,
        isDeleted: data.isDeleted,
        emailVerified: data.emailVerified,
    })

    const { token } = await prisma.session.update({
        where: {
            token: sessionToken
        },
        data: {
            token: NewRefreshToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 60 * 1000),
            updatedAt: new Date()
        }
    })

    return {
        accessToken: NewAccessToken,
        refreshToken: NewRefreshToken,
        sessionToken: token
    }
}

const changePassword = async (payload: IChangePasswordPayload, sessionToken: string) => {
    const session = await auth.api.getSession({
        headers: {
            Authorization: `Bearer ${sessionToken}`
        }
    });

    if (!session) {
        throw new AppError("invalid session token", status.UNAUTHORIZED)
    }

    const { currentPassword, newPassword } = payload;

    const result = await auth.api.changePassword({
        body: {
            currentPassword,
            newPassword,
            revokeOtherSessions: true
        },
        headers: new Headers({
            Authorization: `Bearer ${sessionToken}`
        })
    })

    if(session.user.needPasswordChange) {
        await prisma.user.update({
        where: {
            id: session.user.id
        },
        data: {
            needPasswordChange: false
        }
    })
    }

    const accessToken = tokenUtils.getAccessToken({
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name,
        email: session.user.email,
        status: session.user.status,
        isDeleted: session.user.isDeleted,
        emailVerified: session.user.emailVerified,

    })

    const refreshToken = tokenUtils.getRefreshToken({
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name,
        email: session.user.email,
        status: session.user.status,
        isDeleted: session.user.isDeleted,
        emailVerified: session.user.emailVerified,
    })

    return {
        ...result,
        accessToken,
        refreshToken
    }
}

const logoutUser = async (sessionToken: string) => {
    const result = await auth.api.signOut({
        headers: new Headers({
            Authorization: `Bearer ${sessionToken}`
        })
    })
    return result;
}

const verifyEmail = async (email: string, otp: string) => {
    const result = await auth.api.verifyEmailOTP({
        body: {
            email,
            otp
        }
    })

    if (result.status && !result.user.emailVerified) {
        await prisma.user.update({
            where: {
                email: email
            },
            data: {
                emailVerified: true
            }
        })
    }
}

const forgetPassword = async (email: string) => {
    const isUserExists = await prisma.user.findUnique({
        where: {
            email: email
        }
    })
    if (!isUserExists) {
        throw new AppError("User not found", status.NOT_FOUND);
    }
    if (!isUserExists.emailVerified) {
        throw new AppError("Email is not verified", status.BAD_REQUEST);
    }
    if (isUserExists.isDeleted || isUserExists.status === UserStatus.DELETED) {
        throw new AppError("User is deleted", status.NOT_FOUND);
    }

    await auth.api.requestPasswordResetEmailOTP({
        body: {
            email
        }
    })
}

const resetPassword = async (email: string, otp: string, newPassword: string) => {

    const isUserExists = await prisma.user.findUnique({
        where: {
            email: email
        }
    })
    if (!isUserExists) {
        throw new AppError("User not found", status.NOT_FOUND);
    }
    if (!isUserExists.emailVerified) {
        throw new AppError("Email is not verified", status.BAD_REQUEST);
    }
    if (isUserExists.isDeleted || isUserExists.status === UserStatus.DELETED) {
        throw new AppError("User is deleted", status.NOT_FOUND);
    }

    await auth.api.resetPasswordEmailOTP({
        body: {
            email,
            otp,
            password : newPassword
        }
    })

    await prisma.session.deleteMany({
        where: {
            userId: isUserExists.id
        }   
    })
}


export const AuthService = {
    registerPatient,
    loginUser,
    getMe,
    getNewToken,
    changePassword,
    logoutUser,
    verifyEmail,
    forgetPassword,
    resetPassword
}