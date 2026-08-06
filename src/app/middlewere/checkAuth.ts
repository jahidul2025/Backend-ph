/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import status from "http-status";
import AppError from "../errorHelpers/AppError";
import { prisma } from "../lib/prisma";

import { jwtUtils } from "../utils/jwt";
import { Role, UserStatus } from "../../generated/client/enums";
import { cookieUtils } from "../utils/cookie";
import { envVars } from "../../config/env";
import { IRequestUser } from "../interfaces/requestUser.interfaces";

export const checkAuth = (...authRoles: Role[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        //Session Token Verification
        const sessionToken = cookieUtils.getCookie(req, "better-auth.session_token");

        if (!sessionToken) {
            throw new AppError('Unauthorized access! No session token provided.', status.UNAUTHORIZED);
        }

        if (sessionToken) {
            const sessionExists = await prisma.session.findFirst({
                where: {
                    token: sessionToken,
                    expiresAt: {
                        gt: new Date(),
                    }
                },
                include: {
                    user: true,
                }
            })

            if (sessionExists && sessionExists.user) {
                const user = sessionExists.user;

                const now = new Date();
                const expiresAt = new Date(sessionExists.expiresAt)
                const createdAt = new Date(sessionExists.createdAt)

                const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
                const timeRemaining = expiresAt.getTime() - now.getTime();
                const percentRemaining = (timeRemaining / sessionLifeTime) * 100;

                if (percentRemaining < 20) {
                    res.setHeader('X-Session-Refresh', 'true');
                    res.setHeader('X-Session-Expires-At', expiresAt.toISOString());
                    res.setHeader('X-Time-Remaining', timeRemaining.toString());

                    console.log("Session Expiring Soon!!");
                }

                if (user.status === UserStatus.BLOCKED || user.status === UserStatus.DELETED) {
                    throw new AppError('Unauthorized access! User is not active.', status.UNAUTHORIZED,);
                }

                if (user.isDeleted) {
                    throw new AppError('Unauthorized access! User is deleted.', status.UNAUTHORIZED,);
                }

                if (authRoles.length > 0 && !authRoles.includes(user.role)) {
                    throw new AppError('Forbidden access! You do not have permission to access this resource.', status.FORBIDDEN,);
                }

                req.user = {
                    userId: user.id,
                    role: user.role,
                    email: user.email,
                } as IRequestUser;
            }

            const accessToken = cookieUtils.getCookie(req, 'accessToken');

            if (!accessToken) {
                throw new AppError('Unauthorized access! No access token provided.', status.UNAUTHORIZED);
            }


        }

        //Access Token Verification
        const accessToken = cookieUtils.getCookie(req, 'accessToken');

        if (!accessToken) {
            throw new AppError('Unauthorized access! No access token provided.', status.UNAUTHORIZED);
        }

        const verifiedToken = jwtUtils.verifyToken(accessToken, envVars.ACCESS_TOKEN_SECRET);

        if (!verifiedToken.success) {
            throw new AppError('Unauthorized access! Invalid access token.', status.UNAUTHORIZED);
        }

        if (authRoles.length > 0 && !authRoles.includes(verifiedToken.data!.role as Role)) {
            throw new AppError('Forbidden access! You do not have permission to access this resource.', status.FORBIDDEN);
        }

        req.user = {
            userId: verifiedToken.data!.userId as string,
            role: verifiedToken.data!.role as Role,
            email: verifiedToken.data!.email as string,
        } as IRequestUser;

        next()
    } catch (error: any) {
        next(error);
    }
};