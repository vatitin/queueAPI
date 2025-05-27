import {
    Injectable,
} from '@nestjs/common';
import {
    Association,
    StatusType,
} from 'src/association/entity';
import { AssociationService } from 'src/domain/association.service';
import { PatientCRUDService } from '../domain/patient.crud.service';
import { PatientDTO } from './create.dto';
import { TherapistCRUDService } from 'src/domain/therapist.crud.service';

@Injectable()
export class PatientWorkflowService {

    constructor(

        private readonly associationService: AssociationService,  
        private readonly patientCRUDService: PatientCRUDService,
        private readonly therapistCRUDService: TherapistCRUDService,  

    ) {}

    getAllTherapistLocations() {
        return this.therapistCRUDService.findAllLocations();
    }
}
