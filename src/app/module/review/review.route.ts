import { Router } from "express";
import { ReviewController } from "./review.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/client/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { ReviewValidation } from "./review.validation";


const router = Router();

router.get("/", ReviewController.getAllReview)

router.post("/", checkAuth(Role.PATIENT), validateRequest(ReviewValidation.createReviewZodSchema), ReviewController.giveReview)

router.get("/my-review", checkAuth(Role.PATIENT, Role.DOCTOR), ReviewController.myReview)

router.patch("/:id", checkAuth(Role.PATIENT), validateRequest(ReviewValidation.updateReviewZodSchema), ReviewController.updateReview)

router.delete("/:id", checkAuth(Role.PATIENT), ReviewController.deleteReview)

export const ReviewRoute = router;