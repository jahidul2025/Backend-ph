import { Router } from "express";

import { AdminController } from "./admin.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/client/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { updateAdminZodSchema } from "./admin.validation";


const router = Router();

router.get("/",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    AdminController.getAllAdmins);
router.get("/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    AdminController.getAdminById);
router.patch("/:id",
    checkAuth(Role.SUPER_ADMIN),
    validateRequest(updateAdminZodSchema),
    AdminController.updateAdmin);
router.delete("/:id",
    checkAuth(Role.SUPER_ADMIN),
    AdminController.deleteAdmin);
router.patch("/change-user-status",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    AdminController.changeUserStatus);

router.patch("/change-user-role",
    checkAuth(Role.SUPER_ADMIN),
    AdminController.changeUserRole);

export const AdminRoutes = router;