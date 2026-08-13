import { Router } from "express";
import { multerUpload } from "../../../config/multer.config";
import { specialtyValidation } from "./specialty.validation";
import { validateRequest } from "../../middlewere/validateRequest";
import { specialtyController } from "./specialty.controller";
import { Role } from "../../../generated/client/enums";
import { checkAuth } from "../../middlewere/checkAuth";

const router = Router();

router.post('/',
    // checkAuth(Role.ADMIN, Role.SUPER_ADMIN), 
    multerUpload.single("file"),
    validateRequest(specialtyValidation.createSpecialtyZodSchema),
    specialtyController.createSpecialty);
router.get('/', specialtyController.getAllSpecialties);
router.delete('/:id', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), specialtyController.deleteSpecialty);

export const specialtyRoutes = router;