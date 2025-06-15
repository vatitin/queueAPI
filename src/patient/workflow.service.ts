import {
    Injectable,
} from '@nestjs/common';
import { TherapistCRUDService } from 'src/domain/therapist.crud.service';
import { PatientDTO } from './create.dto';
import { PatientCRUDService } from 'src/domain/patient.crud.service';
import { PatientFormDTO } from './create-form.dto';
import { KeycloakUserDTO } from 'src/keycloak-user.dto';
import { AssociationService } from 'src/domain/association.service';
import { StatusType } from 'src/association/entity';

@Injectable()
export class PatientWorkflowService {

    constructor(
        private readonly therapistCRUDService: TherapistCRUDService,  
        private readonly patientCRUDService: PatientCRUDService,
        private readonly associationService: AssociationService,
    ) {}

    async createPatient(patientFormDTO: PatientFormDTO, keycloakUser: KeycloakUserDTO) {
    const patient : PatientDTO = {
        ...patientFormDTO,
        keycloakId: keycloakUser.sub,
        email: keycloakUser.email,
    }
      return await this.patientCRUDService.createPatient(patient);
    }

    async hasLocalPatient(keycloakUser: KeycloakUserDTO) {
        return await this.patientCRUDService.existsByKeycloakId(keycloakUser.sub);
    }

    async getTherapist(therapistId: string) {
        return await this.therapistCRUDService.getTherapistById(therapistId);
    }

    async applyToTherapist(keycloakUser: KeycloakUserDTO, therapistId: string) {
        const therapist = await this.therapistCRUDService.getTherapistById(therapistId);
        const patient = await this.patientCRUDService.getPatientByKeycloakId(keycloakUser.sub);
        console.log('Applying to therapist', therapist, patient, StatusType.WAITING);
        return this.associationService.createAssociation(therapist, patient, StatusType.WAITING);
    }

    async getTherapistLocations(params: {
        lng: number;
        lat: number;
        distance: number;
    }) {
        return await  this.therapistCRUDService.getTherapistLocations(params);
    }
}
