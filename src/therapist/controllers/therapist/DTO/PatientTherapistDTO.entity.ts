import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { Patient } from 'src/therapist/entity/Patient.entity';
import { StatusType } from 'src/therapist/entity/PatientTherapist.entity';
import { Therapist } from 'src/therapist/entity/Therapist.entity';

export class PatientTherapistDTO {
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
