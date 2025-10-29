import { IsString, IsUUID } from 'class-validator';
import { PatientFormDTO } from './create-form.dto';

export class PatientDTO extends PatientFormDTO {
    @IsUUID()
    keycloakId: string;

    @IsString()
    email: string;
}
