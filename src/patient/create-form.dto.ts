import { IsOptional, IsString } from 'class-validator';
import { GenderType } from 'src/patient/entity';

export class PatientFormDTO {
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
}
