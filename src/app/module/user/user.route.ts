import { NextFunction, Request, Response, Router } from "express";
import { UserController } from "./user.controller";
import z from "zod";
import { Gender } from "../../../generated/client/enums";


const createDoctorZodSchema = z.object({

    password: z.string("password is required").min(6, "password must be at lest 6 characters").max(20, "password must be at most 20 characters"),

    doctor: z.object({
        name: z.string("name is required and must be string").min(3, "name must be at lest 3 characters").max(30, "name must be at most 30 characters"),

        email: z.string("email is required"),

        contactNumber: z.string("contact number is required").min(11, "contact number must be 11 digits").max(14, "contact number must be at most 14 digits"),

        address: z.string("address is required").min(10, "address must be at lest 10 characters").max(100, "address must be at most 100 characters").optional(),

        registrationNumber: z.string("registration number is required"),

        experience: z.number("experience is required").nonnegative("experience cannot be negative").optional(),

        gender: z.enum([Gender.MALE, Gender.FEMALE,], "Gender must be either male or female"),

        appointmentFee: z.number("appointment fee is required").nonnegative("appointment fee cannot be negative"),

        qualification: z.string("qualification is required").min(2, "Qualification must be at lest 2 characters").max(100, "Qualification must be at most 100 characters"),

        designation: z.string("designation is required").min(3, "designation must be at lest 3 characters").max(50, "designation must be at most 50 characters"),
        currentWorkingPlace: z.string().min(1, "Current working place is required")

    }),
    specialties: z.array(z.uuid("Specialties is required").min(1, "Specialties is required"))

})


const router = Router();

router.post("/create-doctor", (req: Request, res: Response, next: NextFunction) => {

    const parsedResult = createDoctorZodSchema.safeParse(req.body);

    if (!parsedResult.success) {
        next(parsedResult.error)
    }

    // sanitizing the data
    req.body = parsedResult.data;

    next();

}, UserController.createDoctor);
// router.post("/created-admin", UserController.createDoctor);
// router.post("/created-superadmin", UserController.createDoctor);

export const UserRoutes = router