import { specialty } from "../../../generated/client/client";
import { prisma } from "../../lib/prisma";

const createSpecialty = async ( payload: specialty): Promise<specialty> => {
    const specialty = await prisma.specialty.create({
        data: payload
    })
    return specialty;
}

const getAllSpecialties = async (): Promise<specialty[]> => {
    const specialties = await prisma.specialty.findMany();
    return specialties;
}

const deleteSpecialty = async (id: string): Promise<specialty | null> => {
    const specialty = await prisma.specialty.delete({
        where: { id }
    })
    return specialty;
}

export const specialtyService ={
    createSpecialty,
    getAllSpecialties,
    deleteSpecialty
}
