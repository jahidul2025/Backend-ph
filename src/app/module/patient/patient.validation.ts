import z from "zod";
import { BloodGroup, Gender } from "../../../generated/client/enums";


const updatePatientProfileZodSchema = z.object({
    patientInfo: z.object({
        name: z.string("name must be a string").min(1, "name must be at least 1 character").max(20, "name must be at most 20 characters").optional(),
        profilePhoto: z.url("profilePhoto must be a string").optional(),
        contactNumber: z.string("phone must be a string").min(11, "phone must be at least 11 characters").max(20, "phone must be at most 20 characters").optional(),
        address: z.string("address must be a string").min(1, "address can not be empty").max(200, "address must be less then 200 characters").optional(),
    }).optional(),
    patientHealthData: z.object({
        gender: z.enum([Gender.FEMALE, Gender.MALE]).optional(),
        dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid date format", }).optional(),
        bloodGroup: z.enum([BloodGroup.A_POSITIVE, BloodGroup.A_NEGATIVE, BloodGroup.B_POSITIVE, BloodGroup.B_NEGATIVE, BloodGroup.AB_POSITIVE, BloodGroup.AB_NEGATIVE, BloodGroup.O_POSITIVE, BloodGroup.O_NEGATIVE]).optional(),
        hasAllergies: z.boolean().optional(),
        hasDiabetes: z.boolean().optional(),
        height: z.string().optional(),
        weight: z.string().optional(),
        smokingStatus: z.boolean().optional(),
        dietaryPreferences: z.string().optional(),
        pregnancyStatus: z.boolean().optional(),
        mentalHealthHistory: z.string().optional(),
        immunizationStatus: z.string().optional(),
        hasPastSurgeries: z.boolean().optional(),
        recentAnxiety: z.boolean().optional(),
        recentDepression: z.boolean().optional(),
        maritalStatus: z.string().optional(),
    }).optional(),
    medicalReports: z.array(z.object({})).optional()
})