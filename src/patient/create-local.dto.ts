import { IsOptional, IsString } from 'class-validator';
import { PatientFormDTO } from './create-form.dto';

export class LocalPatientDTO extends PatientFormDTO {
    @IsOptional()
    @IsString()
    email: string;

    @IsOptional()
    firstName: string;

    @IsOptional()
    lastName: string;
}
