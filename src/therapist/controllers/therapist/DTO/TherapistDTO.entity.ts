import { IsNotEmpty, IsUUID } from 'class-validator';
import { TherapistFormDTO } from './TherapistFormDTO.entity';

export class TherapistDTO extends TherapistFormDTO {
    @IsUUID()
    @IsNotEmpty()
    KeycloakId: string;
}
