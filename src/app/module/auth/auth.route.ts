import { Router } from "express";
import { AuthController } from "./auth.controller";
import { checkAuth } from "../../middlewere/checkAuth";
import { Role } from "../../../generated/client/enums";

const router = Router();
router.post("/register", AuthController.registerPatient);
router.post("/login", AuthController.loginUser);
router.get("/me", checkAuth(Role.ADMIN, Role.PATIENT, Role.DOCTOR, Role.SUPER_ADMIN), AuthController.getMe)
router.post("/refresh-token", AuthController.getNewToken)

export const AuthRoutes = router;