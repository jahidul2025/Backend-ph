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
    medicalReports: z.array(z.object({
        shouldDeleted: z.boolean().optional(),
        reportId: z.uuid().optional(),
        reportName: z.string().optional(),
        reportLink: z.url().optional()
    })).optional().refine((reports) => {
        if (!reports || reports.length === 0) return true;

        for (const report of reports) {
            // case-1
            if (report.shouldDeleted === true && report.reportId) {
                return false
            }
            // case-2
            if (report.reportId && !report.shouldDeleted) {
                return false
            }
            // case-3
            if (report.reportName && !report.reportLink) {
                return false
            }
            // case-4
            if (report.reportLink && !report.reportName) {
                return false
            }
            return true
        }
    }, {
        message: "invalid medical reports data. if should deleted is true then reportId must be present and if reportId is present then should deleted must be false and similarly for reportName and reportLink"
    })
})

export const PatientValidation = {
    updatePatientProfileZodSchema
}