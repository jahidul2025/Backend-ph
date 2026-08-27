import { notFound } from './../../middleware/notFound';
import { User } from './../../../generated/client/client';
import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { Role, UserStatus } from "../../../generated/client/enums";
import { IRequestUser } from "../../interfaces/requestUser.interfaces";
import { IChangeUserRolePayload, IChangeUserStatusPayload, IUpdateAdminPayload } from "./admin.interface";

const getAllAdmins = async () => {
    const admins = await prisma.admin.findMany({
        include: {
            user: true,
        }
    })
    return admins;
}

const getAdminById = async (id: string) => {
    const admin = await prisma.admin.findUnique({
        where: {
            id,
        },
        include: {
            user: true,
        }
    })
    return admin;
}

const updateAdmin = async (id: string, payload: IUpdateAdminPayload) => {
    //TODO: Validate who is updating the admin user. Only super admin can update admin user and only super admin can update super admin user but admin user cannot update super admin user

    const isAdminExist = await prisma.admin.findUnique({
        where: {
            id,
        }
    })

    if (!isAdminExist) {
        throw new AppError("Admin Or Super Admin not found", status.NOT_FOUND);
    }

    const { admin } = payload;

    const updatedAdmin = await prisma.admin.update({
        where: {
            id,
        },
        data: {
            ...admin,
        }
    })

    return updatedAdmin;
}

//soft delete admin user by setting isDeleted to true and also delete the user session and account
const deleteAdmin = async (id: string, user: IRequestUser) => {
    //TODO: Validate who is deleting the admin user. Only super admin can delete admin user and only super admin can delete super admin user but admin user cannot delete super admin user

    const isAdminExist = await prisma.admin.findUnique({
        where: {
            id,
        }
    })

    if (!isAdminExist) {
        throw new AppError("Admin Or Super Admin not found", status.NOT_FOUND);
    }

    if (isAdminExist.id === user.userId) {
        throw new AppError("You cannot delete yourself", status.BAD_REQUEST);
    }

    const result = await prisma.$transaction(async (tx) => {
        await tx.admin.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        })

        await tx.user.update({
            where: { id: isAdminExist.userId },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                status: UserStatus.DELETED // Optional: you may also want to block the user
            },
        })

        await tx.session.deleteMany({
            where: { userId: isAdminExist.userId }
        })

        await tx.account.deleteMany({
            where: { userId: isAdminExist.userId }
        })

        const admin = await getAdminById(id);

        return admin;
    }
    )

    return result;
}

const changeUserStatus = async (user: IRequestUser, payload: IChangeUserStatusPayload) => {
    const { userId, status: userStatus } = payload;

    const isUserExists = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId,
        },
    })

    const userToChangeStatus = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId,
        },
    })

    const selfStatusChange = isUserExists?.id === user.userId;
    if (selfStatusChange) {
        throw new AppError("You cannot change your own status", status.BAD_REQUEST);
    }

    if (isUserExists.role === Role.ADMIN && userToChangeStatus.role === Role.SUPER_ADMIN) {
        throw new AppError("You cannot change super admin status", status.BAD_REQUEST);
    }

    if (isUserExists.role === Role.ADMIN && userToChangeStatus.role === Role.ADMIN) {
        throw new AppError("You cannot change other admin status", status.BAD_REQUEST);
    }

    if (userStatus === UserStatus.DELETED) {
        throw new AppError("You cannot change user to deleted status", status.BAD_REQUEST);
    }

    const updatedUser = await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            status: userStatus,
        },
    });

    return updatedUser;
}

const changeUserRole = async (user: IRequestUser, payload: IChangeUserRolePayload) => {
    const isSuperAdminExist = await prisma.user.findUniqueOrThrow({
        where: {
            email: user.email,
            role: Role.SUPER_ADMIN,
        }
    });

    if (!isSuperAdminExist) {
        throw new AppError("Super admin not found", status.NOT_FOUND);
    }

    const { userId, role } = payload;

    const userToChangeRole = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId,
        },
    })

    const selfRoleChange = isSuperAdminExist.id === userId;
    if (selfRoleChange) {
        throw new AppError("You cannot change your own role", status.BAD_REQUEST);
    }

    if (userToChangeRole.role === Role.DOCTOR || userToChangeRole.role === Role.PATIENT) {
        throw new AppError("You cannot change doctor or patient role", status.BAD_REQUEST);
    }

    const updatedUser = await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            role: role,
        },
    });

    return updatedUser;
}

export const AdminService = {
    getAllAdmins,
    getAdminById,
    updateAdmin,
    deleteAdmin,
    changeUserStatus,
    changeUserRole
}