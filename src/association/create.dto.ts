import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
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

    @IsString()
    applicationText?: string;

    @IsString()
    comment?: string;

    @IsOptional()
    @IsDateString()
    lastStatusChange?: Date;
}
