import { IsOptional, IsString } from 'class-validator';
import { PatientFormDTO } from './create-form.dto';

export class LocalPatientDTO extends PatientFormDTO {
    @IsOptional()
    @IsString()
    email: string;

    @IsOptional()
    @IsString()
    firstName: string;

    @IsOptional()
    @IsString()
    lastName: string;

    @IsString()
    @IsOptional()
    comment: string;
}
