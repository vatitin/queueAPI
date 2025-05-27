import {
    BadRequestException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNotEmpty } from 'class-validator';
import { PatientTherapistDTO } from 'src/therapist/controllers/therapist/DTO/PatientTherapistDTO.entity';
import { Patient } from 'src/therapist/entity/Patient.entity';
import {
    PatientTherapist,
    StatusType,
} from 'src/therapist/entity/PatientTherapist.entity';
import { Therapist } from 'src/therapist/entity/Therapist.entity';
import { Repository } from 'typeorm';


@Injectable()
export class PatientService {

    constructor(
        @InjectRepository(Patient)
        private readonly patientRepository: Repository<Patient>,

        @InjectRepository(Therapist)
        private readonly therapistRepository: Repository<Therapist>,

        @InjectRepository(PatientTherapist)
        private readonly patientTherapistRepository: Repository<PatientTherapist>,
    ) {}

}
