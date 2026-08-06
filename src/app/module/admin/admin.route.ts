import { Router } from "express";

import { AdminController } from "./admin.controller";
import { checkAuth } from "../../middlewere/checkAuth";
import { Role } from "../../../generated/client/enums";
import { validateRequest } from "../../middlewere/validateRequest";
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

export const AdminRoutes = router;