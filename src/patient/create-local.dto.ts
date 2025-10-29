import { IsString } from 'class-validator';
import { PatientFormDTO } from './create-form.dto';
import { PartialType } from '@nestjs/mapped-types';

export class LocalPatientDTO extends PartialType(PatientFormDTO) {
    @IsString()
    email: string;
}
