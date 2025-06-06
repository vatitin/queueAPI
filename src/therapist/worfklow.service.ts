import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Therapist } from 'src/therapist/entity';
import { Repository } from 'typeorm';
import { TherapistFormDTO } from 'src/therapist/TherapistFormDTO.entity';
import { TherapistDTO } from 'src/therapist/create.dto';
import { TherapistCRUDService } from '../domain/therapist.crud.service';
import { PatientDTO } from 'src/patient/create.dto';
import { PatientCRUDService } from 'src/domain/patient.crud.service';
import { AssociationService } from 'src/domain/association.service';
import { Association, StatusType } from 'src/association/entity';

@Injectable()
export class TherapistWorkflowService {

    constructor(
        @InjectRepository(Therapist)
        private readonly therapistRepository: Repository<Therapist>,

        private readonly therapistCRUDService: TherapistCRUDService,
        private readonly patientCRUDService: PatientCRUDService,
        private readonly associationService: AssociationService

    ) {}

    async hasLocalTherapist(keycloakUser: KeycloakUser) {
        const { sub } = keycloakUser;
        const therapist = await this.therapistRepository.findOne({
            where: { keycloakId: sub },
        });

        if (!therapist) return false;
        return true;
    }

    async createTherapist(
        keycloakUser: KeycloakUser,
        therapistFormDTO: TherapistFormDTO,
    ) {
        if(await this.hasLocalTherapist(keycloakUser)) {
            throw new BadRequestException(
                'Therapist already exists for this user',
            );
        }
        const { sub } = keycloakUser;
        const therapistDTO: TherapistDTO = {
            keycloakId: sub,
            firstName: therapistFormDTO.firstName,
            lastName: therapistFormDTO.lastName,
            addressLine1: therapistFormDTO.addressLine1,
            addressLine2: therapistFormDTO.addressLine2,
            city: therapistFormDTO.city,
            postalCode: therapistFormDTO.postalCode,
            location: therapistFormDTO.location
        }
        const therapist = await this.therapistCRUDService.create(therapistDTO);
        return therapist;
    }

    async getProfile(keycloakUser: KeycloakUser) {
        if (!keycloakUser)
            throw new BadRequestException('Therapist could not be found');
        //todo not working yet
        const { family_name, given_name, email } = keycloakUser;
        const profile = { family_name, given_name, email };
        return profile;
    }

    async addPatientToTherapist(patientDTO: PatientDTO, therapistKeycloakId: string, status: StatusType) {
        const patient = await this.patientCRUDService.createPatient(patientDTO);
        const therapist = await this.therapistCRUDService.findTherapist(therapistKeycloakId);
        await this.associationService.createAssociation(therapist, patient, status);

        return patient;
    }

    async getPatientsFromTherapist(keycloakId: string, status: StatusType) {
        const associations: Association[] =
            await this.associationService.getAssociations(keycloakId, status);

        const patientsWithSequence = associations.map(
            (association, index) => ({
                ...association.patient,
                sequence: index + 1,
            }),
        );

        return patientsWithSequence;
    }

    async getPatientWithAssociation({patientId, therapistKeycloakId} : {patientId: string, therapistKeycloakId: string}) {
        const patient = await this.patientCRUDService.getPatient(patientId);
        const therapist = await this.therapistCRUDService.findTherapist(therapistKeycloakId);
        await this.associationService.findAssociation({patientId, therapistId: therapist.id});

        return patient;
    }

    async updateNonRegisteredPatient({
        patientId,
        patientDTO,
        therapistKeycloakId,
        status,
    }: {
        patientId: string;
        patientDTO: PatientDTO;
        therapistKeycloakId: string;
        status: StatusType;
    }) {
        const patient = await this.patientCRUDService.getPatient(patientId);
        if (patient.isRegistered) return; //todo return error

        const therapist = await this.therapistCRUDService.findTherapist(therapistKeycloakId);
        const association = await this.associationService.findAssociation({patientId, therapistId: therapist.id});

        await this.patientCRUDService.updatePatient(
            patientId,
            patientDTO,
        );
        await this.associationService.updateAssociation(association, { status });
    }

    async removeNonRegisteredPatient(patientId: string, therapistKeycloakId: string) {
        const patient = await this.getPatientWithAssociation({patientId, therapistKeycloakId})
        if (patient.isRegistered) return;

        await this.patientCRUDService.removePatient(patientId);
    }
}
