import { envVars } from "../../config/env"
import { Role } from "../../generated/client/enums"
import { auth } from "../lib/auth"
import { prisma } from "../lib/prisma"

export const seedSuperAdmin = async () => {
    try {
        const isSuperAdminExists = await prisma.user.findFirst({
            where: {
                role: Role.SUPER_ADMIN
            }
        })

        if (isSuperAdminExists) {
            console.log("Super admin is already exist. Skipping seeding super admin")
            return
        }

        const superAdminUser = await auth.api.signUpEmail({
            body: {
                email: envVars.SUPER_ADMIN_EMAIL,
                password: envVars.SUPER_ADMIN_PASSWORD,
                name: "Super Admin",
                needPasswordChange: false,
                rememberMe: false
            }
        })

        await prisma.$transaction(async (tx) => {

            await tx.user.update({
                where: {
                    id: superAdminUser.user.id,
                },
                data: {
                    emailVerified: true,
                    role: Role.SUPER_ADMIN,
                }
            });

            await tx.admin.create({
                data: {
                    userId: superAdminUser.user.id,
                    name: "Super Admin",
                    email: envVars.SUPER_ADMIN_EMAIL
                }
            })
        })

        const superAdmin = await prisma.admin.findUnique({
            where: {
                email: envVars.SUPER_ADMIN_EMAIL
            },
            include: {
                user: true
            }
        })

        console.log("super admin created", superAdmin)
    } catch (error) {
        console.error("error in super admin seeding", error)
        await prisma.user.delete({
            where: {
                email: envVars.SUPER_ADMIN_EMAIL
            }
        })
    }
}