import {
    BadRequestException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PatientTherapistDTO } from 'src/therapist/controllers/therapist/DTO/PatientTherapistDTO.entity';
import { Patient } from 'src/therapist/entity/Patient.entity';
import {
    PatientTherapist,
    StatusType,
} from 'src/therapist/entity/PatientTherapist.entity';
import { Therapist } from 'src/therapist/entity/Therapist.entity';
import { Repository } from 'typeorm';
import { TherapistFormDTO } from 'src/therapist/controllers/therapist/DTO/TherapistFormDTO.entity';
import { PatientDTO } from 'src/therapist/controllers/therapist/DTO/PatientDTO.entity';

@Injectable()
export class TherapistService {

    constructor(
        @InjectRepository(Patient)
        private readonly patientRepository: Repository<Patient>,

        @InjectRepository(Therapist)
        private readonly therapistRepository: Repository<Therapist>,

        @InjectRepository(PatientTherapist)
        private readonly patientTherapistRepository: Repository<PatientTherapist>,
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
        const { sub } = keycloakUser;
        const therapistDTO = {
            keycloakId: sub,
            firstName: therapistFormDTO.firstName,
            lastName: therapistFormDTO.lastName,
            address: therapistFormDTO.address,
        }
        const therapist = await this.therapistRepository.save(therapistDTO);
        return therapist;
    }

    async findTherapist(keycloakId: string) {
        let therapist = await this.therapistRepository.findOne({
            where: { keycloakId },
        });
        if (!therapist) {
            throw new NotFoundException('Therapist not found');
        }
        return therapist;
    }

    async createPatient(
        patientDTO: PatientDTO,
        therapistKeycloakId: string,
        status: StatusType,
    ) {
        patientDTO.isRegistered = false;
        const therapist = await this.findTherapist(therapistKeycloakId);

        const patient = await this.patientRepository.save(patientDTO);

        const patientTherapistDTO: PatientTherapistDTO = {
            therapist: therapist,
            patient: patient,
            status,
            lastStatusChange: new Date(),
        };

        await this.patientTherapistRepository.save(patientTherapistDTO);
        return patient;
    }

    async findPatientTherapist(patientId: string, therapistId: string) {
        const patientTherapist = await this.patientTherapistRepository.findOne({
            where: {
                patient: { id: patientId },
                therapist: { id: therapistId },
            },
        });
        if (!patientTherapist)
            throw new NotFoundException(
                'Patient-Therapist relationship not found',
            );
        return patientTherapist;
    }

    async updatePatient(
        id: string,
        patientDTO: PatientDTO,
        keycloakId: string,
        status: StatusType,
    ) {
        const { patient, patientTherapist } = await this.getPatient(
            id,
            keycloakId,
        );
        if (status) {
            patientTherapist.status = status;
            this.patientTherapistRepository.save(patientTherapist);
        }
        if (patientDTO.firstName) patient.firstName = patientDTO.firstName;
        if (patientDTO.lastName) patient.lastName = patientDTO.lastName;
        if (patientDTO.email) patient.email = patientDTO.email;
        if (patientDTO.phoneNumber)
            patient.phoneNumber = patientDTO.phoneNumber;

        return await this.patientRepository.save(patient);
    }

    async getProfile(keycloakUser: KeycloakUser) {
        if (!keycloakUser)
            throw new BadRequestException('Therapist could not be found');

        const { family_name, given_name, email } = keycloakUser;
        const profile = { family_name, given_name, email };
        return profile;
    }

    async getPatientsFromTherapist(keycloakId: string, status: StatusType) {
        const patientTherapists: PatientTherapist[] =
            await this.patientTherapistRepository.find({
                where: { therapist: { keycloakId }, status },
                relations: ['patient'],
                order: {
                    lastStatusChange: 'ASC',
                },
            });

        const patientsWithSequence = patientTherapists.map(
            (patientTherapist, index) => ({
                ...patientTherapist.patient,
                sequence: index + 1,
            }),
        );

        return patientsWithSequence;
    }

    async getPatient(id: string, keycloakId: string) {
        const patient = await this.patientRepository.findOne({
            where: { id },
        });
        if (!patient) throw new NotFoundException('Patient could not be found');

        const patientTherapist = await this.patientTherapistRepository.findOne({
            where: { patient: { id }, therapist: { keycloakId } },
        });

        if (!patientTherapist)
            throw new NotFoundException(
                'Patient-Therapist relationship could not be found',
            );
        return { patient, patientTherapist };
    }

    async removePatient(patientId: string, therapistId: string) {
        const { patient, patientTherapist } = await this.getPatient(
            patientId,
            therapistId,
        );
        await this.patientTherapistRepository.remove(patientTherapist);
        if (patient.isRegistered) {
            await this.patientRepository.remove(patient);
            return {
                status: HttpStatus.OK,
                message: 'Patient-Therapist relation and patient removed',
            };
        }
        return {
            status: HttpStatus.OK,
            message: 'Patient-Therapist relation removed',
        };
    }
}
