import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { tokenUtils } from "../../utils/token";
import AppError from "../../errorHelpers/AppError";
import { cookieUtils } from "../../utils/cookie";
import { envVars } from "../../../config/env";
import { auth } from "../../lib/auth";

const registerPatient = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const result = await AuthService.registerPatient(payload);

        const { accessToken, refreshToken, token, ...rest } = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, refreshToken);
        tokenUtils.setBetterAuthSessionCookie(res, token as string);

        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "Patient register successfully",
            data: {
                token,
                accessToken,
                refreshToken,
                ...rest
            }
        })
    }
)

const loginUser = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const result = await AuthService.loginUser(payload);
        const { accessToken, refreshToken, token, ...rest } = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, refreshToken);
        tokenUtils.setBetterAuthSessionCookie(res, token);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User logged in successfully",
            data: {
                token,
                accessToken,
                refreshToken,
                ...rest
            }
        })
    }
)

const getMe = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user
        const result = await AuthService.getMe(user)

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User profile fetched successfully",
            data: result
        })
    }
)

const getNewToken = catchAsync(
    async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken;
        const betterAuthSessionToken = req.cookies["better-auth-session-token"];

        if (!refreshToken) {
            throw new AppError("Refresh token is required", status.UNAUTHORIZED);
        }

        const result = await AuthService.getNewToken(refreshToken, betterAuthSessionToken);

        const { accessToken, refreshToken: newRefreshToken, sessionToken } = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
        tokenUtils.setBetterAuthSessionCookie(res, sessionToken);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "New token generated successfully",
            data: {
                accessToken,
                refreshToken: newRefreshToken,
                sessionToken
            }
        })

    }
)

const changePassword = catchAsync(
    async (req: Request, res: Response) => {
        const betterAuthSessionToken = req.cookies["better-auth.session_token"];
        const payload = req.body;

        const result = await AuthService.changePassword(payload, betterAuthSessionToken);
        const { accessToken, refreshToken, token } = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, refreshToken);
        tokenUtils.setBetterAuthSessionCookie(res, token as string);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Password changed successfully",
            data: result
        })
    }
)

const logoutUser = catchAsync(
    async (req: Request, res: Response) => {
        const betterAuthSessionToken = req.cookies["better-auth.session_token"];

        const result = await AuthService.logoutUser(betterAuthSessionToken);

        cookieUtils.clearCookie(res, "accessToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        })

        cookieUtils.clearCookie(res, "refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        })

        cookieUtils.clearCookie(res, "better-auth.session_token", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        })

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User logged out successfully",
            data: result
        })
    }
)

const verifyEmail = catchAsync(
    async (req: Request, res: Response) => {
        const { email, otp } = req.body;
        await AuthService.verifyEmail(email, otp);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Email verified successfully",
        })
    }
)

const forgetPassword = catchAsync(
    async (req: Request, res: Response) => {
        const { email } = req.body;
        await AuthService.forgetPassword(email);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Password reset email sent successfully",
        })
    }
)

const resetPassword = catchAsync(
    async (req: Request, res: Response) => {
        const { email, otp, newPassword } = req.body;
        await AuthService.resetPassword(email, otp, newPassword);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Password reset successfully",
        })
    }
)

const googleLogin = catchAsync(async (req: Request, res: Response) => {
    const redirectPath = req.query.redirect as string || "/dashboard";
    const isValidRedirectPath = redirectPath.startsWith("/") && !redirectPath.startsWith("//");
    const safeRedirectPath = isValidRedirectPath ? redirectPath : "/dashboard";
    const callbackURL = `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success?redirect=${encodeURIComponent(safeRedirectPath)}`;

    const result = await auth.api.signInSocial({
        body: {
            provider: "google",
            callbackURL,
        },
        headers: req.headers as Record<string, string>,
        asResponse: true,
    });

    const location = result.headers.get("location");

    if (!location) {
        throw new AppError(
            "Google authentication URL could not be generated",
            status.INTERNAL_SERVER_ERROR
        );
    }

    const getSetCookie = (result.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
    const cookies = getSetCookie ? getSetCookie.call(result.headers) : result.headers.get("set-cookie");

    if (cookies) {
        res.setHeader("Set-Cookie", cookies);
    }

    return res.redirect(location);
});

const googleLoginSuccess = catchAsync(async (req: Request, res: Response) => {
    const redirectPath = req.query.redirect as string || "/dashboard";
    const sessionToken = req.cookies["better-auth.session_token"];

    if (!sessionToken) {
        return res.redirect(`${envVars.FRONTEND_URL}/login?error=oauth_failed`);
    }

    const session = await auth.api.getSession({
        headers: {
            "Cookie": `better-auth.session_token=${sessionToken}`
        }
    })

    if (!session) {
        return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_session_found`);
    }

    if (session && !session.user) {
        return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_user_found`);
    }

    const result = await AuthService.googleLoginSuccess(session);

    const { accessToken, refreshToken } = result;

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);



    const isValidRedirectPath = redirectPath.startsWith("/") && !redirectPath.startsWith("//");
    const finalRedirectPath = isValidRedirectPath ? redirectPath : "/dashboard";

    res.redirect(`${envVars.FRONTEND_URL}${finalRedirectPath}`);


})

const handleOAuthError = catchAsync((req: Request, res: Response) => {
    const error = req.query.error as string || "oauth_failed";
    res.redirect(`${envVars.FRONTEND_URL}/login?error=${error}`);
})


export const AuthController = {
    registerPatient,
    loginUser,
    getMe,
    getNewToken,
    changePassword,
    logoutUser,
    verifyEmail,
    forgetPassword,
    resetPassword,
    googleLogin,
    googleLoginSuccess,
    handleOAuthError
}