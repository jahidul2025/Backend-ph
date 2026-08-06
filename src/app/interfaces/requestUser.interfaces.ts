import { Role } from "../../generated/client/enums";


export interface IRequestUser {
    userId: string;
    role: Role;
    email: string;
}