import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { Role, UserStatus } from "../../generated/client/enums";
import { bearer, emailOTP } from "better-auth/plugins";
import { sendEmail } from "../utils/email";



// If your Prisma file is located elsewhere, you can change the path


export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: Role.PATIENT
      },

      status: {
        type: "string",
        required: true,
        defaultValue: UserStatus.ACTIVE
      },

      needPasswordChange: {
        type: "boolean",
        required: true,
        defaultValue: false
      },
      isDeleted: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },

      deletedAt: {
        type: "date",
        required: false,
        defaultValue: null
      }

    }
  },

  plugins: [
    bearer(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          // Implementation for sending email verification OTP
          const user = await prisma.user.findUnique({
            where: {
              email: email
            }
          });
          // Use the 'user' object to access user-specific information if needed
          if (user && !user.emailVerified) {
            sendEmail({
              to: email,
              subject: "verify your email",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp: otp
              }
            })
          }
        } else if (type === "forget-password") {
          const user = await prisma.user.findUnique({
            where: {
              email: email
            }
          });
          if (user) {
            sendEmail({
              to: email,
              subject: "password reset OTP",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp,
              }
            });
          }
        }
      },
      expiresIn: 2 * 60, // 2 minutes
      otpLength: 6, // 6 digits
    })
  ],

  session: {

    expiresIn: 60 * 60 * 60 * 24,// 1 day
    updateAge: 60 * 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 60 * 24, // 1 day
    }
  },

  // trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:5000 "],
  // advanced: {
  //   disableCSRFCheck: true
  // }

});