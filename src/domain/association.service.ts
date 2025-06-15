import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { Patient } from "src/patient/entity";
import { Therapist } from "src/therapist/entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Association, StatusType } from "../association/entity";
import { AssociationDTO } from "../association/create.dto";

@Injectable()
export class AssociationService {

    constructor(
        @InjectRepository(Association)
        private readonly associationRepository: Repository<Association>,
    ) {}

    async updateAssociation(association: Association, {status}: { status: StatusType | null }) {
        association.status = status ?? association.status;;
        this.associationRepository.save(association);
    }

    //todo use ids instead of full objects
    async createAssociation(therapist: Therapist, patient: Patient, status: StatusType) {
        const associationDTO: AssociationDTO = {
            therapist: therapist,
            patient: patient,
            status,
            lastStatusChange: new Date(),
        };

        await this.associationRepository.save(associationDTO);
    }

    async getAssociation(patientId: string, therapistId: string) {
        const association = await this.associationRepository.findOne({
            where: { patient: { id: patientId }, therapist: { id: therapistId } },
        });

        if (!association) {
            throw new NotFoundException('Patient-Therapist associationship could not be found');
        }
    }

    //todo check if its more practical to search after therapistKeycloakID instead of therapistId
    async findAssociation({ patientId, therapistId }: { patientId: string; therapistId: string }) {
        const association = await this.associationRepository.findOne({
            where: {
                patient: { id: patientId },
                therapist: { id: therapistId },
            },
        });
        if (!association)
            throw new NotFoundException(
                'Patient-Therapist association not found',
            );
        return association;
    }

    async removeAssociation(patientId: string, therapistId: string) {
        const association = await this.findAssociation({
            patientId: patientId, 
            therapistId: therapistId 
        });

        await this.associationRepository.remove(association);
        return {
            status: HttpStatus.OK,
            message: 'Patient-Therapist association removed',
        };
        
        //todo remove patient in relation
        //const patient = await this.patientService.removePatientIfNotRegistered()
    }

    async getAssociations(therapistKeycloakId: string, status: StatusType) {
        const associations: Association[] =
            await this.associationRepository.find({
                where: { therapist: { keycloakId: therapistKeycloakId }, status },
                relations: ['patient'],
                order: {
                    lastStatusChange: 'ASC',
                },
            });
        return associations;
    }

}