import { Router } from "express";
import { specialtyRoutes } from "../module/specialty/specialty.route";

const router = Router();

router.use("/specialties", specialtyRoutes);


export const indexRoutes = router;