import { prisma } from "../../lib/prisma"

const getAllDoctor = async () => {
    const doctors = await prisma.doctor.findMany({
        include: {
            user: true,
            specialties: {
                include: {
                    specialty: true
                }
            }
        }
    })
    return doctors
}

export const DoctorService={
    getAllDoctor
}