import { Router } from "express";
import { specialtyRoutes } from "../module/specialty/specialty.route";
import { AuthRoutes } from "../module/auth/auth.route";

const router = Router();
router.use("/auth", AuthRoutes);
router.use("/specialties", specialtyRoutes);


export const indexRoutes = router;