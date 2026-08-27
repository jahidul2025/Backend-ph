import express from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/client/enums";
import { statsController } from "./stats.controller";


const router = express.Router();


router.get("/", checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.DOCTOR, Role.PATIENT),
    statsController.getDashboardStatsData
);




export const statsRoutes = router;