import { ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssociationDTO } from '../association/create.dto';
import { Association, StatusType } from '../association/entity';
        
interface AssociationFilter {
    patientId?: string;
    patientKeycloakId?: string;
    therapistId?: string;
    therapistKeycloakId?: string;
}   

@Injectable()
export class AssociationService {
    constructor(
        @InjectRepository(Association)
        private readonly associationRepository: Repository<Association>,
    ) {}

    async updateAssociation(
        association: Association,
        { status }: { status: StatusType | null },
    ) {
        association.status = status ?? association.status;
        this.associationRepository.save(association);
    }

    //todo use ids instead of full objects
    async createAssociation(
        association: AssociationDTO,
    ) {
        const associationExists = await this.findAssociation({
            patientId: association.patient.id,
            therapistId: association.therapist.id,
        });

        if (associationExists) {
            throw new ConflictException(
                'Patient is already applied to therapist',
            );
        }   

        const associationDTO: AssociationDTO = {
            ...association,
            lastStatusChange: new Date(),
        };

        await this.associationRepository.save(associationDTO);
    }

    async getAssociation(filter: AssociationFilter): Promise<Association> {
        const association = await this.findAssociation(filter);
        if(!association) {
            throw new NotFoundException('Association not found');
        }

        return association;
    }

    async findAssociation(filter: AssociationFilter): Promise<Association | null> {
        const qb = this.associationRepository
            .createQueryBuilder('assoc')
            .leftJoinAndSelect('assoc.patient', 'patient')
            .leftJoinAndSelect('assoc.therapist', 'therapist');

        if (filter.patientId) {
            qb.andWhere('patient.id = :patientId', { patientId: filter.patientId });
        }
        if (filter.patientKeycloakId) {
            qb.andWhere('patient.keycloakId = :patientKeycloakId', {
            patientKeycloakId: filter.patientKeycloakId,
            });
        }
        if (filter.therapistId) {
            qb.andWhere('therapist.id = :therapistId', { therapistId: filter.therapistId });
        }
        if (filter.therapistKeycloakId) {
            qb.andWhere('therapist.keycloakId = :therapistKeycloakId', {
                therapistKeycloakId: filter.therapistKeycloakId,
            });
        }

        const assoc = await qb.getOne();

        return assoc;
    }

    async removeAssociation(patientId: string, therapistId: string) {
        const association = await this.getAssociation({
            patientId: patientId,
            therapistId: therapistId,
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
                where: {
                    therapist: { keycloakId: therapistKeycloakId },
                    status,
                },
                relations: ['patient'],
                order: {
                    lastStatusChange: 'ASC',
                },
            });
        return associations;
    }
}
