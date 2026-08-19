import { PatientHealthData, MedicalReport } from './../../../generated/client/browser';
import { BloodGroup, Gender } from './../../../generated/client/enums';
export interface IUpdatePatientInfoPayload {
    name: string
    profile: string
    phone: string
    address: string
}

export interface IUpdatePatientHealthDataPayload {
    gender: Gender;
    dateOfBirth: Date;
    bloodGroup: BloodGroup;
    hasAllergies: boolean;
    hasDiabetes: boolean;
    height: string;
    weight: string;
    smokingStatus: boolean;
    dietaryPreferences: string;
    pregnancyStatus: boolean;
    mentalHealthHistory: string;
    immunizationStatus: string;
    hasPastSurgeries: boolean;
    recentAnxiety: boolean;
    recentDepression: boolean;
    maritalStatus: string;
}

export interface IUpdatePatientMedicalReportPayload {
    reportName: string;
    reportLink: string;
    shouldDelete: boolean;
    reportId: string;
}

export interface IUpdatePatientProfilePayload {
    patientInfo: IUpdatePatientInfoPayload;
    patientHealthData: IUpdatePatientHealthDataPayload;
    medicalReports: IUpdatePatientMedicalReportPayload[];
}