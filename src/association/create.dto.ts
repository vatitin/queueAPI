import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { Patient } from 'src/patient/entity';
import { Therapist } from 'src/therapist/entity';
import { StatusType } from './entity';

export class AssociationDTO {
    @IsUUID()
    patient: Patient;

    @IsUUID()
    therapist: Therapist;

    @IsEnum(StatusType)
    status: StatusType;

    @IsOptional()
    @IsDateString()
    lastStatusChange?: Date;
}
