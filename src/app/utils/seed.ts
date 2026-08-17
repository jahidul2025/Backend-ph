import { Role } from "../../generated/client/enums"
import { auth } from "../lib/auth"
import { prisma } from "../lib/prisma"

const seedSuperAdmin = async () => {
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
                email: "",
                password: "",
                name: "Super Admin",
                needPasswordChange: false,
                rememberMe: false
            }
        })


    } catch (error) {

    }
}