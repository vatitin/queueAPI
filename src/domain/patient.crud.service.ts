import {
    ConflictException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PatientDTO } from 'src/patient/create.dto';
import { Patient } from 'src/patient/entity';
import { Repository } from 'typeorm';
import { LocalPatientDTO } from '../patient/create-local.dto';

@Injectable()
export class PatientCRUDService {
    constructor(
        @InjectRepository(Patient)
        private readonly patientRepository: Repository<Patient>,
    ) {}

    async createPatient(patientDTO: PatientDTO) {
        const exists = await this.patientRepository.findOneBy({
            keycloakId: patientDTO.keycloakId,
        });
        if (exists) {
            throw new ConflictException(
                'Patient mit dieser Keycloak-ID existiert bereits',
            );
        }

        const patient = await this.patientRepository.save(patientDTO);
        return patient;
    }

    async existsByKeycloakId(sub: string) {
        const patient = await this.patientRepository.findOneBy({
            keycloakId: sub,
        });
        return !!patient;
    }

    async removePatient(patientId: string) {
        const patient = await this.getPatient(patientId);
        await this.patientRepository.remove(patient);
        return {
            status: HttpStatus.OK,
            message: 'Non registered patient removed successfully',
        };
    }

    async getPatient(id: string) {
        const patient = await this.patientRepository.findOneBy({
            id,
        });
        if (!patient) throw new NotFoundException('Patient could not be found');

        return patient;
    }

    async getPatientByKeycloakId(keycloakId: string) {
        const patient = await this.patientRepository.findOneBy({
            keycloakId,
        });
        if (!patient) throw new NotFoundException('Patient could not be found');

        return patient;
    }

    async createLocalPatient(localPatientDTO: LocalPatientDTO) {
        const patient = await this.patientRepository.save(localPatientDTO);
        return patient;
    }

    async updateLocalPatient(id: string, localPatientDTO: LocalPatientDTO) {
        const patient = await this.getPatient(id);

        if (localPatientDTO.firstName)
            patient.firstName = localPatientDTO.firstName;
        if (localPatientDTO.lastName)
            patient.lastName = localPatientDTO.lastName;
        if (localPatientDTO.email) patient.email = localPatientDTO.email;
        if (localPatientDTO.phoneNumber)
            patient.phoneNumber = localPatientDTO.phoneNumber;

        return await this.patientRepository.save(patient);
    }
}
