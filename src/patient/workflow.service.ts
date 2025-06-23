import { Injectable } from '@nestjs/common';
import { StatusType } from 'src/association/entity';
import { AssociationService } from 'src/domain/association.service';
import { PatientCRUDService } from 'src/domain/patient.crud.service';
import { TherapistCRUDService } from 'src/domain/therapist.crud.service';
import { KeycloakUserDTO } from 'src/keycloak-user.dto';
import { PatientFormDTO } from './create-form.dto';
import { PatientDTO } from './create.dto';
import { AssociationDTO } from 'src/association/create.dto';

@Injectable()
export class PatientWorkflowService {
    constructor(
        private readonly therapistCRUDService: TherapistCRUDService,
        private readonly patientCRUDService: PatientCRUDService,
        private readonly associationService: AssociationService,
    ) {}

    async createPatient(
        patientFormDTO: PatientFormDTO,
        keycloakUser: KeycloakUserDTO,
    ) {
        const patient: PatientDTO = {
            ...patientFormDTO,
            keycloakId: keycloakUser.sub,
            email: keycloakUser.email,
        };
        return await this.patientCRUDService.createPatient(patient);
    }

    async hasLocalPatient(keycloakUser: KeycloakUserDTO) {
        return await this.patientCRUDService.existsByKeycloakId(
            keycloakUser.sub,
        );
    }

    async getTherapist(therapistId: string) {
        return await this.therapistCRUDService.getTherapistById(therapistId);
    }

    async getProfile(keycloakUser: KeycloakUserDTO) {
        return await this.patientCRUDService.getPatientByKeycloakId(
            keycloakUser.sub,
        );
    }

    async applyToTherapist(keycloakUser: KeycloakUserDTO, therapistId: string, applicationText: string) {
        const therapist = await this.therapistCRUDService.getTherapistById(therapistId);
        const patient = await this.patientCRUDService.getPatientByKeycloakId(keycloakUser.sub);

        console.log(
            'Applying to therapist',
            therapist,
            patient,
            StatusType.WAITING,
        );

        const association: AssociationDTO = {
            therapist,
            patient,
            status: StatusType.WAITING,
            applicationText
        }
        return this.associationService.createAssociation(
            association
        );
    }

    async getTherapistLocations(params: {
        lng: number;
        lat: number;
        distance: number;
    }) {
        return await this.therapistCRUDService.getTherapistLocations(params);
    }
}
