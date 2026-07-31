import { Router } from "express";
import { UserController } from "./user.controller";

const router = Router();

router.post("/create-doctor", UserController.createDoctor);
router.post("/create-doctor/", UserController.createDoctor);
// router.post("/created-admin", UserController.createDoctor);
// router.post("/created-superadmin", UserController.createDoctor);

export const UserRoutes = router