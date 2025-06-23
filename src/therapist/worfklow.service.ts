import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Association, StatusType } from 'src/association/entity';
import { AssociationService } from 'src/domain/association.service';
import { PatientCRUDService } from 'src/domain/patient.crud.service';
import { KeycloakUserDTO } from 'src/keycloak-user.dto';
import { LocalPatientDTO } from 'src/patient/create-local.dto';
import { TherapistFormDTO } from 'src/therapist/TherapistFormDTO.entity';
import { TherapistDTO } from 'src/therapist/create.dto';
import { Therapist } from 'src/therapist/entity';
import { Repository } from 'typeorm';
import { TherapistCRUDService } from '../domain/therapist.crud.service';
import { AssociationDTO } from 'src/association/create.dto';
import { Patient } from 'src/patient/entity';

@Injectable()
export class TherapistWorkflowService {
    constructor(
        @InjectRepository(Therapist)
        private readonly therapistRepository: Repository<Therapist>,
        @InjectRepository(Patient)
        private readonly patientRepository: Repository<Patient>,

        private readonly therapistCRUDService: TherapistCRUDService,
        private readonly patientCRUDService: PatientCRUDService,
        private readonly associationService: AssociationService,
    ) {}

    async hasLocalTherapist(keycloakUser: KeycloakUserDTO) {
        const { sub } = keycloakUser;
        const therapist = await this.therapistRepository.findOne({
            where: { keycloakId: sub },
        });

        if (!therapist) return false;
        return true;
    }

    async createTherapist(
        keycloakUser: KeycloakUserDTO,
        therapistFormDTO: TherapistFormDTO,
    ) {
        if (await this.hasLocalTherapist(keycloakUser)) {
            throw new BadRequestException(
                'Therapist already exists for this user',
            );
        }
        const { sub, email } = keycloakUser;
        const therapistDTO: TherapistDTO = {
            keycloakId: sub,
            email,
            firstName: therapistFormDTO.firstName,
            lastName: therapistFormDTO.lastName,
            addressLine1: therapistFormDTO.addressLine1,
            addressLine2: therapistFormDTO.addressLine2,
            city: therapistFormDTO.city,
            postalCode: therapistFormDTO.postalCode,
            location: therapistFormDTO.location,
        };
        const therapist = this.therapistRepository.create(therapistDTO);
        return therapist;
    }

    async getProfile(keycloakUser: KeycloakUserDTO) {

        const therapist = await this.therapistCRUDService.getTherapistByKeycloakId(keycloakUser.sub);
        if (!therapist) throw new BadRequestException('Therapist could not be found');

        const profile = { 
            email: keycloakUser.email,
            firstName: therapist.firstName,
            lastName: therapist.lastName, 
        };

        return profile;
    }

    async addPatientToTherapist(
        localPatientDTO: LocalPatientDTO,
        therapistKeycloakId: string,
        status: StatusType,
    ) {
        const patient =
            await this.patientCRUDService.createLocalPatient(localPatientDTO);
        const therapist =
            await this.therapistCRUDService.getTherapistByKeycloakId(
                therapistKeycloakId,
            );
        const association: AssociationDTO = {
            therapist,
            patient,
            status,
            comment: localPatientDTO.comment,
            lastStatusChange: new Date(),
        }

        await this.associationService.createAssociation(
            association
        );

        console.log('createAssciation ', association);

        return patient;
    }

    async getPatientsFromTherapist(keycloakId: string, status: StatusType) {
        const associations: Association[] =
            await this.associationService.getAssociations(keycloakId, status);

        const patientsWithSequence = associations.map((association, index) => ({
            ...association,
            sequence: index + 1,
        }));

        return patientsWithSequence;
    }

    async getPatientWithAssociation({
        patientId,
        therapistKeycloakId,
    }: {
        patientId: string;
        therapistKeycloakId: string;
    }) {

        const association = await this.associationService.getAssociation({
            patientId,
            therapistKeycloakId,
        });

        return association.patient;
    }

    async updateNonRegisteredPatient({
        patientId,
        localPatientDTO,
        therapistKeycloakId,
        status,
    }: {
        patientId: string;
        localPatientDTO: LocalPatientDTO;
        therapistKeycloakId: string;
        status: StatusType;
    }) {
        const patient = await this.patientCRUDService.getPatient(patientId);
        if (patient.keycloakId) return; //todo return error

        const association = await this.associationService.getAssociation({
            patientId,
            therapistKeycloakId
        });

        await this.patientCRUDService.updateLocalPatient(
            patientId,
            localPatientDTO,
        );
        await this.associationService.updateAssociation(association, {
            status,
        });
    }

    async removeNonRegisteredPatient(
        patientId: string,
        therapistKeycloakId: string,
    ) {
        const association: Association = await this.associationService.getAssociation({
            patientId,
            therapistKeycloakId
        });

        if (!association) {
            throw new NotFoundException('Patient gehört nicht zu diesem Therapeuten');
        }
        console.log("therapistKeycloakId: ", therapistKeycloakId)
        console.log("patientId: ", patientId)
        console.log("patient: ", association.patient)
        if (association.patient.keycloakId) {
            throw new BadRequestException(
            'Cannot delete registered patient; only manually added patients may be removed.',
            );
        }
        await this.patientRepository.remove(association.patient);
    }
}
