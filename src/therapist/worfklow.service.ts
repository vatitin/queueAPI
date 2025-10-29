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
import { PatientDTO } from 'src/patient/create.dto';
import { TherapistUpdateDTO } from './update.dto';
import { CreateTherapistCommentDto } from 'src/comment/create-therapist-comment.dto';
import { TherapistCommentService } from 'src/domain/therapist-comment.service';

@Injectable()
export class TherapistWorkflowService {
    constructor(
        @InjectRepository(Therapist)
        private readonly therapistRepository: Repository<Therapist>,
        private readonly therapistCRUDService: TherapistCRUDService,
        private readonly patientCRUDService: PatientCRUDService,
        private readonly associationService: AssociationService,
        private readonly commentService: TherapistCommentService,

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
        const therapist = await this.therapistRepository.save(therapistDTO);
        return therapist;
    }

    async getProfile(keycloakUser: KeycloakUserDTO) {

        const therapist = await this.therapistCRUDService.getTherapistByKeycloakId(keycloakUser.sub);
        if (!therapist) throw new BadRequestException('Therapist could not be found');

        return therapist;
    }

    async updateMyProfile(keycloakId: string, dto: TherapistUpdateDTO) {
    const entity = await this.therapistRepository.findOne({ where: { keycloakId } });
    if (!entity) throw new NotFoundException('Therapist could not be found');

    const {
        firstName,
        lastName,
        addressLine1,
        addressLine2,
        city,
        postalCode,
    } = dto;

    if (firstName !== undefined)  entity.firstName   = firstName;
    if (lastName  !== undefined)  entity.lastName    = lastName;
    
    if (addressLine1 !== undefined) entity.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) entity.addressLine2 = addressLine2;
    if (city !== undefined)         entity.city         = city;
    if (postalCode !== undefined)   entity.postalCode   = postalCode;

    await this.therapistRepository.save(entity);
    return entity;
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

    async updatePatientStatus({
        patientId,
        therapistKeycloakId,
        newStatus,
    }: {
        patientId: string;
        therapistKeycloakId: string;
        newStatus: StatusType;
    }) {
        const association = await this.associationService.getAssociation({
            patientId,
            therapistKeycloakId,
        });

        if (!association) {
            throw new NotFoundException('Patient not found for this therapist');
        }

        association.status = newStatus;
        association.lastStatusChange = new Date();
        await this.associationService.updateAssociation(association, {status: newStatus})
    }

    async updateLocalPatient({
        patientId,
        localPatientDTO,
    }: {
        patientId: string;
        localPatientDTO: LocalPatientDTO;
        therapistKeycloakId: string;
    }) {
        const patient = await this.patientCRUDService.getPatient(patientId);
        if (patient.keycloakId) return; //todo return error

        await this.patientCRUDService.updateLocalPatient(
            patientId,
            localPatientDTO,
        );
    }

    async removeAssociation(
        patientId: string,
        therapistKeycloakId: string,
    ) {
        return await this.associationService.removeAssociation(patientId, therapistKeycloakId);
    }

    async createAssociationComment(params: {
        associationId: string;
        therapistKeycloakId: string;
        dto: CreateTherapistCommentDto;
    }) {
        const { associationId, therapistKeycloakId, dto } = params;
        return await this.commentService.createForAssociation({
            associationId,
            therapistKeycloakId,
            text: dto.text.trim(),
        });
    }

    async listAssociationComments(params: {
        associationId: string;
        therapistKeycloakId: string;
    }) {
        const { associationId, therapistKeycloakId } = params;
        return await this.commentService.listForAssociation({ associationId, therapistKeycloakId });
    }

    async updateAssociationComment(params: {
        commentId: string;
        therapistKeycloakId: string;
        dto: CreateTherapistCommentDto; // Reuse DTO for update
    }) {
        const { commentId, therapistKeycloakId, dto } = params;
        return await this.commentService.update({
            commentId,
            therapistKeycloakId,
            text: dto.text.trim(),
        });
    }

    async removeAssociationComment(params: {
        commentId: string;
        therapistKeycloakId: string;
    }) {
        const { commentId, therapistKeycloakId } = params;
        return await this.commentService.remove({
            commentId,
            therapistKeycloakId,
        });
  }
}
