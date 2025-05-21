import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { GenderType } from 'src/therapist/entity/Patient.entity';

export class PatientDTO {
    @IsString()
    @IsOptional()
    email: string;

    @IsBoolean()
    @IsOptional()
    isRegistered: boolean;

    @IsString()
    @IsOptional()
    firstName: string;

    @IsString()
    @IsOptional()
    lastName: string;

    @IsString()
    @IsOptional()
    phoneNumber: string;

    @IsString()
    @IsOptional()
    gender: GenderType;
}
