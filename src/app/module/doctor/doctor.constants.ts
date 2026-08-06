// Fields that can be searched via ?searchTerm= query parameter
// Supports dot notation for nested relations (e.g., 'user.name' searches the related user's name)
export const doctorSearchableFields: string[] = [
    'name',
    'email',
    'contactNumber',
    'address',
    'qualification',
    'designation',
    'currentWorkingPlace',
    'registrationNumber',
    'user.name',
    'user.email',
    'specialties.specialty.title',
    'specialties.specialty.description',
];

// Fields that can be used as direct filters via query params (e.g., ?gender=MALE&appointmentFee[lt]=100)
export const doctorFilterableFields: string[] = [
    'gender',
    'appointmentFee',
    'experience',
    'qualification',
    'designation',
    'currentWorkingPlace',
    'specialties.specialty.title',
];

// Prisma include configurations available for dynamic ?include= query param
// e.g., ?include=appointments,reviews will include those relations in the response
export const doctorIncludeConfig: Record<string, unknown> = {
    user: true,
    specialties: {
        include: {
            specialty: true,
        },
    },
    appointments: {
        include: {
            patient: true,
            schedule: true,
            prescription: true,
        },
    },
    doctorSchedules: {
        include: {
            schedule: true,
        },
    },
    reviews: true,
};
