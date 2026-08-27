import status from "http-status";
import { Role } from "../../../generated/client/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interfaces";
import { prisma } from "../../lib/prisma";


const getDashboardStatsData = async (user: IRequestUser) => {


    let statsData;

    switch (user.role) {
        case Role.SUPER_ADMIN:
            statsData = await getSuperAdminStatsData();
            break;

        case Role.ADMIN:
            statsData = await getAdminStatsData();
            break;

        case Role.DOCTOR:
            statsData = await getDoctorStatsData(user)
            break;

        case Role.PATIENT:
            statsData = await getPatientStatsData(user)
            break;

        default:
            throw new AppError("Invalid role", status.BAD_REQUEST)
    }

    return statsData;
};

const getSuperAdminStatsData = async () => {

    const appointmentCount = await prisma.appointment.count();
    const patientCount = await prisma.patient.count();
    const doctorCount = await prisma.doctor.count();
    const superAdminCount = await prisma.admin.count({
        where: {
            user: {
                role: Role.SUPER_ADMIN
            }
        }
    })
    const adminCount = await prisma.admin.count();
    const userCount = await prisma.user.count();

    const pieChartData = await getPieChartsData()
    const barChartData = await getBarChartData()

    return {
        appointmentCount,
        patientCount,
        doctorCount,
        superAdminCount,
        adminCount,
        userCount,
        pieChartData,
        barChartData
    }


};

const getAdminStatsData = async () => {
    const appointmentCount = await prisma.appointment.count();
    const doctorCount = await prisma.doctor.count();
    const patientCount = await prisma.patient.count();
    const adminCount = await prisma.admin.count();
    const userCount = await prisma.user.count();

    const pieChartData = await getPieChartsData()
    const barChartData = await getBarChartData()

    return {
        appointmentCount,
        doctorCount,
        patientCount,
        adminCount,
        userCount,
        pieChartData,
        barChartData
    }

};

const getDoctorStatsData = async (user: IRequestUser) => {

    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            email: user.email
        }
    })

    const reviewCount = await prisma.review.count({
        where: {
            doctorId: doctorData.id
        }
    })

    const patientCount = await prisma.appointment.groupBy({
        by: ['patientId'],
        _count: true,
        where: {
            doctorId: doctorData.id
        }

    })

    const appointmentCount = await prisma.appointment.count({
        where: {
            doctorId: doctorData.id
        }
    })

    const appointmentsStatusDistribution = await prisma.appointment.groupBy({
        by: ['status'],
        _count: {
            id: true
        },
        where: {
            doctorId: doctorData.id
        }
    })


    const formattedAppointmentsStatusDistribution = appointmentsStatusDistribution.map(({ _count, status }) => ({
        status,
        count: _count.id
    }))

    return {
        reviewCount,
        patientCount: patientCount.length,
        appointmentCount,
        appointmentsStatusDistribution: formattedAppointmentsStatusDistribution
    }

};

const getPatientStatsData = async (user: IRequestUser) => {

    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email
        }
    })

    const appointmentCount = await prisma.appointment.count({
        where: {
            patientId: patientData.id
        }
    })

    const reviewCount = await prisma.review.count({
        where: {
            patientId: patientData.id
        }
    })

    const appointmentsStatusDistribution = await prisma.appointment.groupBy({
        by: ['status'],
        _count: {
            id: true
        },
        where: {
            patientId: patientData.id
        }
    })

    const formattedAppointmentsStatusDistribution = appointmentsStatusDistribution.map(({ _count, status }) => ({
        status,
        count: _count.id
    }))

    return {
        appointmentCount,
        reviewCount,
        appointmentsStatusDistribution: formattedAppointmentsStatusDistribution
    }

};


const getPieChartsData = async () => {
    const appointmentStatusDistribution = await prisma.appointment.groupBy({
        by: ['status'],
        _count: {
            id: true
        }
    })

    const formattedAppointmentStatusDistribution = appointmentStatusDistribution.map(({ _count, status }) => ({
        status,
        count: _count.id
    }))

    return formattedAppointmentStatusDistribution;
}

const getBarChartData = async () => {
    interface AppointmentCountByMonth {
        month: Date;
        count: bigint;
    }

    const appointmentCountByMonth: AppointmentCountByMonth[] = await prisma.$queryRaw`
    
    SELECT 
        DATE_TRUNC('month', "createdAt") as month, 
        CAST(COUNT(*) AS INTEGER) as count
        FROM "appointments"
        GROUP BY month
        ORDER BY month ASC;
   
    `

    return appointmentCountByMonth

}


export const statsService = {
    getDashboardStatsData,
}