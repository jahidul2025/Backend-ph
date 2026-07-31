import { Router } from "express";
import { specialtyRoutes } from "../module/specialty/specialty.route";
import { AuthRoutes } from "../module/auth/auth.route";
import { UserRoutes } from "../module/user/user.route";
import { DoctorRoutes } from "../module/doctor/doctor.route";

const router = Router();
router.use("/auth", AuthRoutes);
router.use("/specialties", specialtyRoutes);
router.use("/users", UserRoutes);
router.use("/doctors", DoctorRoutes)


export const indexRoutes = router;