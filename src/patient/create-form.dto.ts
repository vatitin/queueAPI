import { IsOptional, IsString } from 'class-validator';
import { GenderType } from 'src/patient/entity';

export class PatientFormDTO {
    @IsString()
    email: string;

    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsString()
    @IsOptional()
    phoneNumber: string;

    @IsString()
    @IsOptional()
    gender: GenderType;

    @IsString()
    @IsOptional()
    comment: string;
}
