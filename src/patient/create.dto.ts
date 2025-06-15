import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { GenderType } from 'src/patient/entity';
import { PatientFormDTO } from './create-form.dto';

export class PatientDTO extends PatientFormDTO {

    @IsUUID()
    keycloakId: string;

    @IsString()
    email: string;

}
