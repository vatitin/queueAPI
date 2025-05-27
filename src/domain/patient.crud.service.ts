import {
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from 'src/patient/entity';
import { Repository } from 'typeorm';
import { PatientDTO } from '../patient/create.dto';

@Injectable()
export class PatientCRUDService {

    constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,

) {}

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
            id 
        });
        if (!patient) throw new NotFoundException('Patient could not be found');

        return patient;
    }

    async createPatient(
        patientDTO: PatientDTO,
    ) {
        patientDTO.isRegistered = false;
        const patient = await this.patientRepository.save(patientDTO);

        return patient;
    }

    async updatePatient(
        id: string,
        patientDTO: PatientDTO,
    ) {
        const patient = await this.getPatient(id);

        if (patientDTO.firstName) patient.firstName = patientDTO.firstName;
        if (patientDTO.lastName) patient.lastName = patientDTO.lastName;
        if (patientDTO.email) patient.email = patientDTO.email;
        if (patientDTO.phoneNumber)
            patient.phoneNumber = patientDTO.phoneNumber;

        return await this.patientRepository.save(patient);
    }
}