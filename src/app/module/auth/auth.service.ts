import status from "http-status";
import { UserStatus } from "../../../generated/client/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { tokenUtils } from "../../utils/token";

interface IRegisterPatientPayload {
    name: string,
    email: string,
    password: string
}

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

interface ILoginUserPayload {
    email: string,
    password: string,
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

export const AuthService = {
    registerPatient,
    loginUser
}