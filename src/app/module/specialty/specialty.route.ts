import { Router } from "express";
import { specialtyController } from "./specialty.controller";
import { checkAuth } from "../../middlewere/checkAuth";
import { Role } from "../../../generated/client/enums";

const router = Router();

router.post("/", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), specialtyController.createSpecialty);
router.get("/", specialtyController.getAllSpecialties);
router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), specialtyController.deleteSpecialty);

export const specialtyRoutes = router;